import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../database/models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: string | number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  companyId
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  await CheckContactOpenTickets(contactId);

  const { isGroup } = await ShowContactService(contactId);

  const { id }: Ticket = await defaultWhatsapp.$create("ticket", {
    contactId,
    status,
    isGroup,
    userId,
    companyId
  });

  const ticket = await Ticket.findByPk(id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
