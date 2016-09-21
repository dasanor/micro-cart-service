const base = require('microbase')();

// Register model(s)
require(base.config.get('models:cartModel'))(base);
require(base.config.get('models:taxModel'))(base);

// Add operations
base.services.addOperation(require('./operations/new')(base));
base.services.addOperation(require('./operations/get')(base));
base.services.addOperation(require('./operations/addEntry')(base));
base.services.addOperation(require('./operations/removeEntry')(base));
base.services.addOperation(require('./operations/taxes/createTax')(base));
base.services.addOperation(require('./operations/taxes/cartTaxes')(base));

module.exports = base;