/**
 * Hook to allow customization of stock unreserve
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  return (context, next) => {
    // Asynchrony revert the reserves
    // TODO: Change to messaging
    context.entry.reserves.forEach(reserve => {
      base.services.call({
        name: 'stock:stock.unreserve'
      }, {
        reserveId: reserve.id,
        unreserveQuantity: reserve.quantity
      })
        .then(response => {
          // { ok: false, error: 'reserve_expired' }
          if (response.ok === false && response.error === 'reserve_expired') {
            base.logger.warn(`[cart] unreserve failed because the reserve '${context.entry.reserves[0].id}' was already expired`);
            return next();
          }
          return next();
        })
        .catch(error => {
          base.logger.error(`[cart] unreserving '${reserve.id}`, error);
        });
    });
  };
}

module.exports = factory;
