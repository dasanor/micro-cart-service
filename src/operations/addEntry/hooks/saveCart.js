/**
 * Saves the cart
 */
function postAddEntry(/* base */) {
  return (data /* {cart, addedEntries} */) => {
    return data.cart.save().then((savedCart) => {
      data.cart = savedCart;
      return data;
    });
  };
}

module.exports = postAddEntry;
