const boom = require('boom');

/**
 * Hook to allow customization of Cart calculation
 */
function calculateCart(base) {

  // Calculate item totals
  function calculateItemTotals(data) {
    data.cart.items.forEach(item => {
      item.total = item.price * item.quantity;
    });
    return Promise.resolve(data);
  }

  // Calculate Cart totals
  function calculateCartTotals(data) {
    // Calculate Cart totals
    const totals = data.cart.items.reduce((subtotals, item) => {
      subtotals.beforeTax += item.beforeTax;
      subtotals.tax += item.tax;
      return subtotals;
    }, { beforeTax: 0.00, tax: 0.00 });
    data.cart.beforeTax = totals.beforeTax;
    data.cart.tax = totals.tax;
    return Promise.resolve(data);
  }

  return (data /* cart, productId, quantity, warehouseId */) => {
    return Promise
      .resolve(data)
      .then(data => calculateItemTotals(data))
      .then(data => {
        return base.taxesCalculationService.calculateCartTaxes(data.cart)
          .then(cart => {
            return data;
          });
      })
      .then(data => calculateCartTotals(data));

  };
}

module.exports = calculateCart;
