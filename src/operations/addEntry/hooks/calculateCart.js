const boom = require('boom');

/**
 * Hook to allow customization of Cart calculation
 */
function calculateCart(base) {
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve /* , reject*/) => {

      const total = data.cart.items.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0.00);
      data.cart.total = total;

      return resolve(data);
    });
  };
}

module.exports = calculateCart;
