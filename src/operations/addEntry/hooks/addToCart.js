const shortId = require('shortid');

/**
 * Adds a single item to the cart
 */
function factory(base) {

  const titleOverride = base.config.get('hooks:addToCartTitleOverride');
  let getTitle;
  if (titleOverride) {
    getTitle = base.utils.loadModule('hooks:addToCartTitleOverride');
  } else {
    getTitle = (product) => {
      let title = `${product.sku} - ${product.title} (${product.brand})`;
      if (product.variations) {
        title = title + product.variations.reduce((prev, v) => `${prev} - ${v.value}`, '');
      }
      return title;
    };
  }

  return (context, next) => {
    const entry = {
      id: shortId.generate(),
      productId: context.productId,
      quantity: context.quantity,
      price: context.product.salePrice,
      title: getTitle(context.product),
      reserves: []
    };
    if (context.availability && context.availability.reserve) {
      entry.reserves.push(context.availability.reserve);
    }
    context.cart.items.push(entry);
    context.addedEntries.push(entry);
    return next();
  };
}

module.exports = factory;
