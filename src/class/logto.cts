import {type LogtoExpressConfig} from '@logto/express';
import { handleAuthRoutes } from '@logto/express';
import { type Express } from 'express';
import 'dotenv/config' 
const config: LogtoExpressConfig = {
  appId: process.env.LOGTO_APP_ID || '',
  appSecret: process.env.LOGTO_APP_SECRET || '',
  endpoint: process.env.LOGTO_ENDPOINT || '',
  baseUrl: process.env.LOGTO_BASE_URL || '', 
};

export default function initLogto(app: Express) {
}
