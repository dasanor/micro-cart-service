/*
 Canada - Ontario 2 Ontario prepared meals
 */
function tax(/* base */) {
  return (taxContext, calculateItemTaxes) => {
    // Sum product total
    const productTotal = taxContext.cart.items.reduce((subtotal, i) => {
      return (taxContext.item.id === i.id) ? subtotal + (i.quantity * i.price) : subtotal;
    }, 0.00);
    // Choose tax
    taxContext.taxCode = (productTotal > taxContext.taxData.rate) ? 'ca-on-hst' : 'ca-on-gst';
    // Calculate with the new tax
    return calculateItemTaxes(taxContext, calculateItemTaxes);
  };
}

module.exports = tax;
