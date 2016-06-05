'use strict';

const api = require('test/helpers.js')['api'];
const server = require('src/api');
const db = require('src/models');
const parse = require('parse-link-header');

const httpOptions = {
  url: '/tasks',
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
};
const maxResults = 20; // Maximum number of tasks to generate
const pageSize = 5; // Number of tasks per page for paginated results

describe('/tasks API endpoint', function() {
  describe('when non authorized', function() {
    it('should respond with 401', function() {
      return expect(api(server, httpOptions))
        .to.eventually.have.property('statusCode').that.equals(401);
    });
  });

  describe('when authorized', function() {

    let token = '';
    let userId = 0;

    // Prepare the DB
    before('clear the db and create a dummy user', function() {
      return db.Task.drop()
      .then(function() {
        return db.User.drop();
      }).then(function() {
        return db.User.sync({ force: true });
      }).then(function() {
        return db.Task.sync({ force: true });
      }).then(function() {
        return db.User.generateToken();
      }).then(function(newToken) {
        token = newToken;
        httpOptions.headers.authorization = 'Bearer ' + token;
        return db.User.create({
          email: 'test@test.com',
          password: 'test',
          token: newToken,
        });
      }).then(function(user) {
        userId = user.id;
        let tasks = [];

        for (let i = 0; i < maxResults; ++i) {
          tasks.push({
            title: 'Task number ' + i,
            complete: false,
            UserId: user.id,
          });
        }

        return db.Task.bulkCreate(tasks);
      }).catch((err) => { console.log(err); });
    });

    it('should respond with 200 OK', function() {
      return expect(api(server, httpOptions))
        .to.eventually.have.property('statusCode').that.equals(200);
    });

    // GET request for a collection
    describe('when GET request arrives', function() {
      it('should respond with 200 OK json content-type', function() {
        return api(server, httpOptions).then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers).to.have.property('content-type');
          expect(response.headers['content-type']).to.contain('json');
        });
      });

      it('should contain a correct count header', function() {
        return api(server, httpOptions).then(function(response) {
          expect(response.headers).to.have.property('x-total-count');
          expect(response.headers['x-total-count']).to.equal(maxResults);
        });
      });

      it('should contain a payload with a json-encoded list of tasks',
        function() {
          return api(server, httpOptions).then(function(response) {
            let result = JSON.parse(response.payload);
            expect(result).to.be.an('array');
            expect(result)
              .to
              .have
              .length(server.settings.app.paginationPerPageDefault);
            expect(result).to.have.deep.property('[0].title')
              .that.is.a('string');
            expect(result).to.have.deep.property('[0].id')
              .that.is.a('number');
            expect(result).to.have.deep.property('[0].complete')
              .that.is.a('boolean');
          });
        }
      );
    });

    // Paginated results
    describe('when paginated request arrives', function() {
      describe('when results fit in one page', function() {
        before('set page size to maxResults', function() {
          httpOptions.url = '/tasks?page=0&per_page=' + maxResults;
        });

        it('should respond without a Link header', function() {
          return api(server, httpOptions).then(function(response) {
            expect(response.headers).not.to.have.property('links');
          });
        });
      });

      describe('when requesting a first page of results', function() {
        before('set page size to pageSize', function() {
          httpOptions.url = '/tasks?page=0&per_page=' + pageSize;
        });

        it('should respond with a Link header with next and last pages links',
          function() {
            return api(server, httpOptions).then(function(response) {
              expect(response.headers).to.have.property('links');
              const links = parse(response.headers.links);
              expect(links).to.have.property('next');
              expect(links).to.have.property('last');
            });
          }
        );
      });
    });

    // POST request to create a task
    describe('when POST request arrives', function() {
      describe('with correct task payload', function() {
        before('adjust HTTP method', function() {
          httpOptions.method = 'POST';
          let task = {
            title: 'Buy bread',
            complete: false,
          };
          httpOptions.payload = task;
        });

        it('should respond with 201 OK json and Location header', function() {
          return api(server, httpOptions).then(function(response) {
            expect(response.statusCode).to.equal(201);
            expect(response.headers).to.have.property('content-type');
            expect(response.headers['content-type']).to.contain('json');
            expect(response.headers).to.have.property('location');
          });
        });

        it('should create a new task and give it back json-encoded',
          function() {
            return api(server, httpOptions).then(function(response) {
              let result = JSON.parse(response.payload);
              expect(result).to.be.an('object');
              expect(result).to.have.property('title')
                .that.is.a('string')
                .that.equals('Buy bread');
              expect(result).to.have.property('complete')
                .that.is.a('boolean')
                .that.equals(false);
              expect(result).to.have.property('id')
                .that.is.a('number');
            });
          }
        );

        it('should create a task belonging to the authenticated user',
          function() {
            return api(server, httpOptions).then(function(response) {
              let result = JSON.parse(response.payload);
              db.Task.findById(result.id).then(function(task) {
                expect(task).to.have.property('UserId')
                  .that.equals(userId);
              });
            });
          }
        );
      }); // End of correct json payload

      describe('with incorrect task payload', function() {
        before('adjust HTTP method', function() {
          httpOptions.method = 'POST';
          let task = {
            foo: 'bar',
          };
          httpOptions.payload = task;
        });

        it('should return an error', function() {
          return api(server, httpOptions).then(function(response) {
            expect(response.statusCode).to.equal(400);
          });
        });
      }); // End of incorrect task payload

    }); // End of POST request arrives
  });
});
