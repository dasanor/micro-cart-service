const Boom = require('boom');

/**
 * Allows the customization of actions when retriving the cart
 */
function getCart(base) {
  return ({ cartId, items, addedEntries }) => {
    return new Promise((resolve, reject) => {
      // Find the Cart
      base.db.models.Cart
        .findById(cartId)
        .exec()
        .then(cart => {
          // Check cart existance
          if (!cart) return reject(Boom.notFound('Cart not found'));
          return resolve({ cart, items, addedEntries });
        });
    });
  };
}

module.exports = getCart;
