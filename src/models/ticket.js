'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recepientEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['PENDING', 'SUCCESS', 'FAILED'],
      defaultValue: 'PENDING',
      allowNull: false
    }
  }, {
    tableName: 'Tickets'
  });
  return Ticket;
};