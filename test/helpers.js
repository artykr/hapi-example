'use strict';

module.exports = {
  api: function api(server, httpOptions) { // Promisifies server.inject
    let result = new Promise((resolve, reject) => {
      server.inject(httpOptions, function(response) {
        resolve(response);
      });
    });

    return result;
  },
};
