/**
 * ## `cart.info` operation factory
 *
 * Creates the get Cart operation
 *
 * @param {base} Object The microbase object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const op = {
    handler: ({ cartId }, reply) => {
      base.db.models.Cart
        .findById(cartId)
        .exec()
        .then(cart => {
          if (!cart) throw base.utils.Error('cart_not_found');
          return reply(base.utils.genericResponse({ cart: cart.toClient() }));
        })
        .catch(error => reply(base.utils.genericResponse(null, error)));
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
