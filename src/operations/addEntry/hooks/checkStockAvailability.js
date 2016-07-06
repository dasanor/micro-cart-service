const boom = require('boom');

/**
 * Hook to allow customization of stock check and reservation
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  const normalStockStatus = base.db.models.Cart.STOCKSTATUS.NORMAL;
  const reserveStockForMinutes = base.config.get('reserveStockForMinutes');
  return (context, next) => {
    if (context.product.stockStatus === normalStockStatus) {
      base.services.call({ name: 'stock:reserve' }, {
        productId: context.productId,
        quantity: context.quantity,
        warehouseId: context.warehouseId,
        reserveStockForMinutes
      })
        .then(response => {
          if (response && response.error) {
            return next(boom.create(response.statusCode, response.message));
          }
          context.availability = response;
          next();
        });
    } else {
      return next();
    }
  };
}

module.exports = factory;
