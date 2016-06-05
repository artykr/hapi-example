'use strict';

const api = require('test/helpers.js')['api'];
const server = require('src/api');
const db = require('src/models');
const httpOptions = {
  url: '/tasks',
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
};

describe('/tasks/{taskId} API endpoint', function() {
  describe('when non authorized', function() {
    it('should respond with 401', function() {
      return expect(api(server, httpOptions))
        .to.eventually.have.property('statusCode').that.equals(401);
    });
  });

  describe('when authorized', function() {

    let token = '';
    let userId = 0;
    let taskId = 0;

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
        return db.Task.create({
          title: 'Buy milk',
          complete: false,
          UserId: user.id,
        });
      }).then(function(task) {
        taskId = task.id;
      }).catch((err) => { console.log(err); });
    });

    // GET request for a single task
    describe('when GET request arrives for a given task', function() {
      before('adjust HTTP url', function() {
        httpOptions.url = '/tasks/' + taskId;
      });

      it('should respond with 200 OK json content-type', function() {
        return api(server, httpOptions).then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers).to.have.property('content-type');
          expect(response.headers['content-type']).to.contain('json');
        });
      });

      it('should contain a payload with a json-encoded task',
        function() {
          return api(server, httpOptions).then(function(response) {
            let result = JSON.parse(response.payload);
            expect(result).to.be.an('object');
            expect(result).to.have.property('title')
              .that.is.a('string');
            expect(result).to.have.property('id')
              .that.is.a('number');
            expect(result).to.have.property('complete')
              .that.is.a('boolean');
          });
        }
      );
    });

    // PATCH request to update a task
    describe('when PATCH request arrives for a given task', function() {
      describe('with correct task payload', function() {
        before('adjust HTTP method', function() {
          httpOptions.url = '/tasks/' + taskId;
          httpOptions.method = 'PATCH';
          let task = {
            complete: true,
          };
          httpOptions.payload = task;
        });

        it('should respond with 200 OK json', function() {
          return api(server, httpOptions).then(function(response) {
            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.have.property('content-type');
            expect(response.headers['content-type']).to.contain('json');

            let result = JSON.parse(response.payload);
            expect(result).to.have.property('complete')
              .that.is.a('boolean')
              .that.equals(true);
          });
        });
      });
    });

    // DELETE request to remove a task
    describe('when DELETE request arrives for a given task', function() {
      describe('with correct task payload', function() {
        before('adjust HTTP method', function() {
          httpOptions.url = '/tasks/' + taskId;
          httpOptions.method = 'DELETE';
          httpOptions.payload = undefined;
        });

        it('should respond with 204 OK json', function() {
          return api(server, httpOptions).then(function(response) {
            expect(response.statusCode).to.equal(204);
            db.Task.findById(taskId).then(function(task) {
              expect(task).to.equal(null);
            });
          });
        });
      });
    });
  });
});
