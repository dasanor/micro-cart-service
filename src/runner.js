const raven = require('raven');
require('./index')
  .start({
    extra: { raven }
  });
