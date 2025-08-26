import * as dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || 'localhost';
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-payroll';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '';

// AWS Configs
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

export const config = {
  port: PORT,
  host: HOST,
  dbUri: MONGO_URI,
  accessTokenPrivateKey: ACCESS_TOKEN_SECRET,
  refreshTokenPrivateKey: REFRESH_TOKEN_SECRET,
  accessTokenExpire: '15m',
  refreshTokenExpire: '15d',
  aws: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    bucketName: AWS_BUCKET_NAME,
  },
};
