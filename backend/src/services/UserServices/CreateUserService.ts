import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../database/models/User";
import ShowCompanyService from "../CompanyService/ShowCompanyService";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  profile?: string;
  companyId: number | string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  profile = "admin",
  companyId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value, companyId }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      profile,
      companyId
    },
    { include: ["queues"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  let serializedUser = SerializeUser(user);

  if (companyId) {
    const company = await ShowCompanyService(companyId);
    serializedUser = { ...serializedUser, company };
  }

  return serializedUser;
};

export default CreateUserService;
