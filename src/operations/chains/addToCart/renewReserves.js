/**
 * Renew cart items reservations
 */
function factory(base) {
  const reserveStockForMinutes = base.config.get('reserveStockForMinutes');
  return (context, next) => {

    if(context.cart && context.cart.items){
      let promises = [];
      let existentItems = context.cart.items;

      existentItems.forEach(item => {
        let itemReserves = item.reserves;

        if(itemReserves){
          promises.push(itemReserves.map(reserve => {
            return base.services.call({
              name: 'stock:stock.reserve.renew'
            }, {
              id: reserve.id,
              reserveStockForMinutes
            })
              .then(response => {
                if(response.reserve) {
                  reserve.expirationTime = response.reserve.expirationTime;
                }
              });
          }));
        }
      });

      Promise
        .all(promises)
        .then(() => next())
        .catch(next);
    }else{
      return next();
    }
  };
}

module.exports = factory;
