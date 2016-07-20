function tax(/* base */) {
  return (taxContext, calculateItemTaxes) => {

    let beforeTax, tax;
    if (taxContext.product.isNetPrice) {
      const net = taxContext.item.quantity * taxContext.item.price;
      tax = taxContext.taxData.isPercentage ? Math.round(net * taxContext.taxData.rate / 100) : (taxContext.item.quantity * taxContext.taxData.rate);
      beforeTax = net - tax;
    } else {
      beforeTax = taxContext.item.quantity * taxContext.item.price;
      tax = taxContext.taxData.isPercentage ? Math.round(beforeTax * taxContext.taxData.rate / 100) : (taxContext.item.quantity * taxContext.taxData.rate);
    }
    const taxDetail = taxContext.taxData.title;

    return { beforeTax, tax, taxDetail };
  };
}

module.exports = tax;
