import 'dotenv/config'
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from 'fs';
import pkg from 'image-to-webp';
const { imageToWebp } = pkg;

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

export const getUrl = (key) => {
  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
}

const S3Controller = {
  async upload(req, res) {
    try {
      const { file } = req.files;
      const { name, tempFilePath } = file;

      const webpFilePath = await imageToWebp(tempFilePath, '80');
      const objetName = `${name.split('.')[0]}.webp`;
      const objectType = 'image/webp';

      const stream = fs.createReadStream(webpFilePath);

      const params = {
        Bucket: AWS_S3_BUCKET,
        Key: objetName,
        Body: stream,
        ContentType: objectType,
      };
      await s3Client.send(
        new PutObjectCommand(params)
      );
      res.status(200).json({
        name: objetName,
        url: getUrl(objetName)
      });
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
    }
  },

}

export default S3Controller;