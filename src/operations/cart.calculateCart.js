/**
 * ## `cart.calculateCart` operation factory
 *
 * Creates the calculateCart Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const addToCartChain = new base.utils.Chain().use('calculateCartChain');
  const op = {
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        items: [],
        newReserves: []
      };
      addToCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(`[cart] cart ${context.cart._id} calculated`);
          }
          return reply(base.utils.genericResponse({ cart: context.cart.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };

  return op;
}

module.exports = opFactory;
