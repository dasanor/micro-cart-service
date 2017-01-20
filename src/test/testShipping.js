const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const service = require('../index.js');
const base = service.base || service.start().base;
const app = base.transports.http.app;

const defaultHeaders = base.config.get('test:defaultHeaders');

// Check the environment
if (process.env.NODE_ENV !== 'test') {
  console.log('\n[test] THIS ENVIRONMENT IS NOT FOR TEST!\n');
  process.exit(1);
}

// Check the database
if (!base.db.url.includes('test')) {
  console.log('\n[test] THIS DATABASE IS NOT A TEST DATABASE!\n');
  process.exit(1);
}

// Helper to clean the DB
function cleaner(callback) {
  const db = base.db.connections[0];
  let count = Object.keys(db.collections).length;
  Object.keys(db.collections).forEach((colName) => {
    const collection = db.collections[colName];
    collection.drop(() => {
      if (--count <= 0 && callback) {
        callback();
      }
    });
  });
}

// Helper to clean the database
function cleanDB(done) {
  cleaner(done);
}

// Helper to initialize the database
function initDB(done) {
  cleanDB(() => {
    done();
  });
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  const promise = request(app)[options.method.toLowerCase()](options.url);
  Object.keys(options.headers).forEach((key) => {
    promise.set(key, options.headers[key]);
  });
  if (options.payload) promise.send(options.payload);
  return promise;
}

// Helper to create carts
function createCart(numEntries, cartitemRequest, sequenceProducts, mockProductTaxData = true) {
  let cart;
  return callService({
    url: '/services/cart/v1/cart.create'
  })
    .then((cartResponse) => {
      if (numEntries) {
        const itemRequest = cartitemRequest ||
          {
            productId: '0001',
            quantity: 10,
            warehouseId: '001'
          };
        cart = cartResponse.body.cart;

        const allEntries = Array.from(new Array(numEntries), (a, i) => {
          const itemId = {
            productId: itemRequest.productId + (sequenceProducts ? i : ''),
            quantity: itemRequest.quantity,
            warehouseId: itemRequest.warehouseId
          };
          mockProductDataGet(itemId);
          mockStockReserveOk(itemId);
          return itemId;
        });

        if (mockProductTaxData) {
          mockProductTaxDataGet({
            productId: allEntries.map(itemId => itemId.productId).join(',')
          });
        }

        return callService({
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: allEntries }
        })
          .then((itemResponses) => {
            if (itemResponses.statusCode !== 200 || itemResponses.body.ok === false) {
              throw itemResponses;
            }
            return itemResponses;
          })
          .then(() => {
            if (!nock.isDone()) {
              console.log('----------------');
              console.error('pending mocks: %j', nock.pendingMocks());
              console.log('----------------');
            }
            return callService({
              method: 'GET',
              url: `/services/cart/v1/cart.info?cartId=${cart.id}`
            });
          })
          .then((response) => {
            if (response.statusCode !== 200 || response.body.ok === false) {
              throw response;
            }
            return response.body.cart;
          })
          .catch((error) => {
            console.error(error);
            return error;
          });
      }
      return cartResponse.body.cart;
    });
}

// Helper to create a Cart, Shipping Method and set Cart ShippingAddress
function createCartHelper(a = a1, sm = sm1) {
  return callService({
    url: '/services/cart/v1/shipping.create',
    payload: clone(sm)
  })
    .then((responseCSM) => {
      return createCart();
    })
    .then((cart) => {
      return callService({
        url: '/services/cart/v1/cart.setShippingAddress',
        payload: {
          address: a,
          cartId: cart.id
        }
      });
    });
}

// Helper to clone objects
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const sm1 = {
  title: 'UPS Same Day',
  active: true,
  taxCode: 'default',
  rates: [
    {
      locations: [
        { country: 'GB' },
        { country: 'IT' },
        { country: 'GB' }
      ],
      rates: [
        { currency: 'EUR', amount: 10.10 },
        { currency: 'GBP', amount: 9.90 }
      ]
    },
    {
      locations: [
        { country: 'US', state: 'Hawaii' },
        { country: 'US', state: 'Alaska' }
      ],
      rates: [
        { currency: 'USD', amount: 25.00 }
      ]
    },
    {
      locations: [
        { country: 'GB', state: 'Dorset' }
      ],
      rates: [
        { currency: 'EUR', amount: 12.10 },
        { currency: 'GBP', amount: 10.90 }
      ]
    },
  ]
};

const a1 = {
  firstName: 'John',
  lastName: 'Doe',
  address_1: '1650 Bolman Court',
  postCode: '61701',
  city: 'Valencia',
  state: 'Piemonte',
  country: 'IT',
  company: 'Thinkwrap',
  phone: 2173203531,
  instructions: 'Instructions'
};

/*
 Cart Tests
 */
describe('Shipping Methods', () => {
  beforeEach((done) => {
    initDB(done);
  });
  after((done) => {
    cleanDB(done);
  });

  it('creates a Shipping Method', (done) => {
    const sm = clone(sm1);
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        const shipping = response.body.shipping;
        expect(shipping.id).to.be.a.string();
        sm.id = shipping.id;
        expect(shipping.rates).to.be.an.array().and.have.length(sm.rates.length);
        sm.rates[0].id = shipping.rates[0].id;
        sm.rates[1].id = shipping.rates[1].id;
        sm.rates[2].id = shipping.rates[2].id;
        expect(shipping).to.equal(sm);
        done();
      })
      .catch(error => done(error));
  });

  it('retrieves a Shipping Method', (done) => {
    const sm = clone(sm1);
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        const optionsRM = {
          url: '/services/cart/v1/shipping.info',
          payload: { shippingId: response.body.shipping.id }
        };
        return callService(optionsRM);
      })
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('doesn\'t retrieves a non existent Shipping Method', (done) => {
    const options = {
      url: '/services/cart/v1/shipping.info',
      payload: { shippingId: 'xx' }
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('shipping_method_not_found');
        done();
      })
      .catch(error => done(error));
  });

  it('validates the Country on creation', (done) => {
    const sm = clone(sm1);
    sm.rates[0].locations[0].country = 'XX';
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('location_country_invalid');
        expect(response.body.data).to.equal({ country: 'XX' });
        done();
      })
      .catch(error => done(error));
  });

  it('validates the State on creation', (done) => {
    const sm = clone(sm1);
    sm.rates[0].locations[0].state = 'XX';
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('location_state_invalid');
        expect(response.body.data).to.equal({ country: 'GB', state: 'XX' });
        done();
      })
      .catch(error => done(error));
  });

  it('validates the Currency on creation', (done) => {
    const sm = clone(sm1);
    sm.rates[0].rates[0].currency = 'XX';
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('rate_currency_invalid');
        expect(response.body.data).to.equal({ rate: 'XX' });
        done();
      })
      .catch(error => done(error));
  });

  it('removes a Shipping Method', (done) => {
    const sm = clone(sm1);
    const options = {
      url: '/services/cart/v1/shipping.create',
      payload: sm
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        const optionsRM = {
          url: '/services/cart/v1/shipping.remove',
          payload: { shippingId: response.body.shipping.id }
        };
        return callService(optionsRM);
      })
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        done();
      })
      .catch(error => done(error));
  });

  it('doesn\'t removes a non existent Shipping Method', (done) => {
    const options = {
      url: '/services/cart/v1/shipping.remove',
      payload: { shippingId: 'xx' }
    };
    callService(options)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('shipping_method_not_found');
        done();
      })
      .catch(error => done(error));
  });

  it('sets the Cart Shipping Address', (done) => {
    const a = clone(a1);
    createCartHelper(a)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.cart.shippingAddress).to.equal(a);
        done();
      })
      .catch(error => done(error));
  });

  it('validates the Country in the Cart Shipping Address', (done) => {
    const a = clone(a1);
    a.country = 'XX';
    createCartHelper(a)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('invalid_country');
        expect(response.body.data).to.equal({ country: 'XX' });
        done();
      })
      .catch(error => done(error));
  });

  it('validates the State in the Cart Shipping Address', (done) => {
    const a = clone(a1);
    a.state = 'XX';
    createCartHelper(a)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('invalid_state');
        expect(response.body.data).to.equal({ country: 'IT', state: 'XX' });
        done();
      })
      .catch(error => done(error));
  });

  it('selects the correct shipping method - country wide', (done) => {
    const a = clone(a1);
    const sm = clone(sm1);
    createCartHelper(a, sm)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.shippingMethods).to.equal([
          {
            title: sm.title,
            taxCode: sm.taxCode,
            rates: sm.rates[0].rates
          }
        ]);
        done();
      })
      .catch(error => done(error));
  });

  it('reject if there is no country wide method', (done) => {
    const a = clone(a1);
    a.country = 'US';
    a.state = 'Florida';
    const sm = clone(sm1);
    createCartHelper(a, sm)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('no_suitable_shipping_method');
        done();
      })
      .catch(error => done(error));
  });

  it('reject if there is no country', (done) => {
    const a = clone(a1);
    a.country = 'CA';
    a.state = 'Ontario';
    const sm = clone(sm1);
    createCartHelper(a, sm)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(false);
        expect(response.body.error).to.equal('no_suitable_shipping_method');
        done();
      })
      .catch(error => done(error));
  });

  it('selects the correct shipping method - wide over specific state', (done) => {
    const a = clone(a1);
    a.country = 'GB';
    a.state = 'Essex';
    const sm = clone(sm1);
    createCartHelper(a, sm)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.shippingMethods).to.equal([
          {
            title: sm.title,
            taxCode: sm.taxCode,
            rates: sm.rates[0].rates
          }
        ]);
        done();
      })
      .catch(error => done(error));
  });

  it('selects the correct shipping method - specific state over wide', (done) => {
    const a = clone(a1);
    a.country = 'GB';
    a.state = 'Dorset';
    const sm = clone(sm1);
    createCartHelper(a, sm)
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.shippingMethods).to.equal([
          {
            title: sm.title,
            taxCode: sm.taxCode,
            rates: sm.rates[2].rates
          }
        ]);
        done();
      })
      .catch(error => done(error));
  });

});

