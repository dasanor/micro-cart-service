const country = require('countryjs');

/**
 * ## `cart.setShippingAddress` operation factory
 *
 * Sets the Cart Shipping Address
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  // Patch Scotland
  const s = country.info('GB')
  s.ISO = { 2: 'GB2', 3: 'GBR2', alpha2: 'GB2', alpha3: 'GBR3' };

  return {
    validator: {
      schema: require(base.config.get('schemas:setShippingAddress'))
    },
    handler: ({ cartId, address }, reply) => {
      // Validate country/state
      const cartCountry = country.info(address.country);
      if (!cartCountry) {
        return reply(base.utils.genericResponse(null,
          base.utils.Error('invalid_country', { location: address.country })));
      }
      if (address.state && cartCountry.provinces.indexOf(address.state) === -1) {
        return reply(base.utils.genericResponse(null,
          base.utils.Error('invalid_state', { location: address.state })));
      }

      base.services
        .call({ name: 'cart:shipping.addressMethods' }, { address })
        .then((response) => {
          if (response.ok === false) throw new Error(response.error);
          if (response.methods.length === 0) throw base.utils.Error('no_suitable_shipping_method');
          const updateObject = { shippingAddress: address };
          if (response.methods.length === 1) {
            updateObject.shippingMethod = response.methods[0];
          }
          return base.db.models.Cart
            .findOneAndUpdate({ _id: cartId }, updateObject, { new: true })
            .exec()
            .then((savedCart) => {
              if (!savedCart) throw base.utils.Error('cart_not_found', { cartId });
              if (base.logger.isDebugEnabled()) {
                base.logger.debug(`[cart] shipping address set to ${savedCart._id}`);
              }
              return reply(base.utils.genericResponse({ cart: savedCart.toClient(), methods: response.methods }));
            })
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
}
;
