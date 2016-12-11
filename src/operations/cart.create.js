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
  const defaultCustomer = base.config.get('defaultCustomer');
  const defaultCurrency = base.config.get('defaultCurrency');
  const defaultChannel = base.config.get('defaultChannel');
  const op = {
    // TODO: create the stock JsonSchema
    handler: ({ customerId, currency, channel }, reply) => {
      const cart = new base.db.models.Cart({
        customerId: customerId || defaultCustomer,
        currency: currency || defaultCurrency,
        channel: channel || defaultChannel,
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
