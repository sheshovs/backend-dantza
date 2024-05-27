import dayjs from "dayjs";
import pg from "../../../config/knex-config.js";
import ImageService from "../Image/image.service.js";

const EventService = {
  createEvent: async (payload) => {
    try {
      return await pg('public.Event').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  createEventImages: async (payload) => {
    try {
      return await pg('public.EventImage').insert(payload).returning('*');
    } catch (error) {
      console.log(error)
    }
  },
  getAllEvents: async () => {
    try {
      const events = await pg('public.Event').select('*').orderBy('date', 'asc');
      await Promise.all(events.map(async event => {
        const images = await pg('public.EventImage').select('*').where('eventId', event.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        event.images = imagesData;
      }))
      return events;
    } catch (error) {
      console.log(error)
    }
  },
  getNextEvents: async () => {
    try {
      const events = await pg('public.Event').select('*').where('date', '>', dayjs().format('YYYY-MM-DD HH:mm')).orderBy('date', 'asc');
      await Promise.all(events.map(async event => {
        const images = await pg('public.EventImage').select('*').where('eventId', event.uuid);
        const imageIds = images.map(image => image.imageId);
        const imagesData = await ImageService.getImagesByIds(imageIds);
        event.images = imagesData;
      }))
      return events;
    } catch (error) {
      console.log(error)
    }
  }
}

export default EventService