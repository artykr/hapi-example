'use strict';

const Db = require('src/models');

module.exports = function(token, callback) {

  // For convenience, the request object can be accessed
  // from `this` within validateFunc.
  let request = this;

  Db.User.findOne({
    where: {
      token: token,
    },
  }).then(function(result) {
    let authFlag = false;
    let userId = 0;

    if (result !== null) {
      authFlag = true;
      userId = result.id;
    }

    callback(null, authFlag, { userId: userId });
  }).catch((err) => {
    callback(err);
  });
};
