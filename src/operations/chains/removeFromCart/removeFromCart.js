/**
 * Removes some quantity form a cart item, potentially removing it
 */
function factory(base) {
  return (context, next) => {
    // Checks
    if (context.quantity < 1 || context.quantity > context.itemId.quantity) {
      return next(base.utils.Error('invalid_quantity'));
    }
    // Remove quantity from the item
    context.itemId.quantity -= context.quantity;
    // Loop reserves
    context.reserves = [];
    if (context.itemId.reserves && context.itemId.reserves.length > 0) {
      let quantity = context.quantity;
      for (const reserve of context.itemId.reserves) {
        if (quantity === 0) break;
        // Find available quantity
        const available = reserve.quantity > quantity ? quantity : reserve.quantity;
        // Substract the quantity
        quantity -= available;
        reserve.quantity -= available;
        // Accumulate reserves to unreserve
        context.reserves.push({
          id: reserve.id,
          quantity: available
        });
      }
      context.itemId.reserves = context.itemId.reserves.filter(r => r.quantity > 0);
    }
    // Remove the itemId if necessary
    if (context.itemId.quantity === 0) {
      context.cart.items = context.cart.items.filter(e => e.id !== context.itemId.id);
    }
    next();
  };
}

module.exports = factory;
