import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import * as WhatsAppController from "../controllers/WhatsAppController";
import * as FlowsController from "../controllers/FlowsController";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);

const ApiRoutes = express.Router();

ApiRoutes.get(
  "/whatsapp/flow/:connectionName",
  isAuthApi,
  FlowsController.connection
);

ApiRoutes.post(
  "/whatsapp/botmessage",
  isAuthApi,
  WhatsAppController.botMessage
);
ApiRoutes.post(
  "/whatsapp/nof/sessionstatus",
  isAuthApi,
  WhatsAppController.nofSessionStatus
);
ApiRoutes.post(
  "/whatsapp/nof/updateqrcode",
  isAuthApi,
  WhatsAppController.nofSessionQRUpdate
);

ApiRoutes.post(
  "/whatsapp/quality",
  isAuthApi,
  WhatsAppController.qualityNumber
);

ApiRoutes.post(
  "/whatsapp/messageStatus",
  isAuthApi,
  WhatsAppController.messageStatus
);

ApiRoutes.post(
  "/whatsapp/newMessage",
  isAuthApi,
  WhatsAppController.newMessage
);

ApiRoutes.get(
  "/verifyImportedFiles",
  isAuthApi,
  ApiController.importDispatcherFileProcess
);

ApiRoutes.get(
  "/dispatcherRegisterProcess",
  isAuthApi,
  ApiController.dispatcherRegisterProcess
);

ApiRoutes.get(
  "/pingConnections",
  isAuthApi,
  ApiController.pingConnections
);

ApiRoutes.post("/send", isAuthApi, upload.array("medias"), ApiController.index);

export default ApiRoutes;
