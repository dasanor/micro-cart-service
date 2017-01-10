/**
 * Hook to allow customization of stock unreserve
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  const unreserveURI = base.config.get('services:uris:stock.unreserve');
  return (context, next) => {
    // Asynchrony revert the reserves
    // TODO: Change to messaging
    context.reserves.forEach(reserve => {
      base.services.call({
        name: unreserveURI
      }, {
        reserveId: reserve.id,
        unreserveQuantity: reserve.quantity
      })
        .then(response => {
          if (response.ok === false) {
            return base.logger.warn(`[cart] unreserve '${reserve.id}' failed because '${response.error}`);
          }
        })
        .catch(error => {
          base.logger.error(`[cart] unreserving '${reserve.id}`, error);
        });
    });
    return next();
  };
}

module.exports = factory;
