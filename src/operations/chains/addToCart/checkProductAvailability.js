/**
 * Hook to allow customization of the product availability check
 * By default it delegates the responsibility to the CatalogService
 */
function factory(base) {
  const discontinuedStockStatus = base.db.models.Cart.STOCKSTATUS.DISCONTINUED;
  return (context, next) => {
    base.services.call({
      name: 'catalog:product.info',
      transport: 'amqp'
    }, {
      id: context.productId, fields: '-variants'
    })
      .then(response => {
        if (response && response.ok === false) {
          return next(base.utils.Error(response.error, response.data));
        }
        if (response.product.stockStatus === discontinuedStockStatus) {
          return next(base.utils.Error('product_discontinued', { productId: context.productId }));
        }
        context.product = response.product;
        return next();
      });
  };
}

module.exports = factory;
