/**
 * Hook to allow customization of the product availability check
 * By default it delegates the responsibility to the CatalogService
 */
function productAvailability(base) {
  return (productId) => {
    return base.services.call({
      name: 'catalog:getProduct',
      method: 'GET',
      path: `/product/${productId}`
    }, {});
  };
}

module.exports = productAvailability;
