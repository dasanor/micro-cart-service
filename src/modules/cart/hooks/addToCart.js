const shortId = require('shortid');

/**
 * Adds an item to the cart
 */
function addToCart(/* base */) {
  return (data /* cart, productId, quantity, warehouse */) => {
    return new Promise((resolve /* , reject */) => {
      let entry = data.cart.items.find(p => p.productId === data.productId);

      let reserveData;
      if (data.availability.data) {
        reserveData = {
          code: data.availability.data.id,
          expirationTime: data.availability.data.expirationTime
        };
      }

      if (entry) {
        entry.quantity += data.quantity;
        if (reserveData) {
          entry.reserves.push(reserveData);
        }
      } else {
        entry = {
          id: shortId.generate(),
          productId: data.productId,
          quantity: data.quantity,
          reserves: []
        };
        if (reserveData) {
          entry.reserves.push(reserveData);
        }
        data.cart.items.push(entry);
      }
      return resolve(data);
    });
  };
}

module.exports = addToCart;
