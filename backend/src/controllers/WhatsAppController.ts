import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import NewMessageWhatsapp from "../services/WhatsappService/NewMessageWhatsappService";
import StatusMessageWhatsappService from "../services/WhatsappService/StatusMessageWhatsappService";
import ListOfficialWhatsAppsService from "../services/WhatsappService/ListOfficialWhatsAppsService";

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  official?: boolean;
  facebookToken?: string;
  facebookPhoneNumberId?: string;
  phoneNumber?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    official,
    facebookToken,
    facebookPhoneNumberId,
    phoneNumber
  }: WhatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    official,
    facebookToken,
    facebookPhoneNumberId,
    phoneNumber
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId
  });

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  await DeleteWhatsAppService(whatsappId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { official } = req.params;

  const whatsapp = await ListOfficialWhatsAppsService(official);

  return res.status(200).json(whatsapp);
};

export const newMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    id,
    fromMe,
    isGroup,
    type,
    to,
    from,
    body,
    contactName,
    identification
  } = req.body;

  const message = await NewMessageWhatsapp({
    id,
    fromMe,
    isGroup,
    type,
    to,
    from,
    body,
    contactName,
    identification
  });

  return res.status(200).json(message);
};

export const messageStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { statusType, msgId, msgWhatsId } = req.body;

  const message = await StatusMessageWhatsappService({ statusType, msgId, msgWhatsId });

  return res.status(200).json(message);
};