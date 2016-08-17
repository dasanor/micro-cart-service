/**
 * ## `cart.addEntry` operation factory
 *
 * Creates the addEntry Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const onError = base.utils.loadModule('hooks:onError');
  const addToCartChain = new base.utils.Chain().use('addToCartChain');
  const op = {
    name: 'cart.addEntry',
    schema: require(base.config.get('schemas:addEntry')),
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
          // Fix the response
          return reply(base.utils.genericResponse({ reserves: context.newReserves }));
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
