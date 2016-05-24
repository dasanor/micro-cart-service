const boom = require('boom');

/**
 * ## `removeEntry` operation factory
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const getCart = base.services.loadModule('hooks:removeEntryGetCart:handler');
  const removeFromCart = base.services.loadModule('hooks:removeEntryRemoveFromCart:handler');
  const unreserve = base.services.loadModule('hooks:unreserve:handler');
  const saveCart = base.services.loadModule('hooks:removeEntrySaveCart:handler');

  /**
   * ## cart.removeEntry service
   *
   * Removes an entry from the Cart
   */
  const op = {
    name: 'removeEntry',
    path: '/{cartId}/removeEntry/{entryId}',
    method: 'DELETE',
    handler: (request, reply) => {
      getCart(request)
        .then(data => removeFromCart(data))
        .then(data => saveCart(data))
        .then(data => unreserve(data))
        .then(data => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled) base.logger.debug(`[cart] entry '${data.entry.id}' removed from cart '${data.cart._id}'`);
          return reply().code(204);
        })
        .catch(error => {
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
