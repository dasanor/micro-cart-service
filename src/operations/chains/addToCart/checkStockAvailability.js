/**
 * Hook to allow customization of stock check and reservation
 * By default it delegates the responsibility to the StockService
 */
function factory(base) {
  const normalStockStatus = base.db.models.Cart.STOCKSTATUS.NORMAL;
  const reserveStockForMinutes = base.config.get('reserveStockForMinutes');
  return (context, next) => {
    if (context.product.stockStatus === normalStockStatus) {
      base.services.call({
        name: 'stock:stock.reserve'
      }, {
        productId: context.productId,
        quantity: context.quantity,
        warehouseId: context.warehouseId,
        reserveStockForMinutes
      })
        .then(response => {
          if (response && response.ok === false) {
            return next(base.utils.Error(response.error, response.data));
          }
          context.availability = response;
          return next();
        })
        .catch(next);
    } else {
      return next();
    }
  };
}

module.exports = factory;
