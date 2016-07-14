const boom = require('boom');

/**
 * ## `removeEntry` operation factory
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  const removeFromCartChain = new base.utils.Chain().use('removeFromCartChain');

  /**
   * ## cart.removeEntry service
   *
   * Removes an entry from the Cart
   */
  const op = {
    name: 'removeEntry',
    path: '/{cartId}/entry/{entryId}',
    method: 'DELETE',
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        entryId: msg.entryId
      };
      removeFromCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) base.logger.debug(`[cart] entry '${context.entry.id}' removed from cart '${context.cart._id}'`);
          return reply().code(204);
        })
        .catch(error => {
          // Handle errors, rolling back if necessary
          if (error.isBoom) return reply(error);
          base.logger.error(error);
          return reply(boom.wrap(error));
        });

    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
