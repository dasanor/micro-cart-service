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
  const preAddToCart = base.services.loadModule('hooks:preAddToCart:handler');
  const addToCart = base.services.loadModule('hooks:addToCart:handler');
  const postAddToCart = base.services.loadModule('hooks:postAddToCart:handler');
  const saveCart = base.services.loadModule('hooks:saveCart:handler');
  const postSaveCart = base.services.loadModule('hooks:postSaveCart:handler');
  /**
   * ## cart.addEntry service
   *
   * Adds an entry to an existing Cart or adds quantity to an existent entry
   *
   * The handler receive an object with the following properties:
   * @param {cartId} String The Cart id to add to
   * @param {productId} String The Product id to add
   * @param {quantity} Integer The qualtity to add
   * @param {warehouseId} String Optional. The Warehouse id to pick stock
   */
  const op = {
    name: 'addEntry',
    schema: require(base.config.get('schemas:addEntry')),
    handler: ({ cartId, productId, quantity, warehouseId }, reply) => {
      base.db.models.Cart
         .findById(cartId)
         .exec()
         .then(cart => {
           // Check cart existance
           if (!cart) return reply(Boom.notFound());
           cart.entries = cart.entries || [];
           return { cart, productId, quantity, warehouseId };
         })
         .then(data => preAddToCart(data))
         .then(data => addToCart(data))
         .then(data => postAddToCart(data))
         .then(data => saveCart(data))
         .then(data => postSaveCart(data))
         .then(data => {
           // Return the cart to the client
           if (base.logger.isDebugEnabled) base.logger.debug(`[cart] entry ${data.productId} added to cart ${data.cart._id}`);
           return reply(data.cart.toClient());
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
