const base = require('microbase')();

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add operations
base.services.addOperationsFromFolder();

module.exports = base;