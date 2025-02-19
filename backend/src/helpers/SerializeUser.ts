import Company from "../database/models/Company";
import Queue from "../database/models/Queue";
import User from "../database/models/User";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  lang: string;
  queues: Queue[];
  companyId: number;
  company?: Company;
}

export const SerializeUser = (user: User): SerializedUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    lang: user.lang,
    queues: user.queues,
    companyId: user.companyId
  };
};
