'use strict';

const path = require('path');
const basename  = path.basename(module.filename);
const fs = require('fs');
let routes = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    routes[path.basename(file, '.js')] = require(path.join(__dirname, file));
  });

module.exports = routes;
