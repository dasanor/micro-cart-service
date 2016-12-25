/**
 * ## `shipping.remove` operation factory
 *
 * Remove Shipping Method operation
 *
 * @param {object} base - The microbase object
 */
module.exports = (base) => {
  // Channel name for publishing
  const shippingChannel = base.config.get('bus:channels:shippings:name');
  return {
    // Main handler, receives the ID to remove
    handler: ({ id }, reply) => {
      base.db.models.Shipping
        .findOneAndRemove({ _id: id })
        .exec()
        .then(removedShipping => {
          if (!removedShipping) throw base.utils.Error('shipping_method_not_found', id);
          if (base.logger.isDebugEnabled()) base.logger.debug(`[cart] shipping method ${removedShipping.id} removed`);
          // Publish a remove event
          base.bus.publish(`${shippingChannel}.REMOVE`,
            {
              old: removedShipping.toObject({ virtuals: true })
            }
          );
          return reply(base.utils.genericResponse());
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
};
