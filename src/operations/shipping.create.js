const isoCurrencies = require('currency-format');
const isoCountries = require('i18n-iso-countries');

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
  return {
    validator: {
      schema: require(base.config.get('schemas:createShipping'))
    },
    handler: (msg, reply) => {
      // Validate ISO codes
      for (const lr of msg.rates) {
        for (const location of lr.locations) {
          if (!isoCountries.alpha2ToNumeric(location.country)) {
            return reply(base.utils.genericResponse(null,
              base.utils.Error('location_contry_invalid', { location: location.country })));
          }
        }
        for (const rate of lr.rates) {
          if (!isoCurrencies[rate.currency]) {
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
