const boom = require('boom');

/**
 * ## `calculateCartTaxes` operation factory
 *
 * Calculate Cart Taxes operation
 *
 * @param {base} Object The micro-base object
 * @return {Function} The operation factory
 */
function opFactory(base) {

  // Preload taxes
  let taxes;
  base.db.models.Tax
    .find()
    .exec()
    .then(loadedTaxes => {
      taxes = loadedTaxes.reduce((result, item) => {
        result[item.code] = item;
        return result;
      }, {});
    })
    .catch(error => {
      base.logger.error('[taxes]', error);
    });

  // Preload tax classes (code)
  const taxClassesLocations = base.config.get('taxes:classes');
  const defaultTaxCode = base.config.get('taxes:defaultCode');
  const taxClasses = {};
  Object.keys(taxClassesLocations).forEach(key => {
    taxClasses[key] = base.utils.loadModule(`taxes:classes:${key}`);
  });

  function calculateItemTaxes(taxContext, calculateItemTaxes) {
    const taxClass = taxes[taxContext.taxCode].class;
    taxContext.taxData = taxes[taxContext.taxCode];
    return taxClasses[taxClass](taxContext, calculateItemTaxes);
  }

  /**
   * ## cart.calculateCartTaxes service
   *
   * Creates a new Tax
   */
  const op = {
    name: 'cartTaxes',
    path: '/cart/{cartId}/taxes',
    method: 'POST',
    // TODO: create the tax JsonSchema
    handler: (cart, reply) => {
      // List unique product IDs
      const productIds = [...new Set(cart.items.reduce((list, item) => {
        list.push(item.productId);
        return list;
      }, []))];

      return Promise
        .resolve(productIds)
        .then(() => {
          // Preload products
          return base.services.call({
            name: 'catalog:list',
            method: 'GET',
            path: `/product?id=${productIds.join(',')}&fields=taxCode,categories,isNetPrice`
          }, {})
            .then(productsList => {
              return productsList.data.reduce((result, item) => {
                result[item.id] = item;
                return result;
              }, {});
            });
        })
        .then(products => {
          // Calculate each line taxes
          cart.items.forEach(item => {
            const product = products[item.productId];
            if (!product) throw boom.notAcceptable('Product not found');
            const taxCode = 'ca-on-pm'; // product.taxCode || defaultTaxCode;
            const { beforeTax, tax, taxDetail } = calculateItemTaxes(
              {
                cart,
                item,
                product,
                taxCode
                /* , store, user */
              },
              calculateItemTaxes
            );
            item.beforeTax = beforeTax;
            item.tax = tax;
            item.taxDetail = taxDetail;
          });
          reply(cart);
        })
        .catch(reply);
    }
  };
  return op;
}

// Exports the factory
module.exports = opFactory;
