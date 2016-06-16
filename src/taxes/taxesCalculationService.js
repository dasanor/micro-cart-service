const boom = require('boom');

function tax(base) {

  // Preload taxes
  let taxes;
  base.db.models.Tax
    .find()
    .exec()
    .then(loadedTaxes => {
      taxes = loadedTaxes.reduce((result, item) => {
        result[item.class] = item;
        return result;
      }, {});
    })
    .catch(error => {
      base.logger.error('[taxes]', error);
    });

  // Preload tax classes (code)
  const taxClassesLocations = base.config.get('taxes:classes');
  const taxClasses = {};
  Object.keys(taxClassesLocations).forEach(key => {
    taxClasses[key] = base.utils.loadModule(`taxes:classes:${key}`);
  });

  function getTaxes() {
    return taxes;
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
            path: `/product?id=${productIds.join(',')}&fields=taxClass,categories`
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
        // Calculate taxes for each line
        cart.items.forEach(item => {
          const product = products[item.productId];
          if (!product) throw boom.notAcceptable('Product not found');
          // Calculate the tax with the tax class implementation
          if (product.taxClass) {
            const {taxTotal, taxDetail} = taxClasses[product.taxClass](cart, item, product, taxes[product.taxClass]);
            item.taxTotal = taxTotal;
            item.taxDetail = taxDetail;
          } else {
            item.taxTotal = 0.00;
            item.taxDetail = '';
          }
        });
        return cart;
      });
  }

  return {
    calculateCartTaxes,
    getTaxes
  };
}

module.exports = tax;
