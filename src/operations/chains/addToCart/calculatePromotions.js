/**
 * Hook to allow customization of the Promotions engine
 */
function factory(base) {
  const cartPromotionsURI = base.config.get('services:uris:promotion.cartPromotions');
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
          price: item.price.amount
        };
      })
    };
    // Call the service
    base.services.call({
      name: cartPromotionsURI
    }, requestCart)
      .then(response => {
        if (response.ok === false) {
          base.logger.warn(`[cart] cannot reach promotions service '${JSON.stringify(response.data)}'`);
          context.cart.promotions = {
            ok: false,
            error: 'cannot_reach_engine'
          };
          return next();
        }
        context.cart.promotions = {
          ok: response.ok,
          almostFulfilledPromos: response.almostFulfilledPromos
        };
        response.itemDiscounts.forEach(discountItem => {
          const cartItem = context.cart.items.find(it => it.id === discountItem.id);
          cartItem.discounts = discountItem.discounts;
        });
        return next();
      })
      .catch(error => next(error));
  };
}

module.exports = factory;
