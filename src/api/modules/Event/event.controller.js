import { v4 as uuidv4 } from 'uuid';
import EventService from './event.service.js';
import ImageController from '../Image/image.controller.js';

const EventController = {
  Create: async (req, res) => {
    const { name, description, location, date } = req.body;
    if(!name || !description || !location || !date) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const eventPayload = {
      uuid: uuidv4(),
      name,
      description,
      location,
      date
    }

    const [eventData] = await EventService.createEvent(eventPayload);

    const imagesDataEvent = [];

    if(req.files && req.files.images){
      const { images } = req.files;
      const imagesData = await ImageController.uploadMultiple(images)

      const eventImagesPayload = imagesData.map(image => {
        return {
          eventId: eventData.uuid,
          imageId: image.uuid
        }
      })
      await EventService.createEventImages(eventImagesPayload);

      imagesDataEvent.push(imagesData);
    }


    res.status(200).json({
      data: {
        ...eventData,
        images: imagesDataEvent
      }
    });
  },
  GetAll: async (req, res) => {
    const data = await EventService.getAllEvents();
    res.status(200).json(data);
  },
  GetNextEvents: async (req, res) => {
    const data = await EventService.getNextEvents();
    res.status(200).json(data);
  }
}

export default EventController;