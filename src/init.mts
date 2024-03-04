import express from "express";
import { NextFunction, Request, Response } from "express";
import { createServer } from "node:http";
import { createSocket } from "./class/io.js";
import { Doors as DoorsInit } from "./class/door/init.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import {
  handleAuthRoutes,
  type LogtoExpressConfig,
  withLogto,
} from "@logto/express";
import "dotenv/config";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the fileURLToPath
const __dirname = path.dirname(__filename); // get the name of the directory
const PORT = process.env.PORT;
const config: LogtoExpressConfig = {
  scopes: ["email"],
  fetchUserInfo: true,
  appId: process.env.LOGTO_APP_ID || "",
  appSecret: process.env.LOGTO_APP_SECRET || "",
  endpoint: process.env.LOGTO_ENDPOINT || "",
  baseUrl: (process.env.LOGTO_BASE_URL || ""),
};
const app = express();
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "",
  cookie: { maxAge: 14 * 24 * 60 * 60 },
}));
app.use(handleAuthRoutes(config));
app.use(withLogto(config));
const nodeServer = createServer(app);
let publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
const Doors = new DoorsInit();
const io = createSocket(nodeServer, Doors);
app.set("view engine", "ejs");
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.isAuthenticated) {
    res.redirect("/logto/sign-in");
  }
  next();
};

function isUserWhitelisted(email: string) {
  if (!email.includes("@")) {
    return false;
  }
  return false;
}

app.get("/", (req, res) => {
  if (req.session.returnTo?.includes("door/")) {
    let url = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(url);
  } else {
    res.render(publicPath + "/home");
  }
});
app.get("/success", requireAuth, (req, res) => {
  res.render(publicPath + "/success", { email: req.user.userInfo?.email });
});

app.get("/fail", requireAuth, (req, res) => {
  res.render(publicPath + "/fail", { email: req.user.userInfo?.email });
});
app.get("/door/:id/:token", (req, res) => {
  const door = Doors.get(req.params.id);
  if (!door) {
    return res.redirect("/");
  }
  const token = door.getToken();
  if (!(token == req.params.token)) {
    return res.redirect("/");
  }

  if (!req.user.isAuthenticated) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/logto/sign-in");
  }
  let email = req.user.userInfo?.email || "";
  if (isUserWhitelisted(email)) {
    door.openDoor();
    return res.redirect("/success");
  } else {
    return res.redirect("/fail");
  }
});

// app.get('/', (_req, res) => {
//   res.send('<h1>Hello world</h1>');
// });
nodeServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
