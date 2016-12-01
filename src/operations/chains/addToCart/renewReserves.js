/**
 * Renew cart items reservations
 */
function factory(base) {
  const reserveStockForMinutes = base.config.get('reserveStockForMinutes');
  return (context, next) => {

    if(context.cart && context.cart.items){
      const promises = [];
      const existentItems = context.cart.items;
      const renewReserve = function(reserve){
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
      };

      existentItems.forEach(item => {
        const itemReserves = item.reserves;

        if(itemReserves){
          itemReserves.forEach(reserve => {
            const expirationTime = reserve.expirationTime;
            if(expirationTime && (new Date() <= new Date(expirationTime))){
              promises.push(renewReserve(reserve));
            }
          });
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
