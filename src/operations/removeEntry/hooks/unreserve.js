const boom = require('boom');

/**
 * Hook to allow customization of stock unreserve
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  return (context, next) => {
    const config = {
      name: 'stock:unreserve',
      path: `/reserve/${context.entry.reserves[0].id}`,
      method: 'PUT'
    };
    base.services.call(config, {
      quantity: context.entry.reserves[0].quantity
    }).then(response => {
      if (response.code === 402) {
        base.logger.warn(`[cart] unreserve failed because the reserve '${context.entry.reserves[0].id}' was already expired`);
        return next();
      }
      if (response.code) {
        return next(boom.create(response.statusCode, response.message));
      }
      next();
    });
  };
}

module.exports = factory;
