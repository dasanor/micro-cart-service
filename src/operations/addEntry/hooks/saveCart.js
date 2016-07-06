/**
 * Saves the cart
 */
function factory(/* base */) {
  return (context, next) => {
    //throw new Error('I refuse to save this cart');
    context.cart.save()
      .then((savedCart) => {
        context.cart = savedCart;
        next();
      })
      .catch(next);
  };
}

module.exports = factory;
