const boom = require('boom');

/**
 * Hook to allow customization of stock unreserve
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  return (context, next) => {
    context.entry.reserves.forEach(reserve => {
      base.services.call({
        name: 'stock:unreserve',
        method: 'PUT',
        path: `/reserve/${reserve.id}`
      }, {
        unreserveQuantity: reserve.quantity
      })
        .then(response => {
          console.log(response);
          if (response && response.code === 402) {
            base.logger.warn(`[cart] unreserve failed because the reserve '${context.entry.reserves[0].id}' was already expired`);
            return next();
          }
          if (response && response.code) {
            return next(boom.create(response.statusCode, response.message));
          }
          next();
        })
        .catch(error => {
          base.logger.error(`[cart] unreserving '${reserve.id}`, error);
          next(error);
        });
    });
  };
}

module.exports = factory;
