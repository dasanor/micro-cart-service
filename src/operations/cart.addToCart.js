/**
 * ## `cart.addToCart` operation factory
 *
 * Creates the addToCart Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const onError = base.utils.loadModule('addToCartOnError');
  const addToCartChain = new base.utils.Chain().use('addToCartChain');
  const op = {
    validator: {
      schema: require(base.config.get('schemas:addToCart')),
    },
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        items: msg.items,
        newReserves: []
      };
      addToCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(
              `[cart] added ${msg.items.length} item(s) to cart ${context.cart._id}`
            );
          }
          return reply(base.utils.genericResponse({ cart: context.cart.toClient() }));
        })
        .catch(error => {
          // Handle errors, rolling back if necessary
          onError(context, error, msg, reply);
        });
    }
  };

  return op;
}

module.exports = opFactory;
