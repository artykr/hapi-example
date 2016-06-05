'use strict';

const Db = require('src/models');
const Boom = require('boom');
const Pagination = require('src/api/helpers/pagination');

module.exports = {
  listTasksAction: function listTasksAction(request, reply) {

    const perPage = request.query.per_page ||
      request.server.settings.app.paginationPerPageDefault;
    const pageNumber = request.query.page || 0;

    Db.Task.findAndCountAll({
      where: {
        userId: request.auth.credentials.userId,
      },
      limit: perPage,
      offset: pageNumber,
    }).then((tasks) => {

      // Build pagination (link) header
      const links = new Pagination({
        pageNumber: pageNumber,
        totalCount: tasks.count,
        perPage: perPage,
        path: request.path,
      });

      const linksHeaderText = links.stringify();
      const response = reply(tasks.rows);
      response.header('X-Total-Count', tasks.count);

      if (linksHeaderText !== '') {
        response.header('Links', linksHeaderText);
      }

    }).catch((err) => {
      reply(Boom.badImplementation);
    });
  },
  createTaskAction: function createTaskAction(request, reply) {

    const newTask = request.payload;
    newTask.UserId = request.auth.credentials.userId;

    Db.Task.create(newTask, { fields: [ 'title', 'complete', 'UserId' ] })
      .then((task) => {

        reply(task)
          .created(request.server.info.uri + 'tasks/' + task.id);
      }).catch((err) => {

        reply(Boom.badImplementation);
      });
  },
  viewTaskAction: function viewTaskAction(request, reply) {

    Db.Task.findOne({
      where: {
        userId: request.auth.credentials.userId,
        id: request.params.taskId,
      },
    }).then((task) => {

      reply(task);
    }).catch((err) => {

      reply(Boom.badImplementation);
    });
  },
  removeTaskAction: function removeTaskAction(request, reply) {

    // TODO: move findOne call to the prerequisite function
    Db.Task.findOne({
      where: {
        userId: request.auth.credentials.userId,
        id: request.params.taskId,
      },
    }).then((task) => {

      return task.destroy();
    }).then(() => {

      reply().code(204);
    }).catch((err) => {

      reply(Boom.badImplementation);
    });
  },
  updateTaskAction: function updateTaskAction(request, reply) {

    // TODO: move findOne call to the prerequisite function
    Db.Task.findOne({
      where: {
        userId: request.auth.credentials.userId,
        id: request.params.taskId,
      },
    }).then((task) => {

      return task.update(request.payload, { fileds: ['title', 'complete'] });
    }).then((task) => {

      reply(task);
    }).catch((err) => {

      reply(Boom.badImplementation);
    });
  },
};
