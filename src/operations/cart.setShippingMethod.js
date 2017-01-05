const country = require('countryjs');

/**
 * ## `cart.setShippingMethod` operation factory
 *
 * Sets the Cart Shipping Method
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  return {
    validator: {
      schema: require(base.config.get('schemas:setShippingMethod'))
    },
    handler: ({ cartId, method }, reply) => {
      base.db.models.Cart
        .findOneAndUpdate({ _id: cartId }, { shippingMethod: method }, { new: true })
        .exec()
        .then((savedCart) => {
          if (!savedCart) throw base.utils.Error('cart_not_found', { cartId });
          if (base.logger.isDebugEnabled()) {
            base.logger.debug(`[cart] shipping method set to ${savedCart._id}`);
          }
          return reply(base.utils.genericResponse({ cart: savedCart.toClient() }));
        });
    }
  };
};

