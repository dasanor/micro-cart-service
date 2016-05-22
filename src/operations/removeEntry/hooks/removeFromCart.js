/**
 * Adds an item to the cart
 */
function addToCart(/* base */) {
  return (data /* cart, entry */) => {
    data.cart.items = data.cart.items.filter(e => e.id !== data.entry.id);
    return (data)
  };
}

module.exports = addToCart;
