const boom = require('boom');

/**
 * Hook to allow customization of the product availability check
 * By default it delegates the responsibility to the CatalogService
 */
function factory(base) {
  const discontinuedStockStatus = base.db.models.Cart.STOCKSTATUS.DISCONTINUED;
  return (context, next) => {
    base.services.call({
      name: 'catalog:getProduct',
      method: 'GET',
      path: `/product/${context.productId}?fields=-variants`
    }, {})
      .then(response => {
        if (response && response.error && response.statusCode === 404) {
          return next(boom.notAcceptable('Product not found'));
        }
        if (response && response.error) {
          return next(boom.create(response.statusCode, response.message));
        }
        if (response.stockStatus === discontinuedStockStatus) {
          return next(boom.notAcceptable('Product discontinued'));
        }
        context.product = response;
        return next();
      });
  };
}

module.exports = factory;
