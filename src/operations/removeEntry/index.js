/**
 * ## `cart.removeEntry` operation factory
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
// TODO: Bulk removes, like addEntry
function opFactory(base) {
  const removeFromCartChain = new base.utils.Chain().use('removeFromCartChain');
  const op = {
    name: 'cart.removeEntry',
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        entryId: msg.entryId
      };
      removeFromCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(
              `[cart] entry '${context.entry.id}' removed from cart '${context.cart._id}'`);
          }
          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
