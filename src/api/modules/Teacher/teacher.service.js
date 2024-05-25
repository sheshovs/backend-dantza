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
  getAllTeachers: async () => {  
    try {
      const teachers = await pg('public.Teacher').select('*');
      await Promise.all(teachers.map(async teacher => {
        const images = await pg('public.TeacherImage').select('*').where('teacherId', teacher.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        teacher.images = imagesData;

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
  }
}

export default TeacherService;