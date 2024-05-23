import pg from "../../../config/knex-config.js";


const ImageService = {
  async createImage(payload) {
    try {
      const [newImage] = await pg('public.Image').insert(payload).returning('*');
      return newImage;
    } catch (error) {
      console.log(error)
    }
  },
  async getImagesByIds(imageIds) {
    try {
      return await pg('public.Image').select('*').whereIn('uuid', imageIds);
    } catch (error) {
      console.log(error)
    }
  }
}

export default ImageService;