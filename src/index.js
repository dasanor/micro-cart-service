const base = require('microbase')();

// Register model(s)
require(base.config.get('models:cartModel'))(base);

// Add operations
base.services.addOperationsFromFolder();

module.exports = base;