const shortId = require('shortid');

/**
 * Adds an item to the cart
 */
function addToCart(/* base */) {
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve /* , reject */) => {
      let reserveData;
      const entry = {
        id: shortId.generate(),
        productId: data.productId,
        quantity: data.quantity,
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
