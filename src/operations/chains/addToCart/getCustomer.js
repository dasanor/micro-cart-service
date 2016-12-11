/**
 * Retrieve the User
 */
function factory(base) {
  const defaultCustomer = base.config.get('defaultCustomer');
  const defaultCustomerTags = base.config.get('defaultCustomerTags');
  return (context, next) => {
    if (context.cart.customerId === defaultCustomer) {
      context.customer = {
        customerId: defaultCustomer,
        tags: defaultCustomerTags
      };
      return next();
    }
    // Find the User
    base.db.models.Customer
      .findById(context.cart.customerId)
      .exec()
      .then(customer => {
        // Check Customer existance
        if (!customer) {
          return next(base.utils.Error('customer_not_found'));
        }
        context.customer = customer;
        return next();
      });
  };
}

module.exports = factory;
