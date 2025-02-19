import QuickAnswer from "../../database/models/QuickAnswer";
import AppError from "../../errors/AppError";

const ShowQuickAnswerService = async (
  id: string,
  companyId: string | number
): Promise<QuickAnswer> => {
  const quickAnswer = await QuickAnswer.findOne({ where: { id, companyId } });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  return quickAnswer;
};

export default ShowQuickAnswerService;
