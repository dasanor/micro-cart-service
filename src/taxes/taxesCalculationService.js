const boom = require('boom');

function tax(base) {

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

  // Expose the taxes data
  function getTaxes() {
    return taxes;
  }

  // Expose the tax implementations
  function calculateItemTaxes(cart, item, product, taxCode) {
    const taxClass = taxes[taxCode].class;
    return taxClasses[taxClass](cart, item, product, taxes[taxCode]);
  }

  // Calculate Cart taxes
  function calculateCartTaxes(cart) {
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
            const products = productsList.data.reduce((result, item) => {
              result[item.id] = item;
              return result;
            }, {});
            return products;
          });
      })
      .then(products => {
        // Calculate each line taxes
        cart.items.forEach(item => {
          const product = products[item.productId];
          if (!product) throw boom.notAcceptable('Product not found');
          const taxCode = product.taxCode || defaultTaxCode;
          const { beforeTax, tax, taxDetail } = calculateItemTaxes(cart, item, product, taxCode);
          item.beforeTax = beforeTax;
          item.tax = tax;
          item.taxDetail = taxDetail;
        });
        return cart;
      });
  }

  return {
    calculateCartTaxes,
    calculateItemTaxes,
    getTaxes
  };
}

module.exports = tax;
