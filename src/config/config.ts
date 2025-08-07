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

export const config = {
  port: PORT,
  host: HOST,
  dbUri: MONGO_URI,
  accessTokenPrivateKey: ACCESS_TOKEN_SECRET,
  refreshTokenPrivateKey: REFRESH_TOKEN_SECRET,
  accessTokenExpire: '15m',
  refreshTokenExpire: '15d',
};
