/**
 * Hook to allow customization of the Promotions engine
 */
function factory(base) {
  return (context, next) => {
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
        context.cart.promotions = response;
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
      })
      .then(next);
  };
}

module.exports = factory;
