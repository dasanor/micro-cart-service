/**
 * Hook to allow customization of the error handling
 */
function factory(base) {
  return (context, error, request, reply) => {
    if (context.newReserves) {
      // Asynchrony revert the reserves
      context.newReserves.forEach(reserve => {
        base.services.call({
          name: 'stock:unreserve',
          method: 'PUT',
          path: `/reserve/${reserve.id}`
        }, {
          unreserveQuantity: reserve.quantity
        })
          .catch(error => {
            base.logger.error(`[cart] unreserving '${reserve.id}`, error);
          });
      });
    }
    reply(base.utils.genericErrorResponse(error));
  };
}

module.exports = factory;
