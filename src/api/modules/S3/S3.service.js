import 'dotenv/config'
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from 'fs';
import { getUrl } from './S3.controller.js';

const { AWS_REGION,
  AWS_S3_BUCKET,
  AWS_S3_ACCESS_KEY,
  AWS_S3_SECRET_KEY
 } = process.env;

 const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_KEY,
  },
 });

const S3Service = {
  async uploadFile(uuid, file) {
    try {
      const { name, tempFilePath, mimetype } = file;      

      let objectName = `${name.replaceAll(' ', '_')}`;
      const objectKey = `${uuid}.${mimetype.split('/')[1]}`;

      const params = {
        Bucket: AWS_S3_BUCKET,
        Key: objectKey,
        ContentType: mimetype,
      }

      const stream = fs.createReadStream(tempFilePath);
      params['Body'] = stream;

      await s3Client.send(
        new PutObjectCommand(params)
      );

      return {
        name: objectName,
        url: getUrl(objectKey)
      }

      
    } catch (error) {
      console.log(error)
    }
  }
}

export default S3Service;