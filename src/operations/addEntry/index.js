const moment = require('moment');
const boom = require('boom');

/**
 * ## `addToCart` operation factory
 *
 * Creates the addToCart Cart operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  const getCart = base.utils.loadModule('hooks:getCart:handler');
  const bulkAddToCart = base.utils.loadModule('hooks:bulkAddToCart:handler');
  const postAddToCart = base.utils.loadModule('hooks:postAddToCart:handler');
  const calculateCart = base.utils.loadModule('hooks:calculateCart:handler');
  const postCalculateCart = base.utils.loadModule('hooks:postCalculateCart:handler');
  const saveCart = base.utils.loadModule('hooks:saveCart:handler');
  const postSaveCart = base.utils.loadModule('hooks:postSaveCart:handler');
  const onError = base.utils.loadModule('hooks:onError:handler');

  /**
   * ## cart.addEntry service
   *
   * Adds an entry to an existing Cart
   *
   * The handler receive an object with the following properties:
   * @param {cartId} String The Cart id to add to
   * @param {productId} String The Product id to add
   * @param {quantity} Integer The qualtity to add
   * @param {warehouseId} String Optional. The Warehouse id to pick stock
   * @returns {entry} Object The new added entry.
   */
  const op = {
    name: 'addEntry',
    path: '/{cartId}/entry',
    method: 'POST',
    schema: require(base.config.get('schemas:addEntry')),
    handler: (request, reply) => {
      const data = {
        cartId: request.cartId,
        items: request.items,
        addedEntries: []
      };
      getCart(data)
        .then(bulkAddToCart)
        .then(postAddToCart)
        .then(calculateCart)
        .then(postCalculateCart)
        .then(saveCart)
        .then(postSaveCart)
        .then(data => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled()) base.logger.debug(`[cart] entry ${data.productId} added to cart ${data.cart._id}`);
          return reply(data.addedEntries);
        })
        .catch(error => {
          onError(data, error, request, reply);
        });
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
