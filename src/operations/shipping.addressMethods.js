/**
 * ## `shipping.addressMethods` operation factory
 *
 * Gets the Shipping Methods available for one address
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  return {
    handler: ({ address }, reply) => {
      base.db.models.Shipping
        .find({
          'rates.locations.country': address.country,
          active: true
        })
        .lean()
        .exec()
        .then((result) => {
          if (result.length === 0) throw base.utils.Error('no_suitable_shipping_method');
          const methods = [];
          for (const sm of result) {
            const method = { title: sm.title, taxCode: sm.taxCode };
            let lastPickType = 0;
            for (const rate of sm.rates) {
              let pickType = 0;
              for (const loc of rate.locations) {
                if (loc.country === address.country && !loc.state) {
                  pickType = 1;
                }
                if (loc.country === address.country && loc.state && address.state && loc.state === address.state) {
                  pickType = 2;
                }
              }
              if (lastPickType < pickType) {
                method.rates = rate.rates;
                lastPickType = pickType;
              }
            }
            if (method.rates) {
              methods.push(method);
            }
          }
          return reply(base.utils.genericResponse({ methods }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
};

