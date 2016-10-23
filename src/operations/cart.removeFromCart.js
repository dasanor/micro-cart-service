/**
 * ## `cart.removeFromCart` operation factory
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
// TODO: Bulk removes, like addToCart
function opFactory(base) {
  const removeFromCartChain = new base.utils.Chain().use('removeFromCartChain');
  const op = {
    validator: {
      schema: require(base.config.get('schemas:removeFromCart')),
    },
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        itemId: msg.itemId,
        quantity: msg.quantity
      };
      removeFromCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(
              `[cart] itemId '${context.itemId.id}' removed from cart '${context.cart._id}'`);
          }
          return reply(base.utils.genericResponse({ cart: context.cart.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
