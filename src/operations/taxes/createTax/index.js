const boom = require('boom');

/**
 * ## `createTax` operation factory
 *
 * Create Tax operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  /**
   * ## catalog.createTax service
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
          return reply(savedTax.toClient()).code(201);
        })
        .catch(error => {
          if (error.code === 11000 || error.code === 11001) {
            return reply(boom.forbidden('duplicate key'));
          }
          base.logger.error(error);
          return reply(boom.wrap(error));
        });
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
