/**
 * ## `createTax` operation factory
 *
 * Create Tax operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  const taxesChannel = base.config.get('bus:channels:taxes:name');

  /**
   * ## cart.createTax service
   *
   * Creates a new Tax
   */
  const op = {
    name: 'createTax',
    path: '/tax',
    method: 'POST',
    // TODO: create the tax JsonSchema
    handler: (msg, reply) => {
      const tax = new base.db.models.Tax({
        code: msg.code,
        class: msg.class,
        title: msg.title,
        description: msg.description,
        rate: msg.rate,
        isPercentage: msg.isPercentage
      });
      tax.save()
        .then(savedTax => {
          if (base.logger.isDebugEnabled()) base.logger.debug(`[tax] tax ${savedTax._id} created`);

          base.bus.publish(`${taxesChannel}.CREATE`,
            {
              new: savedTax.toObject({ virtuals: true }),
              data: msg
            }
          );

          return reply(savedTax.toClient()).code(201);
        })
        .catch(error => reply(base.utils.genericErrorResponse(error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
