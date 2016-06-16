function tax(base) {
  return (cart, item, product, productTax) => {

    // Sum product total
    const productTotal = cart.items.reduce((subtotal, i) => {
      return (item.id === i.id) ? subtotal + item.total : subtotal;
    }, 0.00);

    let tax;
    if (productTotal > productTax.rate) {
      tax = base.taxesCalculationService.getTaxes()['ca-gst'];
    }
    else {
      tax = base.taxesCalculationService.getTaxes()['ca-hst'];
    }

    const taxTotal = tax.isPercentage ? item.total * tax.rate / 100 : item.total + tax.rate;
    const taxDetail = tax.title;

    return { taxTotal, taxDetail };

  };
}

module.exports = tax;
