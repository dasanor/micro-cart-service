/**
 * Hook to allow customization of the error handling
 */
function factory(base) {
  return (context, error, request, reply) => {
    if (context.addedEntries) {
      // Asynchrony revert the reserves
      context.addedEntries.forEach(e => {
        if (e.reserves[0]) {
          base.services.call({
              name: 'stock:unreserve',
              method: 'PUT',
              path: `/reserve/${e.reserves[0].id}`
            }, {
              unreserveQuantity: e.reserves[0].quantity
            })
            .catch(error => {
              base.logger.error(`[cart] unreserving '${e.reserves[0].id}`, error);
            });
        }
      });
    }
    reply(base.utils.genericErrorResponse(error));
  };
}

module.exports = factory;
