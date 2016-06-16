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
      subtotals.total += item.total;
      subtotals.taxTotal += item.taxTotal;
      return subtotals;
    }, { total: 0.00, taxTotal: 0.00 });
    data.cart.total = totals.total;
    data.cart.taxTotal = totals.taxTotal;
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
