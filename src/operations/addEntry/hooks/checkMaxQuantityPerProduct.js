const boom = require('boom');

/**
 * Checks the max quantity per Product in a Cart
 */
function factory(base) {
  const maxQuantityPerProduct = base.config.get('maxQuantityPerProduct');
  return (context, next) => {
    if (maxQuantityPerProduct) {
      const totalProductQuantity = context.cart.items.reduce((total, item) => {
        return total + (item.productId === context.productId ? item.quantity : 0);
      }, context.quantity);
      if (totalProductQuantity > maxQuantityPerProduct) {
        return next(boom.notAcceptable(`Quantity in cart (${totalProductQuantity}) for this product ('${context.productId}') must be less or equal than ${maxQuantityPerProduct}`));
      }
      return next();
    }
  };
}

module.exports = factory;
