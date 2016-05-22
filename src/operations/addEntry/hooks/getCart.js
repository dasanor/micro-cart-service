const Boom = require('boom');

/**
 * Allows the customization of actions after the cart was stored
 */
function addEntry(base) {
  return ({ cartId, productId, quantity, warehouseId }) => {
    return new Promise((resolve, reject) => {
      // Find the Cart
      base.db.models.Cart
        .findById(cartId)
        .exec()
        .then(cart => {
          // Check cart existance
          if (!cart) return reject(Boom.notFound('Cart not found'));
          return resolve({ cart, productId, quantity, warehouseId });
        });
    });
  };
}

module.exports = addEntry;
