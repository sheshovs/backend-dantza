import {v4 as uuidv4} from 'uuid';
import DisciplineService from './discipline.service.js';
import ImageController from '../Image/image.controller.js';
import ImageService from '../Image/image.service.js';

const DisciplineController = {
  Create: async (req, res) => {
    const { name, description, schedule, mainImageName } = req.body;
    if(!name || !description || !schedule || !mainImageName) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const images = req.files?.images;
    if(images.length === 0) {
      return res.status(400).json({ message: "Faltan imágenes" });
    }

    const disciplinePayload = {
      uuid: uuidv4(),
      name,
      description,
      schedule
    }

    try {
      const [disciplineData] = await DisciplineService.createDiscipline(disciplinePayload);

      const imagesData = await ImageController.uploadMultiple({
        files: images,
        mainImageName
      })

      const disciplineImagesPayload = imagesData.map(image => {
        return {
          disciplineId: disciplineData.uuid,
          imageId: image.uuid
        }
      })

      await DisciplineService.createDisciplineImages(disciplineImagesPayload);

      res.status(200).json({
          ...disciplineData,
          imagesUploaded: imagesData
      });
    } catch (error) {
      console.log(error)
    }
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const discipline = await DisciplineService.getDisciplineByUuid(uuid);

    if(!discipline) {
      return res.status(404).json({ message: "Disciplina no encontrada" });
    }

    const { name, description, schedule, imagesUploaded, mainImageName } = req.body;
    const disciplinePayload = {
      name: name || discipline.name,
      description: description || discipline.description,
      schedule: schedule || discipline.schedule
    }

    const [disciplineData] = await DisciplineService.updateDiscipline(uuid, disciplinePayload);
    let imagesToDelete = []

    if(Array.isArray(imagesUploaded) && imagesUploaded.length > 0) {
      imagesToDelete = discipline.imagesUploaded.filter(image => !imagesUploaded.includes(image.uuid));
    } else {
      imagesToDelete = discipline.imagesUploaded.filter(image => image.uuid !== imagesUploaded);
    }

    await Promise.all(imagesToDelete.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    const images = req.files?.images;
    let imagesData = [];
    const disciplineImagesUploaded = await DisciplineService.getDisciplineImages(discipline.uuid);
    if(images){
      imagesData = await ImageController.updateUploadedImages({
        images: disciplineImagesUploaded,
        newImages: images,
        mainImageName,
      });
      const disciplineImagesPayload = imagesData.map(image => {
        return {
          disciplineId: disciplineData.uuid,
          imageId: image.uuid
        }
      })
      await DisciplineService.createDisciplineImages(disciplineImagesPayload);
    } else {
      const formatedMainImageName = mainImageName.replaceAll(' ', '_');
      const mainImage = disciplineImagesUploaded.find(image => image.isMain);
      if(mainImageName && mainImage && !formatedMainImageName.includes(mainImage.name)) {
        await ImageService.updateMainImage(mainImage.uuid, false);
        discipline.imagesUploaded = discipline.imagesUploaded.map(image => {
          if(image.uuid === mainImage.uuid) {
            image.isMain = false;
          }
          return image;
        })
      }
      const newMainImage = disciplineImagesUploaded.find(image => formatedMainImageName.includes(image.name));
      await ImageService.updateMainImage(newMainImage.uuid, true);
      discipline.imagesUploaded = discipline.imagesUploaded.map(image => {
        if(image.uuid === newMainImage.uuid) {
          image.isMain = true;
        }
        return image;
      })
    }

    const disciplineImages = [...discipline.imagesUploaded.filter(image => !imagesToDelete.includes(image.uuid)), ...imagesData];

    res.status(200).json({
        ...disciplineData,
        imagesUploaded: disciplineImages
    })
  },
  Delete: async (req, res) => {
    const { uuid } = req.params;
    const discipline = await DisciplineService.getDisciplineByUuid(uuid);

    if(!discipline) {
      return res.status(404).json({ message: "Disciplina no encontrada" });
    }

    await Promise.all(discipline.imagesUploaded.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    await DisciplineService.deleteDiscipline(uuid);

    res.status(200).json({ message: "Disciplina eliminada" });
  },
  GetAll: async (req, res) => {
    const data = await DisciplineService.getAllDisciplines();
    res.status(200).json([...data]);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const data = await DisciplineService.getDisciplineByUuid(uuid);
    res.status(200).json(data);
  }
}

export default DisciplineController;