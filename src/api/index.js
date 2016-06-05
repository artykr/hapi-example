'use strict';

const chalk = require('chalk');
const Hapi = require('hapi');
const AuthBearer = require('hapi-auth-bearer-token');
const config = require('src/config/application.js');
const server = new Hapi.Server({
  app: config,
});
const authValidate = require('src/api/helpers/auth-validate');
const routes = require('src/api/routes');

server.connection({
  port: server.settings.app.port,
  host: server.settings.app.host,
});

server.register(AuthBearer, (err) => {
  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,
    allowMultipleHeaders: false,
    accessTokenName: 'access_token',
    validateFunc: authValidate,
  });
});

for (let route of Object.keys(routes)) {
  server.route(routes[route]);
}

server.start(() => {
  console.log(chalk.green('Server running at:', server.info.uri));
});

module.exports = server;
