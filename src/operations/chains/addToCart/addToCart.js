const shortId = require('shortid');

/**
 * Adds a single item to the cart
 */
function factory(base) {
  const aggregateItems = base.config.get('aggregateItems');

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
    let itemId;
    let push = false;
    if (aggregateItems) {
      itemId = context.cart.items.find(i => i.productId === context.productId);
      if (itemId) {
        itemId.quantity += context.quantity;
      }
    }
    if (!itemId) {
      itemId = {
        id: shortId.generate(),
        productId: context.productId,
        quantity: context.quantity,
        price: context.product.salePrice,
        title: getTitle(context.product),
        reserves: []
      };
      push = true;
    }
    if (context.availability && context.availability.reserve) {
      itemId.reserves.push(context.availability.reserve);
      context.newReserves.push(Object.assign({ productId: context.productId }, context.availability.reserve));
    }
    if (push) context.cart.items.push(itemId);
    return next();
  };
}

module.exports = factory;
