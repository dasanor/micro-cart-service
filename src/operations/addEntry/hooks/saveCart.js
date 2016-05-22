/**
 * Saves the cart
 */
function postAddEntry(/* base */) {
  return (data /* cart, productId, quantity */) => {
    return data.cart.save().then((savedCart) => {
      data.cart = savedCart;
      return data;
    });
  };
}

module.exports = postAddEntry;
