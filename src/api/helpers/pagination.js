'use strict';

const internals = {};

internals.Pagination = function(options) {
  this.pageNumber = options.pageNumber;
  this.totalCount = options.totalCount;
  this.perPage = options.perPage;
  this.lastPage = Math.ceil(options.totalCount / options.perPage);
  this.path = options.path;
  this.links = {};
  this.init();
};

internals.Pagination.prototype.init = function() {

  if (this.needsPagination()) {

    if (!this.isAtFirstPage()) {
      this.addLinkToFirstPage();
      this.addLinkToPrevPage();
    }

    if (!this.isAtLastPage()) {
      this.addLinkToLastPage();
      this.addLinkToNextPage();
    }

  }
};

internals.Pagination.prototype.needsPagination = function() {

  return this.totalCount > this.perPage;
};

internals.Pagination.prototype.isAtFirstPage = function() {

  return this.pageNumber === 0;
};

internals.Pagination.prototype.isAtLastPage = function() {

  return this.pageNumber >= this.lastPage;
};

internals.Pagination.prototype.addLinkToFirstPage = function() {

  this.links.first = {
    page: 1,
  };
};

internals.Pagination.prototype.addLinkToLastPage = function() {

  this.links.last = {
    page: this.lastPage,
  };
};

internals.Pagination.prototype.addLinkToPrevPage = function() {

  this.links.prev = {
    page: this.pageNumber - 1,
  };
};

internals.Pagination.prototype.addLinkToNextPage = function() {

  this.links.next = {
    page: this.pageNumber + 1,
  };
};

internals.Pagination.prototype.stringify = function() {

  let result = '';
  for (let rel in this.links) {
    result += '<' + this.path +
      '?page=' + this.links[rel].page +
      '&per_page=' + this.perPage +
      '>; rel="' + rel + '", ';
  }

  if (result.length > 0) {
    result = result.substring(0, result.length - 2);
  }

  return result;
};

module.exports = internals.Pagination;
