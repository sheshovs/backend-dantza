import {v4 as uuidv4} from 'uuid';
import S3Service from "../S3/S3.service.js";
import ImageService from "./image.service.js";

const ImageController = {
  async upload(req, res) {
    const { file } = req.files;

    const uuid = uuidv4()

    const imageData = await S3Service.uploadFile(uuid, file);

    const payload = {
      uuid,
      name: imageData.name,
      url: imageData.url
    }

    const resData = await ImageService.createImage(payload);

    res.status(200).json({
      data: resData
    });
  }
}

export default ImageController;