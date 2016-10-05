const base = require('microbase')();

// Register model(s)
require(base.config.get('models:cartModel'))(base);

// Add operations
base.services.addOperation(require('./operations/new')(base));
base.services.addOperation(require('./operations/get')(base));
base.services.addOperation(require('./operations/addEntry')(base));
base.services.addOperation(require('./operations/removeEntry')(base));

module.exports = base;