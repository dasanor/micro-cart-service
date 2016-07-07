/**
 * Actions after the cart was stored
 */
function factory(base) {
  const cartsChannel = base.config.get('bus:channels:carts:name');
  return (context, next) => {
    base.bus.publish(`${cartsChannel}.ADDTOCART`, {
      cart: context.cart.toObject({ virtuals: true }),
      addedEntries: context.addedEntries
    });
    next();
  };
}

module.exports = factory;
