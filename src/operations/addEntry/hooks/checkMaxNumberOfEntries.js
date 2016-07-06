const Boom = require('boom');

/**
 * Checks the max quantity per Product in a Cart
 */
function factory(base) {
  const maxNumberOfEntries = base.config.get('maxNumberOfEntries');
  return (context, next) => {
    if (maxNumberOfEntries) {
      if (context.cart.items.length + 1 > maxNumberOfEntries) {
        return next(Boom.notAcceptable(`Number of entries must be less or equal than '${maxNumberOfEntries}'`));
      }
      return next();
    } else {
      next();
    }
  };
}

module.exports = factory;
