const Boom = require('boom');

/*
 Hook to allow customization of the verification process after adding a product to the cart
 */
function postAddToCart(base) {
  return (data /* cart, product, warehouse */) => {
    const maxNumberOfEntries = base.config.get('hook:postAddEntry:maxNumberOfEntries');
    return new Promise((resolve, reject) => {
      // maxNumberOfEntries check
      if (maxNumberOfEntries) {
        if (data.cart.entries.length > maxNumberOfEntries) {
          return reject(Boom.notAcceptable(`Number of entries must be less than or equal to ${maxNumberOfEntries}`));
        }
        return resolve(data);
      }
      return resolve(data);
    });
  };
}

module.exports = postAddToCart;
