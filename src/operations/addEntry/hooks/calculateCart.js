/**
 * Hook to allow customization of Cart calculation
 */
function factory(base) {

  // Calculate item totals
  function calculateItemTotals(cart) {
    cart.items.forEach(item => {
      item.total = item.price * item.quantity;
    });
  }

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
    calculateItemTotals(context.cart);
    base.taxesCalculationService
      .calculateCartTaxes(context.cart)
      .then(cart => {
        calculateCartTotals(context.cart);
        next();
      });

  };
}

module.exports = factory;
