const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest-as-promised');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const app = base.transports.http.app;

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
    done();
  });
}

// Helper to mock a successful stock:reserve call
function mockStockReserveOk(itemRequest, times = 1) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.reserve', {
      productId: itemRequest.productId,
      quantity: itemRequest.quantity,
      warehouseId: itemRequest.warehouseId,
      reserveStockForMinutes: reserveStockForMinutes
    })
    .times(times)
    .reply(200, {
      ok: true,
      reserve: {
        id: shortId.generate(),
        warehouseId: itemRequest.warehouseId,
        quantity: itemRequest.quantity,
        expirationTime: new Date()
      }
    });
}

// Helper to mock a successful stock:unreserve call
function mockStockUnReserveOk(itemRequest, times) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.unreserve', {
      unreserveQuantity: itemRequest.quantity
    })
    .times(times || 1)
    .reply(200, {
      ok: true
    });
}

// Helper to mock a un-successful stock:reserve call
function mockStockReserveNoEnoughStock(itemRequest, times) {
  nock('http://gateway')
    .post('/services/stock/v1/stock.reserve', {
      productId: itemRequest.productId,
      quantity: itemRequest.quantity,
      warehouseId: itemRequest.warehouseId,
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

// Helper to mock create taxes operation
function mockCartTaxes(times = 1) {
  nock('http://gateway')
    .post('/services/tax/v1/tax.cartTaxes')
    .times(times)
    .reply(function(uri, requestBody) {
      let items = requestBody.items.map(item => {return {
        productId: item.productId,
        quantity: item.quantity,
        price: 11,
        beforeTax: 10,
        tax: 10,
        taxDetail: "Tax 10",
        id: item.id
      }});

      return [
        201,
        {
          ok: true,
          cart: {
            cartId: requestBody.cartId,
            items
          }
        }
      ];
    });
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  const promise = request(app)[options.method.toLowerCase()](options.url);
  Object.keys(options.headers).forEach(key => {
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
    .then(cartResponse => {
      if (numEntries) {
        const itemRequest = cartitemRequest || {
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

        if(mockProductTaxData) {
          mockProductTaxDataGet({
            productId: allEntries.map(itemId => itemId.productId).join(',')
          });
        }

        return callService({
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: allEntries }
        })
          .then(itemResponses => {
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
          .then(response => {
            if (response.statusCode !== 200 || response.body.ok === false) {
              throw response;
            }
            return response.body.cart;
          })
          .catch(error => {
            console.error(error);
            return error;
          });
      }
      return cartResponse.body.cart;
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
      url: '/services/cart/v1/cart.create'
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
        console.log(response.body);
        expect(response.body.ok).to.equal(true);
        const cart = response.body.cart;
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
        const result = response.body;
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
        expect(response.body.ok).to.equal(true);
        const cart = response.body.cart;
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

  it('adds an itemId to a non-existent cart', done => {
    const itemRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    const options = {
      url: '/services/cart/v1/cart.addToCart?cartId=xxxxxx',
      payload: { items: [itemRequest] }
    };

    callService(options)
      .then(response => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": fase,
        //   "error": "cart_not_found"
        // }
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.equal('cart_not_found');
        done();
      });
  });

  it('adds an itemId an existing cart', done => {
    const itemRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockStockReserveOk(itemRequest);
        mockProductDataGet(itemRequest);
        mockCartTaxes();
        const options = {
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: [itemRequest] }
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
        const result = response.body;
        expect(result.ok).to.equal(true);
        const reserves = result.reserves;
        expect(reserves).to.be.an.array().and.to.have.length(1);
        const reserve = reserves[0];
        expect(reserve.id).to.be.a.string();
        expect(reserve.productId).to.be.a.string().and.to.equal(itemRequest.productId);
        expect(reserve.quantity).to.be.a.number().and.to.equal(itemRequest.quantity);
        expect(reserve.warehouseId).to.be.a.string().and.to.equal(itemRequest.warehouseId);
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

  it('adds an itemId with a quantity > maxQuantityPerProduct', done => {
    const maxQuantityPerProduct = base.config.get('maxQuantityPerProduct');
    const itemRequest = {
      productId: '0001',
      quantity: maxQuantityPerProduct + 1,
      warehouseId: '001'
    };

    createCart()
      .then(cart => {
        const options = {
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: [itemRequest] }
        };
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "max_quantity_per_product_exceeded"
        // }
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('max_quantity_per_product_exceeded');
        expect(result.data.productId).to.equal(itemRequest.productId);
        expect(result.data.maxQuantityAllowed).to.equal(maxQuantityPerProduct);
        expect(result.data.requestedQuantity).to.equal(itemRequest.quantity);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an itemId with a full cart', done => {
    const maxNumberOfEntries = base.config.get('maxNumberOfEntries');
    const itemRequest1 = {
      productId: '0001',
      quantity: 1,
      warehouseId: '001'
    };
    const itemRequest2 = {
      productId: '0002',
      quantity: 1,
      warehouseId: '001'
    };
    mockCartTaxes();
    createCart(maxNumberOfEntries, itemRequest1, true, false)
      .then(cart => {
        const options = {
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: [itemRequest2] }
        };
        return callService(options);
      })
      .then(response => {
        expect(nock.isDone()).to.equal(true);
        expect(response.statusCode).to.equal(200);
        // Expected result:
        // {
        //   "ok": true,
        //   "error", "max_quantity_per_product_exceeded"
        // }
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('max_number_of_entries_exceeded');
        expect(result.data.maxEntriesAllowed).to.equal(maxNumberOfEntries);
        expect(result.data.requestedEntries).to.equal(maxNumberOfEntries + 1);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an itemId with a product without stock', done => {
    const itemRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockProductDataGet(itemRequest);
        mockStockReserveNoEnoughStock(itemRequest);
        const options = {
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: [itemRequest] }
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
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('not_enough_stock');
        done();
      })
      .catch((error) => done(error));
  });

  it('adds two entries, the second with a product without stock', done => {
    const itemRequest1 = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    const itemRequest2 = {
      productId: '0002',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockProductDataGet(itemRequest1);
        mockProductDataGet(itemRequest2);
        mockStockReserveOk(itemRequest1);
        mockStockReserveNoEnoughStock(itemRequest2);
        // The first product, already reserved, should be unreserved
        mockStockUnReserveOk(itemRequest1);
        const options = {
          url: `/services/cart/v1/cart.addToCart?cartId=${cart.id}`,
          payload: { items: [itemRequest1, itemRequest2] }
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
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('not_enough_stock');
        done();
      })
      .catch((error) => done(error));
  });

});