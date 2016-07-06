const Boom = require('boom');

/**
 * Retrieve the cart
 */
function factory(base) {
  return (context, next) => {
    // Find the Cart
    base.db.models.Cart
      .findById(context.cartId)
      .exec()
      .then(cart => {
        // Check cart existance
        if (!cart) return next(Boom.notFound('Cart not found'));
        context.cart = cart;
        return next();
      });
  };
}

module.exports = factory;
