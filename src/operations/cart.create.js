const moment = require('moment');

/**
 * ## `cart.create` operation factory
 *
 * Creates a new Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const cartExpirationMinutes = base.config.get('cartExpirationMinutes');
  const op = {
    // TODO: create the stock JsonSchema
    handler: ({ userId }, reply) => {
      const cart = new base.db.models.Cart({
        userId: userId || 'anonymous',
        expirationTime: moment().add(cartExpirationMinutes, 'minutes').toDate(),
        items: [],
        total: 0.00
      });
      cart.save()
        .then(savedCart => {
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(`[cart] cart ${savedCart._id} created`);
          }
          return reply(base.utils.genericResponse({ cart: savedCart.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
