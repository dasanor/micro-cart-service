/*
 Canada - Ontario 2 Ontario - Tax calculation
 */
function tax(base) {
  return (cart, item, product, taxData) => {
    // Sum product total
    const productTotal = cart.items.reduce((subtotal, i) => {
      return (item.id === i.id) ? subtotal + item.total : subtotal;
    }, 0.00);
    // Choose tax
    const taxCode = (productTotal > taxData.rate) ? 'ca-on-gst' : 'ca-on-hst';
    // Calculate with the new tax
    return base.taxesCalculationService.calculateItemTaxes(cart, item, product, taxCode);
  };
}

module.exports = tax;
