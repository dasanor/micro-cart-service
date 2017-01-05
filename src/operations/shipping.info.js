/**
 * ## `shipping.info` operation factory
 *
 * Gets information about a Shipping Method
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
module.exports = (base) => {
  return {
    handler: ({ shippingId }, reply) => {
      base.db.models.Shipping
        .findById(shippingId)
        .exec()
        .then((shipping) => {
          if (!shipping) throw base.utils.Error('shipping_method_not_found');
          return reply(base.utils.genericResponse({ shipping: shipping.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
};

