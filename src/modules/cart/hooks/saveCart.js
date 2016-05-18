/**
 * Saves the cart
 */
function postAddEntry(/* base */) {
  return (data /* cart, product, warehouse */) => {
    return data.cart.save().then((savedCart) => {
      data.stock = savedCart;
      return data;
    });
  };
}

module.exports = postAddEntry;
