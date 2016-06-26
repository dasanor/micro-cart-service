const Boom = require('boom');

/**
 * Hook to allow customization of the verification process before adding a product to the cart
 */
function preAddToCart(base) {

  const maxQuantityPerProduct = base.config.get('hooks:preAddToCart:maxQuantityPerProduct');
  const maxNumberOfEntries = base.config.get('hooks:preAddToCart:maxNumberOfEntries');
  const stockAvailability = base.utils.loadModule('hooks:stockAvailability:handler');
  const productAvailability = base.utils.loadModule('hooks:productAvailability:handler');
  const normalStockStatus = base.db.models.Cart.STOCKSTATUS.NORMAL;
  const discontinuedStockStatus = base.db.models.Cart.STOCKSTATUS.DISCONTINUED;

  return (data /* cart, productId, quantity, warehouseId */) => {
    return Promise.resolve(data)
      .then(data => {
        // maxQuantityPerProduct check
        if (maxQuantityPerProduct) {
          const totalProductQuantity = data.cart.items.reduce((total, item) => {
            return total + (item.productId === data.productId ? item.quantity : 0);
          }, data.quantity);
          if (totalProductQuantity > maxQuantityPerProduct) {
            throw Boom.notAcceptable(`Quantity in cart for this product must be less or equal than '${maxQuantityPerProduct}'`);
          }
        }
        // maxNumberOfEntries check
        if (maxNumberOfEntries) {
          if (data.cart.items.length + 1 > maxNumberOfEntries) {
            throw Boom.notAcceptable(`Number of entries must be less or equal than '${maxNumberOfEntries}'`);
          }
        }
        return data;
      })
      .then(data => {
        // Check products
        return productAvailability(data.productId)
          .then(response => {
            if (response && response.error && response.statusCode === 404) {
              throw Boom.notAcceptable('Product not found');
            }
            if (response && response.error) {
              throw Boom.create(response.statusCode, response.message);
            }
            if (response.stockStatus === discontinuedStockStatus) {
              throw Boom.notAcceptable('Product discontinued');
            }
            data.product = response;
            return data;
          });
      })
      .then(data => {
        if (stockAvailability && data.product.stockStatus === normalStockStatus) {
          // stockAvailability check
          return stockAvailability(data.productId, data.quantity, data.warehouseId)
            .then(response => {
              if (response && response.error) throw Boom.create(response.statusCode, response.message);
              data.availability = response;
              return data;
            });
        }
        return data;
      })
      .then(data => {
        // Final response to addEntry
        return data;
      });
  };
}

module.exports = preAddToCart;
