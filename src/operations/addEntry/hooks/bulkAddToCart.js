const shortId = require('shortid');

/**
 * Add items to the cart
 */
function bulkAddToCart(base) {

  const preAddToCart = base.utils.loadModule('hooks:preAddToCart:handler');
  const addToCart = base.utils.loadModule('hooks:addToCart:handler');

  return (data /* cart, items: {productId, quantity, warehouseId}, addedEntries */) => {
    const promises = data.items.map(i => {
      return Promise
        .resolve({
          cart: data.cart,
          productId: i.productId,
          quantity: i.quantity,
          warehouseId: i.warehouseId,
          addedEntries: data.addedEntries
        })
        .then(preAddToCart)
        .then(addToCart)
        .then(result => {
          return { cart: result.cart, addedEntries: result.addedEntries };
        })
    });
    return Promise
      .all(promises)
      .then(result => {
        return { cart: data.cart, addedEntries: data.addedEntries };
      });
  };
}

module.exports = bulkAddToCart;
