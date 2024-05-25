import {v4 as uuidv4} from 'uuid';
import ImageController from '../Image/image.controller.js';
import TeacherService from './teacher.service.js';

const TeacherController = {
  Create: async (req, res) => {
    const { name, description, disciplines } = req.body;
    if(!name || !description) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const { images } = req.files;
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

      const imagesData = await ImageController.uploadMultiple(images)

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
        data: {
          ...teacherData,
          images: imagesData,
          disciplines: teacherDisciplines
        }
      });
  } catch (error) {
    console.log(error)
  }
  },
  GetAll: async (req, res) => {
    const data = await TeacherService.getAllTeachers();
    res.status(200).json(data);
  },
}

export default TeacherController;