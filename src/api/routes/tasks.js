'use strict';

const db = require('src/models');
const taskController = require('src/api/controllers/task.js');
const chalk = require('chalk');
const Joi = require('joi');
const _ = require('underscore');

module.exports = function() {
  return [
    {
      method: 'GET',
      path: '/tasks',
      handler: taskController.listTasksAction,
      config: {
        auth: 'simple',
        description: 'Lists all tasks',
        validate: {
          payload: false, // No payload allowed
          query: {
            page: Joi.number().integer().min(0).optional(),
            per_page: Joi.number().integer().positive().min(2).optional(),
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/tasks/{taskId}',
      handler: taskController.removeTaskAction,
      config: {
        auth: 'simple',
        description: 'Remove a task',
        validate: {
          params: {
            taskId: Joi.number().integer().positive().greater(0),
          },
          payload: false, // No payload allowed
        },
      },
    },
    {
      method: 'GET',
      path: '/tasks/{taskId}',
      handler: taskController.viewTaskAction,
      config: {
        auth: 'simple',
        description: 'View a task',
        validate: {
          params: {
            taskId: Joi.number().integer().positive().greater(0),
          },
          payload: false, // No payload allowed
        },
      },
    },
    {
      method: 'PATCH',
      path: '/tasks/{taskId}',
      handler: taskController.updateTaskAction,
      config: {
        auth: 'simple',
        description: 'Update a task',
        validate: {
          params: {
            taskId: Joi.number().integer().positive().greater(0),
          },
          payload: function(value, options, next) {
            // Define a correct task template
            let taskDefaults = {
              title: 'title',
              complete: false,
            };

            // Merge template with values to validate
            const taskValues = _.extend(taskDefaults, value);
            const task = db.Task.build(taskValues);

            // Validate resulting task
            task.validate().then((err) => {
              next(err, value);
            }).catch((err) => {
              next(err, value);
            });
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/tasks',
      handler: taskController.createTaskAction,
      config: {
        auth: 'simple',
        description: 'Creates a task',
        validate: {
          payload: function(value, options, next) {
            const task = db.Task.build(value);
            task.validate().then((err) => {
              next(err, value);
            }).catch((err) => {
              next(err, value);
            });
          },
        },
      },
    },
  ];
}();
