/**
 * Allows the customization of actions after the cart was stored
 */
function addEntry(/* base */) {
  return (data /* cart, product, warehouse */) => {
    return new Promise((resolve /* , reject */) => {
      resolve(data);
    });
  };
}

module.exports = addEntry;
