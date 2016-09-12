const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const server = base.services.server;

const defaultHeaders = base.config.get('test:defaultHeaders');
const normalStockStatus = base.db.models.Cart.STOCKSTATUS.NORMAL;
const reserveStockForMinutes = base.config.get('reserveStockForMinutes');

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
  var count = Object.keys(db.collections).length;
  Object.keys(db.collections).forEach(colName => {
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
    createTaxes()
      .then(() => {
        done();
      });
  });
}

// Helper to mock a successful stock:reserve call
function mockStockReserveOk(entryRequest, times = 1) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.reserve', {
      productId: entryRequest.productId,
      quantity: entryRequest.quantity,
      warehouseId: entryRequest.warehouseId,
      reserveStockForMinutes: reserveStockForMinutes
    })
    .times(times)
    .reply(200, {
      ok: true,
      reserve: {
        id: shortId.generate(),
        warehouseId: entryRequest.warehouseId,
        quantity: entryRequest.quantity,
        expirationTime: new Date()
      }
    });
}

// Helper to mock a successful stock:unreserve call
function mockStockUnReserveOk(entryRequest, times) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.unreserve', {
      unreserveQuantity: entryRequest.quantity
    })
    .times(times || 1)
    .reply(200, {
      ok: true
    });
}

// Helper to mock a un-successful stock:reserve call
function mockStockReserveNoEnoughStock(entryRequest, times) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.reserve', {
      productId: entryRequest.productId,
      quantity: entryRequest.quantity,
      warehouseId: entryRequest.warehouseId,
      reserveStockForMinutes: base.config.get('reserveStockForMinutes')
    })
    .times(times || 1)
    .reply(200, {
      ok: false,
      error: 'not_enough_stock'
    });
}

// Helper to mock a product data get
function mockProductDataGet(options, times = 1) {
  nock('http://gateway')
    .post('/services/catalog/v1/product.info', {
      id: options.productId,
      fields: '-variants'
    })
    .times(times)
    .reply(200, {
      ok: true,
      product: {
        price: options.price || 1260,
        salePrice: options.salePrice || 1041.26,
        taxCode: options.taxCode || 'default-percentage',
        isNetPrice: options.isNetPrice || false,
        categories: [],
        stockStatus: options.stockStatus || normalStockStatus,
        title: `${options.productId} title`,
        brand: `${options.productId} brand`,
        sku: `${options.productId} sku`,
        id: options.productId
      }
    });
}

// Helper to mock a product tax data get
function mockProductTaxDataGet(options, times = 1) {
  nock('http://gateway')
    .post('/services/catalog/v1/product.list', {
      id: options.productId,
      fields: 'taxCode,categories,isNetPrice'
    })
    .times(times)
    .reply(200, {
      ok: true,
      page: { limit: 10, skip: 0 },
      data: options.productId.split(',').map(productId => ({
        isNetPrice: options.isNetPrice || false,
        categories: [],
        id: productId,
        taxCode: options.taxCode || 'default-percentage'
      }))
    });
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  return server.inject(options);
}

// Helper to create Taxes
function createTaxes() {
  return callService({
    url: '/services/cart/v1/tax.create',
    payload: {
      code: 'default-percentage',
      class: 'default',
      title: 'Tax 21%',
      rate: 21,
      isPercentage: true
    }
  })
    .then(() => {
      return callService({
        url: '/services/cart/v1/tax.create',
        payload: {
          code: 'default-fixed',
          class: 'default',
          title: 'Tax 5',
          rate: 5,
          isPercentage: false
        }
      });
    })
    .then(() => {
      const taxesChannel = base.config.get('bus:channels:taxes:name');
      base.bus.publish(`${taxesChannel}.CREATE`, {});
    })
}

// Helper to create carts
function createCart(numEntries, cartEntryRequest, sequenceProducts) {
  let cart;
  return callService({
    url: '/services/cart/v1/cart.new'
  })
    .then(cartResponse => {
      if (numEntries) {
        const entryRequest = cartEntryRequest || {
          productId: '0001',
          quantity: 10,
          warehouseId: '001'
        };
        cart = cartResponse.result.cart;

        const allEntries = Array.from(new Array(numEntries), (a, i) => {
          const entry = {
            productId: entryRequest.productId + (sequenceProducts ? i : ''),
            quantity: entryRequest.quantity,
            warehouseId: entryRequest.warehouseId
          };
          mockProductDataGet(entry);
          mockStockReserveOk(entry);
          return entry;
        });
        mockProductTaxDataGet({
          productId: allEntries.map(entry => entry.productId).join(',')
        });

        return callService({
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: allEntries }
        })
          .then(entryResponses => {
            if (entryResponses.statusCode !== 200 || entryResponses.result.ok === false) {
              throw entryResponses;
            }
            return entryResponses;
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
          .then(response => {
            if (response.statusCode !== 200 || response.result.ok === false) {
              throw response;
            }
            return response.result.cart;
          })
          .catch(error => {
            console.error(error);
            return error;
          });
      }
      return cartResponse.result.cart;
    });
}

/*
 Cart Tests
 */
describe('Cart', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('creates a Cart for an anonymous User', done => {
    const options = {
      url: '/services/cart/v1/cart.new'
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "expirationTime": "2016-05-29T17:10:37.872Z",
        //     "id": "ByUGODyQ",
        //     "items": [],
        //     "userId": "anonymous"
        //   }
        // }
        expect(response.result.ok).to.equal(true);
        const cart = response.result.cart;
        expect(cart.id).to.be.a.string();
        expect(cart.expirationTime).to.be.a.date();
        expect(cart.items).to.be.an.array().and.to.be.empty();
        expect(cart.userId).to.be.a.string().and.to.equal('anonymous');
        done();
    });
  });

  it('retrieves a non-existent cart', done => {
    const options = {
      method: 'GET',
      url: '/services/cart/v1/cart.info?cartId=xxxx'
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // {
        //   "ok": fase,
        //   "error": "cart_not_found"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('cart_not_found');
        done();
      });
  });

  it('retrieves an existing cart', done => {
    let cartId;
    createCart()
      .then((cart) => {
        cartId = cart.id;
        const options = {
          method: 'GET',
          url: `/services/cart/v1/cart.info?cartId=${cartId}`
        };
        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "userId": "anonymous",
        //     "expirationTime": "2016-05-26T08:17:03.150Z",
        //     "items": [],
        //     "id": "HkwKLxjG"
        //   }
        // }
        expect(response.result.ok).to.equal(true);
        const cart = response.result.cart;
        expect(cart.id).to.be.a.string().and.to.equal(cartId);
        expect(cart.expirationTime).to.be.a.date();
        expect(cart.items).to.be.an.array().and.to.be.empty();
        expect(cart.userId).to.be.a.string().and.to.equal('anonymous');
        done();
      })
      .catch((error) => done(error));
  });
});

/*
 Cart entries Tests
 */
describe('Cart Entries', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('adds an entry to a non-existent cart', done => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    const options = {
      url: '/services/cart/v1/cart.addEntry?cartId=xxxxxx',
      payload: { items: [entryRequest] }
    };
    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": fase,
        //   "error": "cart_not_found"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('cart_not_found');
        done();
      });
  });

  it('adds an entry an existing cart', done => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockStockReserveOk(entryRequest);
        mockProductDataGet(entryRequest);
        mockProductTaxDataGet({ productId: entryRequest.productId });
        const options = {
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: [entryRequest] }
        };
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "reserves": [{
        //     "productId": "0001",
        //     "id": "ry5NVs-Q",
        //     "warehouseId": "001",
        //     "quantity": 10,
        //     "expirationTime": "2016-05-24T09:53:46.425Z"
        //   }]
        // }
        const result = response.result;
        expect(result.ok).to.equal(true);
        const reserves = result.reserves;
        expect(reserves).to.be.an.array().and.to.have.length(1);
        const reserve = reserves[0];
        expect(reserve.id).to.be.a.string();
        expect(reserve.productId).to.be.a.string().and.to.equal(entryRequest.productId);
        expect(reserve.quantity).to.be.a.number().and.to.equal(entryRequest.quantity);
        expect(reserve.warehouseId).to.be.a.string().and.to.equal(entryRequest.warehouseId);
        expect(reserve.expirationTime).to.be.a.string();
        try {
          const expirationTime = new Date(reserve.expirationTime);
        } catch (e) {
          return done(new Error(`${reserve.expirationTime} is not a Date`));
        }
        return done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a quantity > maxQuantityPerProduct', done => {
    const maxQuantityPerProduct = base.config.get('maxQuantityPerProduct');
    const entryRequest = {
      productId: '0001',
      quantity: maxQuantityPerProduct + 1,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        const options = {
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: [entryRequest] }
        };
        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "max_quantity_per_product_exceeded"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('max_quantity_per_product_exceeded');
        expect(result.data.productId).to.equal(entryRequest.productId);
        expect(result.data.maxQuantityAllowed).to.equal(maxQuantityPerProduct);
        expect(result.data.requestedQuantity).to.equal(entryRequest.quantity);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a full cart', done => {
    const maxNumberOfEntries = base.config.get('maxNumberOfEntries');
    const entryRequest1 = {
      productId: '0001',
      quantity: 1,
      warehouseId: '001'
    };
    const entryRequest2 = {
      productId: '0002',
      quantity: 1,
      warehouseId: '001'
    };
    createCart(maxNumberOfEntries, entryRequest1, true)
      .then(cart => {
        const options = {
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: [entryRequest2] }
        };
        return callService(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "max_quantity_per_product_exceeded"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('max_number_of_entries_exceeded');
        expect(result.data.maxEntriesAllowed).to.equal(maxNumberOfEntries);
        expect(result.data.requestedEntries).to.equal(maxNumberOfEntries + 1);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a product without stock', done => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockProductDataGet(entryRequest);
        mockStockReserveNoEnoughStock(entryRequest);
        const options = {
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: [entryRequest] }
        };
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "not_enough_stock"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('not_enough_stock');
        done();
      })
      .catch((error) => done(error));
  });

  it('adds two entries, the second with a product without stock', done => {
    const entryRequest1 = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    const entryRequest2 = {
      productId: '0002',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockProductDataGet(entryRequest1);
        mockProductDataGet(entryRequest2);
        mockStockReserveOk(entryRequest1);
        mockStockReserveNoEnoughStock(entryRequest2);
        // The first product, already reserved, should be unreserved
        mockStockUnReserveOk(entryRequest1);
        const options = {
          url: `/services/cart/v1/cart.addEntry?cartId=${cart.id}`,
          payload: { items: [entryRequest1, entryRequest2] }
        };
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "not_enough_stock"
        // }
        const result = response.result;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('not_enough_stock');
        done();
      })
      .catch((error) => done(error));
  });

});

/*
 Taxes Tests
 */
describe('Taxes', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('calculates gross percentage tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', quantity: 2, price: 100 };
    createCart()
      .then(() => {
        const options = {
          url: `/services/cart/v1/tax.cartTaxes?cartId=${cartId}`,
          payload: { items: [entryRequest] }
        };
        mockProductTaxDataGet({ productId: entryRequest.productId });
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 200,
        //       "tax": 42,
        //       "taxDetail": "Tax 21%"
        //     }]
        //   }
        // }
        const result = response.result;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].beforeTax).to.be.a.number().and.to.equal(200);
        expect(cart.items[0].tax).to.be.a.number().and.to.equal(42);
        expect(cart.items[0].taxDetail).to.be.a.string().and.to.equal('Tax 21%');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates net percentage tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', quantity: 2, price: 100 };
    createCart()
      .then(() => {
        const options = {
          url: `/services/cart/v1/tax.cartTaxes?cartId=${cartId}`,
          payload: { items: [entryRequest] }
        };
        mockProductTaxDataGet({ productId: entryRequest.productId, isNetPrice: true });
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 158,
        //       "tax": 42,
        //       "taxDetail": "Tax 21%"
        //     }]
        //   }
        // }
        const result = response.result;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].beforeTax).to.be.a.number().and.to.equal(158);
        expect(cart.items[0].tax).to.be.a.number().and.to.equal(42);
        expect(cart.items[0].taxDetail).to.be.a.string().and.to.equal('Tax 21%');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates gross fixed tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', quantity: 2, price: 100 };
    createCart()
      .then(() => {
        const options = {
          url: `/services/cart/v1/tax.cartTaxes?cartId=${cartId}`,
          payload: { items: [entryRequest] }
        };
        mockProductTaxDataGet({ productId: entryRequest.productId, taxCode: 'default-fixed' });
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 200,
        //       "tax": 10,
        //       "taxDetail": "Tax 5"
        //     }]
        //   }
        // }
        const result = response.result;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].beforeTax).to.be.a.number().and.to.equal(200);
        expect(cart.items[0].tax).to.be.a.number().and.to.equal(10);
        expect(cart.items[0].taxDetail).to.be.a.string().and.to.equal('Tax 5');
        done();
      })
      .catch((error) => done(error));
  });

  it('calculates net fixed tax', done => {
    const cartId = 'xxxx';
    const entryRequest = { id: '1', productId: '0001', quantity: 2, price: 100 };
    createCart()
      .then(() => {
        const options = {
          url: `/services/cart/v1/tax.cartTaxes?cartId=${cartId}`,
          payload: { items: [entryRequest] }
        };
        mockProductTaxDataGet({
          productId: entryRequest.productId,
          taxCode: 'default-fixed',
          isNetPrice: true
        });
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "cart": {
        //     "cartId": "xxxx",
        //     "items": [{
        //       "id": "1",
        //       "productId": "0001",
        //       "quantity": 2,
        //       "price": 100,
        //       "beforeTax": 190,
        //       "tax": 10,
        //       "taxDetail": "Tax 5"
        //     }]
        //   }
        // }
        const result = response.result;
        expect(result.ok).to.equal(true);
        const cart = result.cart;
        expect(cart.cartId).to.be.a.string().and.to.equal(cartId);
        expect(cart.items[0].beforeTax).to.be.a.number().and.to.equal(190);
        expect(cart.items[0].tax).to.be.a.number().and.to.equal(10);
        expect(cart.items[0].taxDetail).to.be.a.string().and.to.equal('Tax 5');
        done();
      })
      .catch((error) => done(error));
  });

});