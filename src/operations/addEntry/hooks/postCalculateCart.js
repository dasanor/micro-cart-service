/**
 * Hook to allow customization of the add to cart process after being calculated
 */
function factory(base) {
  return (context, next) => {
    // TODO: Verify total !> maxTotal
    next();
  };
}

module.exports = factory;
