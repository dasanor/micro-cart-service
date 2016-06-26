/**
 * Allows the customization of actions after the cart was stored
 */
function addEntry(base) {
  const cartsChannel = base.config.get('channels:carts');
  return (data /* cart, addedEntries */) => {
    return new Promise((resolve /* , reject */) => {
      base.events.send(cartsChannel, 'ADDTOCART', {
        cart: data.cart.toObject({ virtuals: true }),
        addedEntries: data.addedEntries
      });
      resolve(data);
    });
  };
}

module.exports = addEntry;
