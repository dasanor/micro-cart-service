const boom = require('boom');

/**
 * ## `removeEntry` operation factory
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## cart.removeEntry service
   *
   * Removes an entry from the Cart
   */
  const op = {
    name: 'removeEntry',
    handler: ({cartId, entryId}, reply) => {
      base.db.models.Cart
         .findById(cartId)
         .exec()
         .then(cart => {
           if (!cart) return reply(boom.notFound('Cart not found'));
           const entry = cart.items.find(e => e.id === entryId);
           if (!entry) return reply(boom.notFound('Entry not found'));
           cart.items = cart.items.filter(e => e.id !== entryId);
           //return cart.save()
           //   .then(() => {
           //     return ({ cart });
           //   });
           return ({ cart });
         })
         .then(data => {
         })
         .then(data => {
           return reply(data.cart);
           //return reply();
         })
         .catch(error => {
           base.logger.error(error);
           reply(Boom.wrap(error));
         });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
