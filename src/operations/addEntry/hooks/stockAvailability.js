/**
 * Hook to allow customization of stock check and reservation
 * By default it delegates the responsibility to the StockService
 */
function stockAvailability(base) {
  const reserveStockForMinutes = base.config.get('hooks:stockAvailability:reserveStockForMinutes');
  return (productId, quantity, warehouseId) => {
    return base.services.call('stock:reserve', {
      productId,
      quantity,
      warehouseId,
      reserveStockForMinutes
    });
  };
}

module.exports = stockAvailability;
