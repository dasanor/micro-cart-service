/**
 * Select the Product price based on the data provided
 */
function factory(base) {
  // const aggregateItems = base.config.get('aggregateItems');
  return (context, next) => {
    // TODO
    // console.log('prices:', context.product.prices);
    // for (let price of context.product.prices) {
    //   console.log(price);
    // }
    context.selectedPrice = context.product.prices[0];
    return next();
  };
}

module.exports = factory;
