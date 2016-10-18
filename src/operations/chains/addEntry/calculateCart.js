/**
 * Hook to allow customization of Cart calculation
 */
function factory(base) {

  // Calculate Cart totals
  function calculateCartTotals(cart) {
    // Calculate Cart totals
    const totals = cart.items.reduce((subtotals, item) => {
      subtotals.beforeTax += item.beforeTax;
      subtotals.tax += item.tax;
      return subtotals;
    }, { beforeTax: 0.00, tax: 0.00 });
    cart.beforeTax = totals.beforeTax;
    cart.tax = totals.tax;
  }

  return (context, next) => {
    // Build a minimal version of the cart to be sent to the tax calculation service
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

    base.services.call({
      name: 'tax:tax.cartTaxes'
    }, requestCart)
      .then(response => {
        if (response && response.ok === false) {
          return next(base.utils.Error(response.error, response.data));
        }
        // Add taxes to the cart
        const taxedCart = response.cart;
        taxedCart.items.forEach(taxedItem => {
          const cartItem = context.cart.items.find(i => i.id === taxedItem.id);
          Object.assign(cartItem, taxedItem);
        });
        // Summarize
        calculateCartTotals(context.cart);
        return next();
      })
      .catch(next);

  };
}

module.exports = factory;
