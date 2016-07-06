const boom = require('boom');

/**
 * ## `get` operation factory
 *
 * Creates the get Cart operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  /**
   * ## cart.get service
   *
   * Finds a Cart and returns it
   */
  const op = {
    name: 'get',
    path: '/{cartId}',
    method: 'GET',
    handler: (msg, reply) => {
      base.db.models.Cart
        .findById(msg.cartId)
        .exec()
        .then(cart => {
          if (!cart) return reply(boom.notFound(`Cart '${msg.cartId}' not found`));
          return reply(cart.toClient());
        })
        .catch(error => {
          base.logger.error(error);
          reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
