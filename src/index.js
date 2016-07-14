const base = require('microbase')();

// Register model(s)
require(base.config.get('models:cartModel'))(base);
require(base.config.get('models:taxModel'))(base);

// Add operations
base.services.add(require('./operations/new')(base));
base.services.add(require('./operations/get')(base));
base.services.add(require('./operations/addEntry')(base));
base.services.add(require('./operations/removeEntry')(base));
base.services.add(require('./operations/taxes/createTax')(base));
base.services.add(require('./operations/taxes/cartTaxes')(base));

module.exports = base;