/**
 * Hook to allow customization of stock check and reservation
 * By default it delegates the responsibility to the StockService
 */
function stockAvailability(base) {
  const reserveStockForMinutes = base.config.get('hooks:stockAvailability:reserveStockForMinutes');
  return (product, warehouse) => {
    return base.services.call('stock:reserve', { product, warehouse, reserveStockForMinutes });
  };
}

module.exports = stockAvailability;
