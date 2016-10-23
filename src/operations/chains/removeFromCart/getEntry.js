/**
 * Retrieve the cart and the itemId
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
        // Check itemId existence
        const itemId = cart.items.find(e => e.id === context.itemId);
        if (!itemId) return next(base.utils.Error('item_not_found'));
        // return the cart and the itemId
        context.cart = cart;
        context.itemId = itemId;
        if (!context.productId) context.productId = itemId.productId;
        next();
      });
  };
}

module.exports = factory;
