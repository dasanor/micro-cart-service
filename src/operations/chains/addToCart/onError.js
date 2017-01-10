/**
 * Hook to allow customization of the error handling
 */
function factory(base) {
  const unreserveURI = base.config.get('services:uris:stock.unreserve');
  return (context, error, request, reply) => {
    if (context.newReserves) {
      // Asynchrony revert the reserves
      // TODO: Change to messaging
      context.newReserves.forEach(reserve => {
        base.services.call({
          name: unreserveURI
        }, {
          reserveId: reserve.id,
          unreserveQuantity: reserve.quantity
        })
          .catch(rollbackReservesError => {
            base.logger.error(`[cart] unreserving '${reserve.id}`, rollbackReservesError);
          });
      });
    }
    reply(base.utils.genericResponse(null, error));
  };
}

module.exports = factory;
