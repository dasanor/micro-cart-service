function tax(base) {
  return (cart, item, product, tax) => {

    const taxTotal = tax.isPercentage ? item.total * tax.rate / 100 : item.total + tax.rate;
    const taxDetail = tax.title;

    return { taxTotal, taxDetail };
  };
}

module.exports = tax;
