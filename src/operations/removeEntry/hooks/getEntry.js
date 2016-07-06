const boom = require('boom');

/**
 * Retrieve the cart and the entry
 */
function factory(base) {
  return (context, next) => {
    // Find the Cart
    base.db.models.Cart
      .findById(context.cartId)
      .exec()
      .then(cart => {
        // Check cart existance
        if (!cart) return next(boom.notFound('Cart not found'));
        // Check entry existence
        const entry = cart.items.find(e => e.id === context.entryId);
        if (!entry) return next(boom.notFound('Entry not found'));
        // return the cart
        context.cart = cart;
        context.entry = entry;
        next();
      });
  };
}

module.exports = factory;
