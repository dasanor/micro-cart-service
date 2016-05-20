const base = require('micro-base')();

// Register model(s)
require(base.config.get('models:cartModel'))(base);

// Add operations
base.services.add(require('./operations/new')(base));
base.services.add(require('./operations/get')(base));
base.services.add(require('./operations/addEntry')(base));
base.services.add(require('./operations/removeEntry')(base));
