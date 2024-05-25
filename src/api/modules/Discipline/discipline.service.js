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
  getAllDisciplines: async () => {  
    try {
      const disciplines = await pg('public.Discipline').select('*');
      await Promise.all(disciplines.map(async discipline => {
        const images = await pg('public.DisciplineImage').select('*').where('disciplineId', discipline.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        discipline.images = imagesData;
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
}

export default DisciplineService;