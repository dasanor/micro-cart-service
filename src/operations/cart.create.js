const moment = require('moment');
const countryjs = require('countryjs');

/**
 * ## `cart.create` operation factory
 *
 * Creates a new Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  // Extract currencies
  const cList = countryjs.all()
    .map(c => (c.currencies ? c.currencies[0] : undefined))
    .filter(c => c !== undefined);
  const currencies = cList.reduce((result, c) => {
    result.add(c);
    return result;
  }, new Set());

  // Defaults
  const cartExpirationMinutes = base.config.get('cartExpirationMinutes');
  const defaultCustomer = base.config.get('defaultCustomer');
  const defaultCurrency = base.config.get('defaultCurrency');
  const defaultChannel = base.config.get('defaultChannel');

  return {
    // TODO: create the stock JsonSchema
    handler: ({
      customerId = defaultCustomer,
      currency = defaultCurrency,
      channel = defaultChannel,
      country
    }, reply) => {

      // Validate country
      if (country) {
        const cartCountry = countryjs.info(country);
        if (!cartCountry) {
          return reply(base.utils.genericResponse(null,
            base.utils.Error('invalid_country', { country })));
        }
        if (!cartCountry.currencies || cartCountry.currencies[0] !== currency) {
          return reply(base.utils.genericResponse(null,
            base.utils.Error('invalid_currency', { currency })));
        }
      } else {
        // Validate currency
        if (!currencies.has(currency)) {
          return reply(base.utils.genericResponse(null,
            base.utils.Error('invalid_currency', { currency })));
        }
      }

      const cart = new base.db.models.Cart({
        customerId,
        currency,
        country,
        channel,
        expirationTime: moment().add(cartExpirationMinutes, 'minutes').toDate(),
        items: []
      });
      cart.save()
        .then((savedCart) => {
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(`[cart] cart ${savedCart._id} created`);
          }
          return reply(base.utils.genericResponse({ cart: savedCart.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
};
