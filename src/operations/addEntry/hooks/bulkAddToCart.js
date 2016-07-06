/**
 * Checks and adds an array of items to the cart
 */
function factory(base) {

  const chain = new base.utils.Chain()
    .use('itemAddToCartChain');

  return (context, next) => {
    const promises = context.items.map(i => {
      return chain.exec({
        cart: context.cart,
        productId: i.productId,
        quantity: i.quantity,
        warehouseId: i.warehouseId,
        addedEntries: context.addedEntries
      });
    });
    Promise
      .all(promises)
      .then(() => {
        next();
      })
      .catch(next);
  };
}

module.exports = factory;
