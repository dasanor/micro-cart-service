const shortId = require('shortid');

/**
 * Adds an item to the cart
 */
function addToCart(base) {

  const titleOverride = base.config.get('hooks:addToCart:titleOverride');
  let getTitle;
  if (titleOverride) {
    getTitle = base.utils.loadModule('hooks:addToCart:titleOverride');
  } else {
    getTitle = (product) => {
      let title = `${product.sku} - ${product.title} (${product.brand})`;
      if (product.variations) {
        title = title + product.variations.reduce(function (prev, v) {
            return prev + ' - ' + v.value;
          }, '');
      }
      return title;
    };
  }

  return (data /* data = {cart, productId, quantity, warehouseId, product, availability} */) => {
    return new Promise((resolve /* , reject */) => {
      const entry = {
        id: shortId.generate(),
        productId: data.productId,
        quantity: data.quantity,
        price: data.product.salePrice,
        title: getTitle(data.product),
        reserves: []
      };
      if (data.availability.reserve) {
        entry.reserves.push(data.availability.reserve);
      }
      data.cart.items.push(entry);
      data.addedEntry = entry;
      return resolve(data);
    });
  };
}

module.exports = addToCart;
