/**
 * Hook to allow customization Taxes calculation
 */
function factory(base) {

  // Calculate Cart totals
  function calculateCartTotals(cart) {
    // Calculate Cart totals
    const totals = cart.items.reduce((subtotals, item) => {
      const taxTotals = item.taxes.reduce((taxSubtotals, tax) => {
        taxSubtotals.beforeTax += tax.beforeTax;
        taxSubtotals.tax += tax.tax;
        return taxSubtotals;
      }, { beforeTax: 0.00, tax: 0.00 });
      subtotals.beforeTax += taxTotals.beforeTax;
      subtotals.tax += taxTotals.tax;
      return subtotals;
    }, { beforeTax: 0.00, tax: 0.00 });
    cart.taxes = {
      ok: true,
      beforeTax: totals.beforeTax,
      tax: totals.tax
    };
  }

  return (context, next) => {
    // Clean previous taxes
    context.cart.items.forEach(item => {
      item.taxes = [];
    });
    // Build a minimal version of the cart to be sent to the tax calculation service
    const requestCart = {
      cartId: context.cart.id,
      items: context.cart.items.map(item => {
        return {
          id: item.id,
          productId: item.productId,
          price: (item.price * item.quantity) - (item.discounts || []).reduce((total, discount) => {
            return total + (discount.discount * discount.quantity);
          }, 0)
        }
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
          cartItem.taxes = taxedItem.taxes;
        });
        // Summarize
        calculateCartTotals(context.cart);
        return next();
      })
      .catch(error => {
        if (error.code === 'ECONNREFUSED') {
          base.logger.warn(`[cart] cannot reach taxes service '${error.message}'`);
          context.cart.taxes = {
            ok: false,
            error: 'cannot_reach_engine',
          };
          return next();
        }
        return next(error);
      });
  };
}

module.exports = factory;
