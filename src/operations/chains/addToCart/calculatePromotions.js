/**
 * Hook to allow customization of the Promotions engine
 */
function factory(base) {
  return (context, next) => {
    // Clean previous promotions
    context.cart.items.forEach(item => {
      item.discounts = [];
    });
    // Build a minimal version of the cart to be sent to the promotions service
    const requestCart = {
      cartId: context.cart.id,
      items: context.cart.items.map(item => {
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        };
      })
    };
    // Call the service
    base.services.call({
      name: 'promotion:promotion.cartPromotions'
    }, requestCart)
      .then(response => {
        if (response && response.ok === false) {
          return next(base.utils.Error(response.error, response.data));
        }
        // Do something with the calculated promotions. Just copy the response right now.
        context.cart.promotions = {
          ok: response.ok,
          almostFulfilledPromos: response.almostFulfilledPromos
        };
        response.itemDiscounts.forEach(discountItem => {
          const cartItem = context.cart.items.find(it => it.id === discountItem.id);
          cartItem.discounts = discountItem.discounts
        });
        return next();
      })
      .catch(error => {
        if (error.code === 'ECONNREFUSED') {
          base.logger.warn(`[cart] cannot reach promotions service '${error.message}'`);
          context.cart.promotions = {
            ok: false,
            error: 'cannot_reach_engine'
          };
          return next();
        }
        return next(error);
      });
  };
}

module.exports = factory;
