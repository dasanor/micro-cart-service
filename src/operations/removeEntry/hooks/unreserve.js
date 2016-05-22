const boom = require('boom');

/**
 * Hook to allow customization of stock unreservation
 * By default it delegates the responsibility to the StockService
 */
function stockAvailability(base) {
  return (data /* cart, entry */) => {
    return base.services.call('stock:unreserve', {
      reserveId: data.entry.reserves[0].id,
      quantity: data.entry.reserves[0].quantity
    }).then(response => {
      if (response.code === 402) {
        base.logger.warn(`[cart] unreserve failed because the reserve '${data.entry.reserves[0].id}' was already expired`);
        return data;
      }
      if (response.code) {
        throw (boom.create(response.statusCode, response.message));
      }
      return data;
    });
  };
}

module.exports = stockAvailability;
