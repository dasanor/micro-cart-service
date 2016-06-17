function tax(base) {
  return (cart, item, product, taxData) => {

    let beforeTax, tax, taxDetail;
    if (product.isNetPrice) {
      const net = item.quantity * item.price;
      tax = taxData.isPercentage ? Math.round(net * taxData.rate / 100) : taxData.rate;
      beforeTax = net - tax;
    } else {
      beforeTax = item.quantity * item.price;
      tax = taxData.isPercentage ? Math.round(beforeTax * taxData.rate / 100) : taxData.rate;
    }
    taxDetail = taxData.title;

    return { beforeTax, tax, taxDetail };
  };
}

module.exports = tax;
