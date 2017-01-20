const country = require('countryjs');

/**
 * ## `shipping.create` operation factory
 *
 * Create Shipping Method operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const shippingChannel = base.config.get('bus:channels:shippings:name');
  const defaultTaxCode = base.config.get('defaultTaxCode');

  // Extract currencies
  const cList = country.all()
    .map(c => (c.currencies ? c.currencies[0] : undefined))
    .filter(c => c !== undefined);
  const currencies = cList.reduce((result, c) => {
    result.add(c);
    return result;
  }, new Set());

  return {
    validator: {
      schema: base.utils.loadModule('schemas:createShipping')
    },
    handler: (msg, reply) => {
      // Validate country/state/currency codes
      for (const lr of msg.rates) {
        for (const location of lr.locations) {
          const c = country.info(location.country);
          if (!c) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_country_invalid', { country: location.country })));
          }
          if (location.state && c.provinces.indexOf(location.state) === -1) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_state_invalid', { country: location.country, state: location.state })));
          }
        }
        for (const rate of lr.rates) {
          if (!currencies.has(rate.currency)) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('rate_currency_invalid', { rate: rate.currency })));
          }
        }
      }
      const shipping = new base.db.models.Shipping({
        title: msg.title,
        active: msg.active || true,
        taxCode: msg.taxCode || defaultTaxCode,
        rates: msg.rates
      });
      shipping.save()
        .then(savedShipping => {
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(`[cart] shipping ${savedShipping._id} created`);
          }
          base.bus.publish(`${shippingChannel}.CREATE`,
            {
              new: savedShipping.toObject({ virtuals: true }),
              data: msg
            }
          );
          return reply(base.utils.genericResponse({ shipping: savedShipping.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
}

// Exports the factory
module.exports = opFactory;
