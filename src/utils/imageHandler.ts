import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from './aws.config';

export interface UploadedImage {
  imagePath: string;
}

export const handleImageUpload = async (
  file: Express.Multer.File | undefined,
  userId: string
): Promise<UploadedImage> => {
  // Basic validation
  if (!file) {
    throw new Error('No file uploaded.');
  }

  if (file.mimetype !== 'image/jpeg') {
    throw new Error('Invalid file type: Only JPEG images are allowed.');
  }

  // Generate S3 key
  const key = `attendance/${userId}-${Date.now()}.jpg`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  // const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { imagePath: key };
};
