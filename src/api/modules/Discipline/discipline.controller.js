import {v4 as uuidv4} from 'uuid';
import DisciplineService from './discipline.service.js';
import ImageController from '../Image/image.controller.js';

const DisciplineController = {
  Create: async (req, res) => {
    const { name, description, schedule } = req.body;
    if(!name || !description || !schedule) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const { images } = req.files;
    if(images.length === 0) {
      return res.status(400).json({ message: "Faltan imágenes" });
    }

    const disciplinePayload = {
      uuid: uuidv4(),
      name,
      description,
      schedule
    }

    const [disciplineData] = await DisciplineService.createDiscipline(disciplinePayload);

    const imagesData = await ImageController.uploadMultiple(images)

    const disciplineImagesPayload = imagesData.map(image => {
      return {
        disciplineId: disciplineData.uuid,
        imageId: image.uuid
      }
    })

    await DisciplineService.createDisciplineImages(disciplineImagesPayload);

    res.status(200).json({
      data: {
        ...disciplineData,
        images: imagesData
      }
    });
  },
  GetAll: async (req, res) => {
    const data = await DisciplineService.getAllDisciplines();
    res.status(200).json(data);
  },
  GetByUuid: async (req, res) => {
    const { uuid } = req.params;
    const data = await DisciplineService.getDisciplineByUuid(uuid);
    res.status(200).json(data);
  }
}

export default DisciplineController;