const boom = require('boom');

/**
 * Allows the customization of actions after the cart was stored
 */
function addEntry(base) {
  return ({ cartId, entryId }) => {
    return new Promise((resolve, reject) => {
      // Find the Cart
      base.db.models.Cart
        .findById(cartId)
        .exec()
        .then(cart => {
          // Check cart existance
          if (!cart) return reject(boom.notFound('Cart not found'));
          // Check entry existence
          const entry = cart.items.find(e => e.id === entryId);
          if (!entry) return reject(boom.notFound('Entry not found'));
          // return the cart
          return resolve({ cart, entry });
        });
    });
  };
}

module.exports = addEntry;
