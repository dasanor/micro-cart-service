function gatewayUrlOverrride(/* base */) {
  const urls = {
    stock: 'http://localhost:3000',
    catalog: 'http://localhost:3002',
    tax: 'http://localhost:3003'
  };
  return (serviceName /* , serviceVersion, operationName */) => urls[serviceName];
}

module.exports = gatewayUrlOverrride;
