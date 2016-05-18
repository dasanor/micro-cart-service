const Boom = require('boom');

/*
 Hook to allow customization of the verification process before adding a product to the cart
 */
function preAddToCart(base) {
  const maxQuantityPerProduct = base.config.get('hooks:preAddEntry:maxQuantityPerProduct');
  return (data /* cart, product, warehouse */) => {
    // TODO Convert to Promises.all
    return new Promise((resolve, reject) => {
      // maxQuantityPerProduct check
      if (maxQuantityPerProduct) {
        let quantity = data.product.quantity;
        const entry = data.cart.entries.find(p => p.code === data.product.code);
        if (entry) {
          quantity += data.product.quantity;
        }
        if (quantity > maxQuantityPerProduct) {
          return reject(Boom.notAcceptable(`Quantity in cart for this product must be less than or equal to ${maxQuantityPerProduct}`));
        }
      }
      // stockAvailability check
      const stockAvailability = base.services.loadModule('hooks:stockAvailability:handler');
      if (stockAvailability) {
        return stockAvailability(data.product, data.warehouse).then(response => {
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
