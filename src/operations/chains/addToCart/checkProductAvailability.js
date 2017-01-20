/**
 * Hook to allow customization of the product availability check
 * By default it delegates the responsibility to the CatalogService
 */
function factory(base) {
  const discontinuedStockStatus = base.db.models.Cart.STOCKSTATUS.DISCONTINUED;
  const productURI = base.config.get('services:uris:product.info');
  return (context, next) => {
    base.services.call({
      name: productURI
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
      })
      .catch(next);
  };
}

module.exports = factory;
