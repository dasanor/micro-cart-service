/**
 * Allows the customization of actions after the cart was stored
 */
function addEntry(base) {
  const cartsChannel = base.config.get('channels:carts');
  return (data /* cart, productId, quantity, warehouseId */) => {
    return new Promise((resolve /* , reject */) => {
      base.events.send(cartsChannel, 'ADDTOCART', {
        cart: data.cart.toObject({ virtuals: true }),
        productId: data.productId,
        quantity: data.quantity,
        warehouseId: data.warehouseId
      });
      resolve(data);
    });
  };
}

module.exports = addEntry;
