import {v4 as uuidv4} from 'uuid';
import ImageController from '../Image/image.controller.js';
import TeacherService from './teacher.service.js';
import ImageService from '../Image/image.service.js';

const TeacherController = {
  Create: async (req, res) => {
    const { name, description, disciplines, mainImageName } = req.body;
    if(!name || !description || !mainImageName) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const images = req.files?.images;
    if(images.length === 0) {
      return res.status(400).json({ message: "Faltan imágenes" });
    }

    const teacherPayload = {
      uuid: uuidv4(),
      name,
      description,
    }

    try {
      const [teacherData] = await TeacherService.createTeacher(teacherPayload);

      const imagesData = await ImageController.uploadMultiple({
        files: images,
        mainImageName
      })

      const teacherImagesPayload = imagesData.map(image => {
        return {
          teacherId: teacherData.uuid,
          imageId: image.uuid
        }
      })

      await TeacherService.createTeacherImages(teacherImagesPayload);

      if(Array.isArray(disciplines)) {
        const teacherDisciplinesPayload = disciplines.map(discipline => {
          return {
            teacherId: teacherData.uuid,
            disciplineId: discipline
          }
        })
  
        await TeacherService.createTeacherDisciplines(teacherDisciplinesPayload);
      } else {
        const teacherDisciplinesPayload = {
          teacherId: teacherData.uuid,
          disciplineId: disciplines
        }

        await TeacherService.createTeacherDisciplines(teacherDisciplinesPayload);
      }

      const teacherDisciplines = await TeacherService.getTeacherDisciplines(teacherData.uuid);

      res.status(200).json({
          ...teacherData,
          imagesUploaded: imagesData,
          disciplines: teacherDisciplines
      });
    } catch (error) {
      console.log(error)
    }
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const teacher = await TeacherService.getTeacherByUuid(uuid);

    if(!teacher) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    const { name, description, disciplines, imagesUploaded, mainImageName } = req.body;
    const teacherPayload = {
      name: name || teacher.name,
      description: description || teacher.description,
    }

    const [teacherData] = await TeacherService.updateTeacher(uuid, teacherPayload);
    let imagesToDelete = []

    if(Array.isArray(imagesUploaded) && imagesUploaded.length > 0) {
      imagesToDelete = teacher.imagesUploaded.filter(image => !imagesUploaded.includes(image.uuid));
    } else {
      imagesToDelete = teacher.imagesUploaded.filter(image => image.uuid !== imagesUploaded);
    }

    await Promise.all(imagesToDelete.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    const images = req.files?.images;
    let imagesData = [];
    const teacherImagesUploaded = await TeacherService.getTeacherImages(teacherData.uuid);
    if(images){
      imagesData = await ImageController.updateUploadedImages({
        images: teacherImagesUploaded,
        newImages: images,
        mainImageName,
      })
      const teacherImagesPayload = imagesData.map(image => {
        return {
          teacherId: teacherData.uuid,
          imageId: image.uuid
        }
      })
      await TeacherService.createTeacherImages(teacherImagesPayload);
    } else {
      const formatedMainImageName = mainImageName.replaceAll(' ', '_');
      const mainImage = teacherImagesUploaded.find(image => image.isMain);
      if(mainImageName && mainImage && !formatedMainImageName.includes(mainImage.name)) {
        await ImageService.updateMainImage(mainImage.uuid, false);
        teacher.imagesUploaded = teacher.imagesUploaded.map(image => {
          if(image.uuid === mainImage.uuid) {
            image.isMain = false;
          }
          return image;
        })
      }
      const newMainImage = teacherImagesUploaded.find(image => formatedMainImageName.includes(image.name));
      await ImageService.updateMainImage(newMainImage.uuid, true);
      teacher.imagesUploaded = teacher.imagesUploaded.map(image => {
        if(image.uuid === newMainImage.uuid) {
          image.isMain = true;
        }
        return image;
      })
    }
    
    const teacherImages = [...teacher.imagesUploaded.filter(image => !imagesToDelete.includes(image.uuid)), ...imagesData];

    let disciplinesToDelete = []
    let disciplinesPayload = []

    const actualTeacherDisciplines = teacher.disciplines.map(discipline => discipline.uuid);

    if(Array.isArray(disciplines) && disciplines.length > 0) {
      disciplinesToDelete = teacher.disciplines.filter(discipline => !disciplines.includes(discipline.uuid));
      disciplinesPayload = disciplines.filter(discipline => !actualTeacherDisciplines.includes(discipline));
    } else {
      disciplinesToDelete = teacher.disciplines.filter(discipline => discipline.uuid !== disciplines);
      disciplinesPayload = actualTeacherDisciplines.includes(disciplines) ? [] : [disciplines];
    }

    if(disciplinesToDelete.length > 0){
      const disciplinesIds = disciplinesToDelete.map(discipline => discipline.uuid);
      await TeacherService.deleteTeacherDisciplines(teacherData.uuid, disciplinesIds);
    }
    
    if(disciplinesPayload.length > 0){
      const teacherDisciplinesPayload = disciplinesPayload.map(discipline => {
        return {
          teacherId: teacherData.uuid,
          disciplineId: discipline
        }
      })

      await TeacherService.createTeacherDisciplines(teacherDisciplinesPayload);
    }

    const teacherDisciplines = await TeacherService.getTeacherDisciplines(teacherData.uuid);

    res.status(200).json({
        ...teacherData,
        imagesUploaded: teacherImages,
        disciplines: teacherDisciplines
    })
  },
  Delete: async (req, res) => {
    const { uuid } = req.params;
    const teacher = await TeacherService.getTeacherByUuid(uuid);

    if(!teacher) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    await Promise.all(teacher.imagesUploaded.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    await TeacherService.deleteTeacher(uuid);

    res.status(200).json({ message: "Profesor eliminado" });
  },
  GetAll: async (req, res) => {
    const data = await TeacherService.getAllTeachers();
    res.status(200).json([...data]);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const data = await TeacherService.getTeacherByUuid(uuid);
    res.status(200).json(data);
  }
}

export default TeacherController;