import express from 'express'
import { Request, Response, NextFunction } from 'express';
import { createServer } from 'node:http';
import { createSocket } from './class/io.js';
import DoorsClass from "./class/door/init.js";
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { type LogtoExpressConfig, handleAuthRoutes, withLogto} from '@logto/express';
import 'dotenv/config' 
const PORT = process.env.PORT
const config: LogtoExpressConfig = {
  appId: process.env.LOGTO_APP_ID || '',
  appSecret: process.env.LOGTO_APP_SECRET || '',
  endpoint: process.env.LOGTO_ENDPOINT || '',
  baseUrl: process.env.LOGTO_BASE_URL || '', 
};
const app = express();
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || '' , cookie: { maxAge: 14 * 24 * 60 * 60 } }));
app.use(handleAuthRoutes(config));
app.use(withLogto(config));
const nodeServer = createServer(app);

const Doors = new DoorsClass();
const io = createSocket(nodeServer, Doors)

app.get('/', (req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(`<div><a href="/logto/sign-in">Sign In</a></div>`);
});
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.isAuthenticated) {
    res.redirect('/logto/sign-in');
  }

  next();
};
app.get('/user', (req, res) => {
  res.json(req.user);
});
app.get('/protected', requireAuth, (req, res) => {
  res.end('protected resource');
});
// app.get('/', (_req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

nodeServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
