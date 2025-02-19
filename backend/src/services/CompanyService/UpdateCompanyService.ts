import * as Yup from "yup";
import Company from "../../database/models/Company";

import AppError from "../../errors/AppError";
import ShowCompanyService from "./ShowCompanyService";

interface CompanyData {
  name?: string;
  id: number;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  menusIds?: string;
  alias?: string;
  logo?: string;
}
interface Request {
  companyData: CompanyData;
  companyId: string | number;
}
interface Response {
  name: string;
  id: number;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  alias: string;
  logo: string;
}

const UpdateCompanyService = async ({
  companyData,
  companyId
}: Request): Promise<Response | Company> => {
  const company = await ShowCompanyService(companyId);

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    id: Yup.number()
  });

  const {
    name,
    id,
    alias,
    cnpj,
    phone,
    email,
    address,
    menusIds = [],
    logo
  } = companyData;

  try {
    await schema.validate({ name, id, alias, cnpj, phone, email, address });
  } catch (err) {
    throw new AppError(err.message);
  }

  await company.update({
    name,
    id,
    alias,
    cnpj,
    phone,
    email,
    address,
    logo
  });

  if (menusIds.length > 0) {
    await company.$set("menus", menusIds);
  }

  await company.reload();

  const serializedCompany = {
    name: company.name,
    id: company.id,
    alias: company.alias,
    cnpj: company.cnpj,
    phone: company.phone,
    email: company.email,
    address: company.address,
    logo: company.logo
  };

  return serializedCompany;
};

export default UpdateCompanyService;
