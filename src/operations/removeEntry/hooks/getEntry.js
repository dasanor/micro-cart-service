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
        if (!cart) {
          return next(base.utils.Error('cart_not_found'));
        }
        // Check entry existence
        const entry = cart.items.find(e => e.id === context.entryId);
        if (!entry) return next(base.utils.Error('entry_not_found'));
        // return the cart and the entry
        context.cart = cart;
        context.entry = entry;
        next();
      });
  };
}

module.exports = factory;
