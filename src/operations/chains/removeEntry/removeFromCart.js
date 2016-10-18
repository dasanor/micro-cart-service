/**
 * Removes an item from the cart
 */
function factory(/* base */) {
  return (context, next) => {
    context.cart.items = context.cart.items.filter(e => e.id !== context.entry.id);
    next();
  };
}

module.exports = factory;
