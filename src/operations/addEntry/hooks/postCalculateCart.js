const boom = require('boom');

/**
 * Hook to allow customization of the add to cart process after being calculated
 */
function postCalculateCart(base) {
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve /* , reject*/) => {

      // TODO: Verify total !> maxTotal

      return resolve(data);
    });
  };
}

module.exports = postCalculateCart;
