/**
 * Checks the max quantity per Product in a Cart
 */
function factory(base) {
  const maxQuantityPerProduct = base.config.get('maxQuantityPerProduct');
  return (context, next) => {
    if (maxQuantityPerProduct) {
      const totalProductQuantity = context.cart.items.reduce((total, item) => {
        return total + (item.productId === context.productId ? item.quantity : 0);
      }, context.quantity);
      if (totalProductQuantity > maxQuantityPerProduct) {
        return next(base.utils.Error('max_quantity_per_product_exceeded', {
          productId: context.productId,
          requestedQuantity: totalProductQuantity,
          maxQuantityAllowed: maxQuantityPerProduct
        }));
      }
      return next();
    }
    return next();
  };
}

module.exports = factory;
