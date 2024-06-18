import pg from "../../../config/knex-config.js";
import ImageService from "../Image/image.service.js";

const DisciplineService = {
  createDiscipline: async (payload) => {
    try {
      return await pg('public.Discipline').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  updateDiscipline: async (uuid, payload) => {
    try {
      return await pg('public.Discipline').update(payload).where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAllDisciplines: async () => {  
    try {
      const disciplines = await pg('public.Discipline').select('*');
      await Promise.all(disciplines.map(async discipline => {
        const images = await pg('public.DisciplineImage').select('*').where('disciplineId', discipline.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        discipline.imagesUploaded = imagesData;
      }))
      return disciplines;
    } catch (error) {
      console.log(error)
    }
  },
  createDisciplineImages: async (payload) => {
    try {
      return await pg('public.DisciplineImage').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getDisciplineByUuid: async (uuid) => {
    try {
      const discipline = await pg('public.Discipline').select('*').where('uuid', uuid).first();
      const images = await pg('public.DisciplineImage').select('*').where('disciplineId', discipline.uuid);
      const imageIds = images.map(image => image.imageId);
      const imagesData = await ImageService.getImagesByIds(imageIds);
      discipline.imagesUploaded = imagesData;

      const teachers = await pg('public.TeacherDiscipline').select('*').where('disciplineId', discipline.uuid);
      const teacherIds = teachers.map(teacher => teacher.teacherId);
      const teachersData = await pg('public.Teacher').select('*').whereIn('uuid', teacherIds);
      discipline.teachers = teachersData;

      return discipline;
    } catch (error) {
      console.log(error)
    }
  }
}

export default DisciplineService;