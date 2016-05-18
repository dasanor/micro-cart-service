/**
 * Adds an item to the cart
 */
function addToCart(/* base */) {
  return (data /* cart, product, warehouse */) => {
    return new Promise((resolve /* , reject */) => {
      let entry = data.cart.entries.find(p => p.code === data.product.code);
      if (entry) {
        entry.quantity += data.product.quantity;
      } else {
        entry = {
          code: data.product.code,
          quantity: data.product.quantity
        };
        data.cart.entries.push(entry);
      }
      // Adds reserve data, if any
      if (data.availability.data) {
        entry.reserves = entry.reserves || [];
        entry.reserves.push({
          code: data.availability.data.code,
          expirationTime: data.availability.data.expirationTime
        });
      }
      console.log(data)
      return resolve(data);
    });
  };
}

module.exports = addToCart;
