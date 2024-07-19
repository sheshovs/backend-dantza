import { v4 as uuidv4 } from 'uuid';
import EventService from './event.service.js';
import ImageController from '../Image/image.controller.js';
import ImageService from '../Image/image.service.js';

const EventController = {
  Create: async (req, res) => {
    const { name, description, location, date, mainImageName } = req.body;
    if(!name || !description || !location || !date || !mainImageName) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const eventPayload = {
      uuid: uuidv4(),
      name,
      description,
      location,
      date
    }

    try {
      const [eventData] = await EventService.createEvent(eventPayload);

      const imagesDataEvent = [];

      if(req.files && req.files.images){
        const { images } = req.files;
        const imagesData = await ImageController.uploadMultiple({
          files: images,
          mainImageName
        })

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
          ...eventData,
          imagesUploaded: imagesDataEvent
      });
    } catch (error) {
      console.log(error)
    }
  },
  Update: async (req, res) => {
    const { uuid } = req.params;
    const event = await EventService.getEventByUuid(uuid);

    if(!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const { name, description, location, date, imagesUploaded, mainImageName } = req.body;
    const eventPayload = {
      name: name || event.name,
      description: description || event.description,
      location: location || event.location,
      date: date || event.date
    }

    const [eventData] = await EventService.updateEvent(uuid, eventPayload);
    let imagesToDelete = []

    if(Array.isArray(imagesUploaded) && imagesUploaded.length > 0) {
      imagesToDelete = event.imagesUploaded.filter(image => !imagesUploaded.includes(image.uuid));
    } else {
      imagesToDelete = event.imagesUploaded.filter(image => image.uuid !== imagesUploaded);
    }

    await Promise.all(imagesToDelete.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    const images = req.files?.images;
    let imagesData = [];
    const eventImagesUploaded = await EventService.getEventImages(eventData.uuid);
    if(images){
      imagesData = await ImageController.updateUploadedImages({
        images: eventImagesUploaded,
        newImages: images,
        mainImageName,
      })
      const eventImagesPayload = imagesData.map(image => {
        return {
          eventId: eventData.uuid,
          imageId: image.uuid
        }
      })
      await EventService.createEventImages(eventImagesPayload);
    } else {
      const formatedMainImageName = mainImageName.replaceAll(' ', '_');
      const mainImage = eventImagesUploaded.find(image => image.isMain);
      if(mainImageName && mainImage && !formatedMainImageName.includes(mainImage.name)) {
        await ImageService.updateMainImage(mainImage.uuid, false);
        event.imagesUploaded = event.imagesUploaded.map(image => {
          if(image.uuid === newMainImage.uuid) {
            image.isMain = false;
          }
          return image;
        })
      }
      const newMainImage = eventImagesUploaded.find(image => formatedMainImageName.includes(image.name));
      await ImageService.updateMainImage(newMainImage.uuid, true);
      event.imagesUploaded = event.imagesUploaded.map(image => {
        if(image.uuid === newMainImage.uuid) {
          image.isMain = true;
        }
        return image;
      })
    }

    const eventImages = [...event.imagesUploaded.filter(image => !imagesToDelete.includes(image.uuid)), ...imagesData];

    res.status(200).json({
        ...eventData,
        imagesUploaded: eventImages
    })
  },
  Delete: async (req, res) => {
    const { uuid } = req.params;
    const event = await EventService.getEventByUuid(uuid);

    if(!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    await Promise.all(event.imagesUploaded.map(async image => {
      await ImageController.deleteImage(image.uuid);
    }))

    await EventService.deleteEvent(uuid);

    res.status(200).json({ message: "Evento eliminado" });
  },
  GetAll: async (req, res) => {
    const data = await EventService.getAllEvents();
    res.status(200).json([...data]);
  },
  GetNextEvents: async (req, res) => {
    const data = await EventService.getNextEvents();
    res.status(200).json(data);
  }
}

export default EventController;