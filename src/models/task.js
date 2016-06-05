'use strict';

module.exports = function(sequelize, DataTypes) {
  var Task = sequelize.define('Task', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
  }, {
    classMethods: {
      associate: function(models) {
        Task.belongsTo(models.User);
      },
    },
  });
  return Task;
};
