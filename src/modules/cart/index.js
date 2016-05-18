const moment = require('moment');
const shortId = require('shortid');
const Boom = require('boom');

/**
 * ## CartService.factory
 *
 * Creates all the operations for the Cart Service
 *
 * @param {base} Object The micro-base object
 * @return {Array} Array containing the operation objects
 */
function cartFactory(base) {
  base.logger.info(`[service] Instantiating [${base
     .config.get('services:name')}][${base.config.get('services:version')}]`);


  // Register model(s)
  const Cart = require(base.config.get('models:cartModel'))(base);

  /**
   * ## cart.new service
   *
   * Creates a new cart
   */
  const cartExpirationMinutes = base.config.get('cartExpirationMinutes');
  const newCart = {
    name: 'new',
    handler: (msg, reply) => {
      const cart = new Cart({
        _id: shortId.generate(),
        uid: msg.uid || 'anonymous',
        entries: [],
        expirationTime: moment().add(cartExpirationMinutes, 'minutes').toDate()
      });
      cart.save(error => {
        if (error) return reply(Boom.wrap(error));
        if (base.logger.isDebugEnabled) base.logger.debug(`[cart] cart ${cart._id} created`);
        return reply(cart.toClient());
      });
    }
  };

  /**
   * ## cart.get service
   *
   * Finds a Cart and returns it
   */
  const getCart = {
    name: 'get',
    handler: (msg, reply) => {
      Cart.findById(msg.id).then(cart => {
        if (!cart) return reply(Boom.notFound());
        return reply(cart.toClient());
      }).catch(error => {
        base.logger.error(error);
        reply(Boom.wrap(error));
      });
    }
  };

  /**
   * ## cart.addEntry service
   *
   * Adds an entry to an existing Cart or adds quantity to an existent entry
   */
  const preAddToCart = base.services.loadModule('hooks:preAddToCart:handler');
  const addToCart = base.services.loadModule('hooks:addToCart:handler');
  const postAddToCart = base.services.loadModule('hooks:postAddToCart:handler');
  const saveCart = base.services.loadModule('hooks:saveCart:handler');
  const postSaveCart = base.services.loadModule('hooks:postSaveCart:handler');
  const addEntry = {
    name: 'addEntry',
    schema: require(base.config.get('schemas:addEntry')),
    handler: ({ cartId, product, warehouse }, reply) => {
      Cart.findById(cartId)
         .then(cart => {
           // Check cart existance
           if (!cart) return reply(Boom.notFound());
           cart.entries = cart.entries || [];
           return { cart, product, warehouse };
         })
         .then(data => preAddToCart(data))
         .then(data => addToCart(data))
         .then(data => postAddToCart(data))
         .then(data => saveCart(data))
         .then(data => postSaveCart(data))
         .then(data => {
           // Return the cart to the client
           if (base.logger.isDebugEnabled) base.logger.debug(`[cart] entry ${data.product.code} added to cart ${data.cart._id}`);
           return reply(data.cart.toClient());
         })
         .catch(error => {
           if (error.isBoom) return reply(error);
           base.logger.error(error);
           return reply(Boom.wrap(error));
         });
    }
  };

  return [
    newCart,
    getCart,
    addEntry
  ];
}

// Exports the factory
module.exports = cartFactory;
