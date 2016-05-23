const moment = require('moment');
const shortId = require('shortid');
const Boom = require('boom');

/**
 * ## `addToCart` operation factory
 *
 * Creates the addToCart Cart operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {
  const getCart = base.services.loadModule('hooks:getCart:handler');
  const preAddToCart = base.services.loadModule('hooks:preAddToCart:handler');
  const addToCart = base.services.loadModule('hooks:addToCart:handler');
  const postAddToCart = base.services.loadModule('hooks:postAddToCart:handler');
  const saveCart = base.services.loadModule('hooks:saveCart:handler');
  const postSaveCart = base.services.loadModule('hooks:postSaveCart:handler');
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
    path: '/{cartId}/addEntry',
    method: 'PUT',
    schema: require(base.config.get('schemas:addEntry')),
    handler: (request, reply) => {
      getCart(request)
        .then(data => preAddToCart(data))
        .then(data => addToCart(data))
        .then(data => postAddToCart(data))
        .then(data => saveCart(data))
        .then(data => postSaveCart(data))
        .then(data => {
          // Return the cart to the client
          if (base.logger.isDebugEnabled) base.logger.debug(`[cart] entry ${data.productId} added to cart ${data.cart._id}`);
          return reply(data.addedEntry);
        })
        .catch(error => {
          if (error.isBoom) return reply(error);
          base.logger.error(error);
          return reply(Boom.wrap(error));
        });
    }
  };

  return op;
}

// Exports the factory
module.exports = opFactory;
