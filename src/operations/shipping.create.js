const country = require('countryjs');

/**
 * ## `shipping.create` operation factory
 *
 * Create Ahipping Method operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const shippingChannel = base.config.get('bus:channels:shippings:name');
  const defaultTaxCode = base.config.get('defaultTaxCode');

  // Patch Scotland
  const s = country.info('GB')
  s.ISO = { 2: 'GB2', 3: 'GBR2', alpha2: 'GB2', alpha3: 'GBR3' }

  return {
    validator: {
      schema: require(base.config.get('schemas:createShipping'))
    },
    handler: (msg, reply) => {
      // Validate country/state/currency codes
      for (const lr of msg.rates) {
        const currencyNeeded = new Set();
        for (const location of lr.locations) {
          const c = country.info(location.country);
          if (!c) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_country_invalid', { location: location.country })));
          }
          if (!c.currencies) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_currency_not_configured', { location: location.country })));
          }
          currencyNeeded.add(c.currencies[0]);
          if (location.state && c.provinces.indexOf(location.state) === -1) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_state_invalid', { location: location.state })));
          }
        }
        for (const rate of lr.rates) {
          if (!currencyNeeded.has(rate.currency)) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('rate_currency_not_needed', { rate: rate.currency })));
          }
        }
        for (const cn of currencyNeeded) {
          const c = lr.rates.find(r => r.currency === cn);
          if (!c) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('rate_currency_missing', { currency: cn })));
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
