const raven = require('raven');
const base = require('microbase')({ extra: { raven } });

// Register model(s)
base.utils.loadModulesFromKey('models');

// Add operations
base.services.addOperationsFromFolder();

module.exports = base;