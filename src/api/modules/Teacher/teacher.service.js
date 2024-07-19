import pg from "../../../config/knex-config.js";
import ImageService from "../Image/image.service.js";

const TeacherService = {
  createTeacher: async (payload) => {
    try {
      return await pg('public.Teacher').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  updateTeacher: async (uuid, payload) => {
    try {
      return await pg('public.Teacher').update(payload).where('uuid', uuid).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAllTeachers: async () => {  
    try {
      const teachers = await pg('public.Teacher').select('*');
      await Promise.all(teachers.map(async teacher => {
        const images = await pg('public.TeacherImage').select('*').where('teacherId', teacher.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        teacher.imagesUploaded = imagesData;

        const disciplines = await pg('public.TeacherDiscipline').select('*').where('teacherId', teacher.uuid);
        const disciplineIds = disciplines.map(discipline => discipline.disciplineId);
        const disciplinesData = await pg('public.Discipline').select('*').whereIn('uuid', disciplineIds);

        teacher.disciplines = disciplinesData;
      }))
      return teachers;
    } catch (error) {
      console.log(error)
    }
  },
  createTeacherImages: async (payload) => {
    try {
      return await pg('public.TeacherImage').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  createTeacherDisciplines: async (payload) => {
    try {
      return await pg('public.TeacherDiscipline').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getTeacherDisciplines: async (teacherId) => {
    try {
      const disciplines = await pg('public.TeacherDiscipline').select('*').where('teacherId', teacherId);
      const disciplineIds = disciplines.map(discipline => discipline.disciplineId);
      const disciplinesData = await pg('public.Discipline').select('*').whereIn('uuid', disciplineIds);
      return disciplinesData;
    } catch (error) {
      console.log(error)
    }
  },
  getTeacherByUuid: async (uuid) => {
    try {
      const teacher = await pg('public.Teacher').select('*').where('uuid', uuid).first();
      const images = await pg('public.TeacherImage').select('*').where('teacherId', teacher.uuid);
      const imageIds = images.map(image => image.imageId);
      const imagesData = await ImageService.getImagesByIds(imageIds);
      teacher.imagesUploaded = imagesData;

      const disciplines = await pg('public.TeacherDiscipline').select('*').where('teacherId', teacher.uuid);
      const disciplineIds = disciplines.map(discipline => discipline.disciplineId);
      const disciplinesData = await pg('public.Discipline').select('*').whereIn('uuid', disciplineIds);

      teacher.disciplines = disciplinesData;

      return teacher;
    } catch (error) {
      console.log(error)
    }
  },
  deleteTeacherDisciplines: async (teacherId, disciplineIds) => {
    try {
      return await pg('public.TeacherDiscipline').delete().where('teacherId', teacherId).whereIn('disciplineId', disciplineIds);
    } catch (error) {
      console.log(error)
    }
  },
  deleteTeacher: async (uuid) => {
    try {
      return await pg('public.Teacher').delete().where('uuid', uuid);
    } catch (error) {
      console.log(error)
    }
  },
  getTeacherImages: async (teacherId) => {
    try {
      const images = await pg('public.TeacherImage').select('*').where('teacherId', teacherId);
      const imageIds = images.map(image => image.imageId);
      const imagesData = await ImageService.getImagesByIds(imageIds);
      return imagesData;
    } catch (error) {
      console.log(error)
    }
  }
}

export default TeacherService;