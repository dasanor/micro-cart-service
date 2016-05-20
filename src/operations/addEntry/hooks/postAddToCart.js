const Boom = require('boom');

/**
 * Hook to allow customization of the verification process after adding a product to the cart
 */
function postAddToCart(base) {
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve /* , reject*/) => {
      return resolve(data);
    });
  };
}

module.exports = postAddToCart;
