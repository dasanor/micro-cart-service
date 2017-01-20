const moment = require('moment');

/**
 * Select the Product price based on Currency, Country, CustomerType, Validity dates and Channel
 */
function factory(base) {
  return (context, next) => {
    // Data to compare with
    const currency = context.cart.currency;
    const country = context.cart.country;
    const channel = context.cart.channel;
    const customerTags = context.customer.tags;

    // Store the selected price, if any
    let selectedPrice = {};
    let selectedScore = -1;

    // Loop the product prices
    for (const price of context.product.prices) {
      // Only consider the same currency
      if (price.currency === currency) {
        // Only consider the correct period (or no period at all)
        if (!price.validFrom || (price.validFrom && moment().isBetween(price.validFrom, price.validUntil))) {
          let score = 0;
          // Add to the score
          if (price.country && country && price.country === country) score += 1;
          if (price.channel && channel && price.channel === channel) score += 2;
          if (price.customerType && customerTags.indexOf(price.customerType) !== -1) score += 4;
          if (score > selectedScore) {
            selectedPrice = price;
            selectedScore = score;
          } else if (score === selectedScore) {
            // On tie, the prices with period wins
            if (price.validFrom) {
              selectedPrice = price;
              selectedScore = score;
            }
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
