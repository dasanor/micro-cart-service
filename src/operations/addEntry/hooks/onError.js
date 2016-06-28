/**
 * Hook to allow customization of the error handling
 */
function onError(base) {
  return (data, error, request, reply) => {
    if (data.addedEntries) {
      data.addedEntries.forEach(e => {
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

module.exports = onError;
