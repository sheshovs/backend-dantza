import {v4 as uuidv4} from 'uuid';
import DisciplineService from './discipline.service.js';
import ImageController from '../Image/image.controller.js';

const DisciplineController = {
  Create: async (req, res) => {
    const { name, description, schedule } = req.body;
    if(!name || !description || !schedule) {
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

    const [disciplineData] = await DisciplineService.createDiscipline(disciplinePayload);

    const imagesData = await ImageController.uploadMultiple(images)

    const disciplineImagesPayload = imagesData.map(image => {
      return {
        disciplineId: disciplineData.uuid,
        imageId: image.uuid
      }
    })

    await DisciplineService.createDisciplineImages(disciplineImagesPayload);

    res.status(200).json({
      data: {
        ...disciplineData,
        imagesUploaded: imagesData
      }
    });
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const discipline = await DisciplineService.getDisciplineByUuid(uuid);

    if(!discipline) {
      return res.status(404).json({ message: "Disciplina no encontrada" });
    }

    const { name, description, schedule, imagesUploaded } = req.body;
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

    if(images){
      imagesData = await ImageController.uploadMultiple(images, false);
      const disciplineImagesPayload = imagesData.map(image => {
        return {
          disciplineId: disciplineData.uuid,
          imageId: image.uuid
        }
      })
      await DisciplineService.createDisciplineImages(disciplineImagesPayload);
    }

    const disciplineImages = [...discipline.imagesUploaded.filter(image => imagesToDelete.includes(image.uuid)), ...imagesData];

    res.status(200).json({
      data: {
        ...disciplineData,
        imagesUploaded: disciplineImages
      }
    })
  },
  GetAll: async (req, res) => {
    const data = await DisciplineService.getAllDisciplines();
    res.status(200).json(data);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const data = await DisciplineService.getDisciplineByUuid(uuid);
    res.status(200).json(data);
  }
}

export default DisciplineController;