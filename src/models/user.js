'use strict';
let crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Task, { as: 'Tasks' });
      },
      generateToken: function() {
        return new Promise(function(resolve, reject) {
          crypto.randomBytes(48, function(ex, buf) {
            let token = buf.toString('hex');
            resolve(token);
          });
        });
      },
    },
  });
  return User;
};
