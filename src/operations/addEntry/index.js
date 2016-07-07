/**
 * ## `addToCart` operation factory
 *
 * Creates the addToCart Cart operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  const onError = base.utils.loadModule('hooks:onError');

  const addToCartChain = new base.utils.Chain().use('addToCartChain');

  /**
   * ## cart.addEntry service
   *
   * Adds an entry to an existing Cart
   *
   * The handler receive an object with the following properties:
   * @param {cartId} String The Cart id to add to
   * @param {items} Array of items
   * @param {items.productId} String The Product id to add
   * @param {items.quantity} Integer The qualtity to add
   * @param {items.warehouseId} String Optional. The Warehouse id to pick stock
   * @returns {entry} Object The new added entry.
   */
  const op = {
    name: 'addEntry',
    path: '/{cartId}/entry',
    method: 'POST',
    schema: require(base.config.get('schemas:addEntry')),
    handler: (msg, reply) => {
      const context = {
        cartId: msg.cartId,
        items: msg.items,
        addedEntries: []
      };
      addToCartChain
        .exec(context)
        .then(context => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) base.logger.debug(`[cart] added ${msg.items.length} item(s) to cart ${context.cart._id}`);
          return reply(context.addedEntries);
        })
        .catch(error => {
          // Handle errors, rolling back if necessary
          onError(context, error, msg, reply);
        });
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
