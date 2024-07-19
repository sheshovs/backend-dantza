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
  },
  async uploadMultiple({files, mainImageName, canBeMain = true}) {
    const images = [];

    if(Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uuid = uuidv4();
  
        const imageData = await S3Service.uploadFile(uuid, file);
  
        const payload = {
          uuid,
          name: imageData.name.slice(0,40),
          url: imageData.url,
          isMain: mainImageName.replaceAll(' ', '_').includes(imageData.name) && canBeMain
        }
  
        const resData = await ImageService.createImage(payload);
  
        images.push(resData);
      }
    } else {
      const uuid = uuidv4();

      const imageData = await S3Service.uploadFile(uuid, files);

      const payload = {
        uuid,
        name: imageData.name.slice(0,40),
        url: imageData.url,
        isMain: mainImageName.replaceAll(' ', '_').includes(imageData.name) && canBeMain
      }

      const resData = await ImageService.createImage(payload);

      images.push(resData);
    }
    return images;
  },
  async updateUploadedImages({images, newImages, mainImageName}) {
    const allImages = [];
    const actualMainImage = images.find(image => image.isMain);
    const imageIsStillMain = actualMainImage ? mainImageName.replaceAll(' ', '_').includes(actualMainImage.name) : false;

    if(Array.isArray(newImages)) {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const uuid = uuidv4();
  
        const imageData = await S3Service.uploadFile(uuid, file);    
        const payload = {
          uuid,
          name: imageData.name.slice(0,40),
          url: imageData.url,
          isMain: !imageIsStillMain ? mainImageName === file.name : false
        }
    
        const resData = await ImageService.createImage(payload);
    
        allImages.push(resData);
      }
    } else {
      const uuid = uuidv4();
  
      const imageData = await S3Service.uploadFile(uuid, newImages);
  
      const payload = {
        uuid,
        name: imageData.name.slice(0,40),
        url: imageData.url,
        isMain: !imageIsStillMain ? mainImageName === newImages.name : false
      }
  
      const resData = await ImageService.createImage(payload);
  
      allImages.push(resData);
    }

    if(!imageIsStillMain && actualMainImage) {
      await ImageService.updateMainImage(actualMainImage.uuid, false);
    }

    const newMainImage = allImages.find(image => image.isMain);
    if(!newMainImage) {
      const mainImage = images.find(image => mainImageName.replaceAll(' ', '_').includes(image.name));
      if(mainImage) {
        await ImageService.updateMainImage(mainImage.uuid, true);
      }
    }

    return allImages
  },
  async deleteImage(uuid) {
    const image = await ImageService.getImageByUuid(uuid);

    if(!image) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    const imageKey = image.url.split('amazonaws.com/')[1];

    await S3Service.deleteFile(imageKey);

    await ImageService.deleteImage(uuid);
  }
}

export default ImageController;