global.config = {};
global.config.application =
    require('src/config/application.js');
global.chai = require('chai');
global.chaiAsPromised = require('chai-as-promised');
global.chai.use(global.chaiAsPromised);
global.should = global.chai.should;
global.expect = global.chai.expect;
