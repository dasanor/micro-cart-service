/**
 * Actions after the cart was stored
 */
function factory(base) {
  const cartsChannel = base.config.get('channels:carts');
  return (context, next) => {
    base.events.send(cartsChannel, 'ADDTOCART', {
      cart: context.cart.toObject({ virtuals: true }),
      addedEntries: context.addedEntries
    });
    next();
  };
}

module.exports = factory;
