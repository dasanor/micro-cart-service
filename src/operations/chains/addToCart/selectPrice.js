const moment = require('moment');

/**
 * Select the Product price based on Currency, Country, CustomerType, Validity dates and Channel
 */
function factory(base) {
  return (context, next) => {
    const currency = context.cart.currency;
    const country = context.customer.country;
    const customerTags = context.customer.tags;
    const channel = context.cart.channel;

    let selectedPrice = {};
    let selectedScore = -1;

    for (const price of context.product.prices) {
      if (price.currency === currency) {
        let score = 0;
        if (price.country && price.country === country) score += 1;
        if (price.channel && price.channel === channel) score += 2;
        if (price.customerType && customerTags.indexOf(price.customerType) !== -1) score += 4;
        if (score > selectedScore) {
          selectedPrice = price;
          selectedScore = score;
        } else if (score === selectedScore) {
          if (price.validFrom && moment().isBetween(price.validFrom, price.validUntil)) {
            selectedPrice = price;
            selectedScore = score;
          }
        }
      }
    }
    if (selectedScore < 0) {
      return next(base.utils.Error('no_suitable_price'));
    }
    context.selectedPrice = selectedPrice;
    return next();
  };
}

module.exports = factory;
