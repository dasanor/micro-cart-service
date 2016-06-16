const moment = require('moment');
const boom = require('boom');

/**
 * ## `new` operation factory
 *
 * Creates the new Cart operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const cartExpirationMinutes = base.config.get('cartExpirationMinutes');
  /**
   * ## cart.new service
   *
   * Creates a new cart
   */
  const op = {
    name: 'new',
    path: '',
    handler: (msg, reply) => {
      const cart = new base.db.models.Cart({
        userId: msg.userId || 'anonymous',
        expirationTime: moment().add(cartExpirationMinutes, 'minutes').toDate(),
        items: [],
        total: 0.00
      });
      cart.save()
        .then(savedCart => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[cart] cart ${savedCart._id} created`);
          return reply(savedCart.toClient()).code(201);
        })
        .catch(error => {
          base.logger.error(error);
          return reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
