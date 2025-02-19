import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("IntegratedImports", "body", {
      type: DataTypes.TEXT({ length: "long" })
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("IntegratedImports", "body");
  }
};
