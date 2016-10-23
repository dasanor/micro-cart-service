/**
 * Checks the max quantity per Product in a Cart
 */
function factory(base) {
  const aggregateItems = base.config.get('aggregateItems');
  const maxNumberOfEntries = base.config.get('maxNumberOfEntries');
  return (context, next) => {
    if (maxNumberOfEntries) {
      let newItems = context.newItems.length;
      if (aggregateItems) {
        let productIds = context.newItems.map(item=>item.productId);
        productIds = [...new Set(productIds)];
        newItems = 0;
        productIds.forEach(productId => {
          newItems += context.cart.items.find(i => i.productId === productId) ? 0 : 1;
        });
      }
      if (context.cart.items.length + newItems > maxNumberOfEntries) {
        return next(base.utils.Error('max_number_of_entries_exceeded', {
          requestedEntries: context.cart.items.length + newItems,
          maxEntriesAllowed: maxNumberOfEntries
        }));
      }
      return next();
    }
    return next();
  };
}

module.exports = factory;
