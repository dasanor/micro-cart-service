const Boom = require('boom');

/**
 * Checks the max quantity per Product in a Cart
 */
function factory(base) {
  const aggregateItems = base.config.get('aggregateItems');
  const maxNumberOfEntries = base.config.get('maxNumberOfEntries');
  return (context, next) => {
    if (maxNumberOfEntries) {
      let newItem = 1;
      if (aggregateItems) {
        newItem = context.cart.items.find(i => i.productId === context.productId) ? 0 : 1;
      }
      if (context.cart.items.length + newItem > maxNumberOfEntries) {
        return next(Boom.notAcceptable(`Number of entries must be less or equal than '${maxNumberOfEntries}'`));
      }
      return next();
    } else {
      next();
    }
  };
}

module.exports = factory;
