const Boom = require('boom');

/**
 * Hook to allow customization of the verification process before adding a product to the cart
 */
function preAddToCart(base) {
  const maxQuantityPerProduct = base.config.get('hooks:preAddToCart:maxQuantityPerProduct');
  const maxNumberOfEntries = base.config.get('hook:preAddToCart:maxNumberOfEntries');
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve, reject) => {
      // maxQuantityPerProduct check
      if (maxQuantityPerProduct) {
        if (data.quantity > maxQuantityPerProduct) {
          return reject(Boom.notAcceptable(`Quantity in cart for this product must be less than or equal to ${maxQuantityPerProduct}`));
        }
      }
      // maxNumberOfEntries check
      if (maxNumberOfEntries) {
        if (data.cart.items.length + 1 > maxNumberOfEntries) {
          return reject(Boom.notAcceptable(`Number of entries must be less than or equal to ${maxNumberOfEntries}`));
        }
        return resolve(data);
      }
      // stockAvailability check
      const stockAvailability = base.services.loadModule('hooks:stockAvailability:handler');
      if (stockAvailability) {
        return stockAvailability(data.productId, data.quantity, data.warehouseId).then(response => {
          // TODO verify in which case we return an "error" property
          if (response.error) return reject(Boom.create(response.statusCode, response.message));
          data.availability = response;
          return resolve(data);
        }).catch(error => {
          return reject(error);
        });
      }
      return resolve(data);
    });
  };
}

module.exports = preAddToCart;
