import { Sequelize, Op } from "sequelize";
import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

const ListCompanyService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        "$Company.id$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Company.id")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { id: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ]
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereCondition,
    attributes: [
      "id",
      "alias",
      "name",
      "cnpj",
      "phone",
      "email",
      "address",
      "logo"
    ],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Menu,
        as: "menus",
        attributes: ["id", "name", "icon", "isParent", "parentId"]
      }
    ]
  });

  const hasMore = count > offset + companies.length;

  return {
    companies,
    count,
    hasMore
  };
};

export default ListCompanyService;
