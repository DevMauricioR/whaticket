import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Flows", "agentId", {
      type: DataTypes.STRING
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Flows", "agentId");
  }
};
