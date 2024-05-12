import pg from "../../../config/knex-config.js";


const ImageService = {
  async createImage(payload) {
    try {
      const [newImage] = await pg('public.Image').insert(payload).returning('*');
      return newImage;
    } catch (error) {
      console.log(error)
    }
  }
}

export default ImageService;