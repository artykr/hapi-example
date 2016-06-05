'use strict';

// Do not use sensitive data such as passwords here directly.
// Move them to an .env file instead

module.exports = {
  host: process.env.NODE_HOST,
  port: process.env.PORT || 8000,
  paginationPerPageDefault: 5, // Default page size when paginating results
};
