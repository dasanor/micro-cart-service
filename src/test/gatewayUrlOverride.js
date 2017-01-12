function gatewayUrlOverrride(base) {
  const localService = base.config.get('services:name');
  const localUrl = `http://localhost:${base.config.get('transports:http:port')}`;
  const gatewayUrl = `http://${base.config.get('gateway:host')}:${base.config.get('gateway:port')}`;
  return serviceName => (serviceName === localService ? localUrl : gatewayUrl);
}

module.exports = gatewayUrlOverrride;
