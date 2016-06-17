const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const DatabaseCleaner = require('database-cleaner');
const nock = require('nock');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const server = base.services.server;

const databaseCleaner = new DatabaseCleaner('mongodb');
const connect = require('mongodb').connect;

const defaultHeaders = base.config.get('test:defaultHeaders');

// Check the environment
if (process.env.NODE_ENV !== 'test') {
  console.log('');
  console.log('[test] THIS ENVIRONMENT IS NOT FOR TEST!');
  console.log('');
  process.exit(1);
}
// Check the database
if (!base.db.url.includes('test')) {
  console.log('');
  console.log('[test] THIS DATABASE IS NOT A TEST DATABASE!');
  console.log('');
  process.exit(1);
}

function createTaxes() {
  return server.inject({
      method: 'POST',
      url: '/services/cart/v1/tax',
      headers: defaultHeaders,
      payload: {
        code: 'default-percentage',
        class: 'default',
        title: 'Tax 21%',
        rate: 21,
        isPercentage: true
      }
    })
    .then(() => {
      return server.inject({
        method: 'POST',
        url: '/services/cart/v1/tax',
        headers: defaultHeaders,
        payload: {
          code: 'default-fixed',
          class: 'default',
          title: 'Tax 5',
          rate: 5,
          isPercentage: false
        }
      })
    })
}

// Helper to clean the database
function initDB(done) {
  connect(base.db.url, (err, db) => {
    databaseCleaner.clean(db, () => {
      console.log('[test] database cleaned');
      createTaxes()
        .then(() => {
          db.close();
          done();
        })
    });
  });
}

// Helper to mock a successful stock:reserve call
function mockStockReserveOk(entryRequest) {
  nock('http://gateway')
    .post('/services/stock/v1/reserve', {
      productId: entryRequest.productId,
      quantity: entryRequest.quantity,
      warehouseId: entryRequest.warehouseId,
      reserveStockForMinutes: base.config.get('hooks:stockAvailability:reserveStockForMinutes')
    })
    .reply(200, {
      code: 301,
      msg: 'Stock verified and reserved',
      reserve: {
        id: shortId.generate(),
        warehouseId: entryRequest.warehouseId,
        quantity: entryRequest.quantity,
        expirationTime: new Date()
      }
    });
}

// Helper to mock a un-successful stock:reserve call
function mockStockReserveNoEnoughStock(entryRequest) {
  nock('http://gateway')
    .post('/services/stock/v1/reserve', {
      productId: entryRequest.productId,
      quantity: entryRequest.quantity,
      warehouseId: entryRequest.warehouseId,
      reserveStockForMinutes: base.config.get('hooks:stockAvailability:reserveStockForMinutes')
    })
    .reply(406, {
      statusCode: 406,
      error: 'Not Acceptable',
      message: `The warehouse '${entryRequest.warehouseId}' doesn't have enough stock for the product '${entryRequest.productId}'`
    });
}

// Helper to mock a product data get
function mockProductDataGet(entryRequest) {
  nock('http://gateway')
    .get(`/services/catalog/v1/product/${entryRequest.productId}`)
    .reply(200, {
      price: 1260,
      salePrice: 1041.26,
      taxCode: 'default-percentage',
      isNetPrice: false,
      categories: [],
      id: entryRequest.productId
    });
}

// Helper to mock a product tax data get
function mockProductTaxDataGet(entryRequest) {
  nock('http://gateway')
    .get(`/services/catalog/v1/product?id=${entryRequest.productId}&fields=taxCode,categories,isNetPrice`)
    .reply(200, {
      page: { limit: 10, skip: 0 },
      data: [
        {
          isNetPrice: false,
          categories: [],
          id: entryRequest.productId,
          taxCode: 'default-percentage'
        }
      ]
    });
}

// Helper to create carts
function createCart(numEntries, cartEntryRequest) {
  let cart;
  return server.inject({
      method: 'POST',
      url: '/services/cart/v1',
      headers: defaultHeaders
    })
    .then(cartResponse => {
      if (numEntries) {
        const entryRequest = cartEntryRequest || {
          productId: '0001',
          quantity: 10,
          warehouseId: '001'
        };
        cart = cartResponse.result;

        const addEntry = function (cartId) {
          mockProductDataGet(entryRequest);
          mockProductTaxDataGet(entryRequest);
          mockStockReserveOk(entryRequest);
          return new Promise((resolve, reject) => {
            server.inject({
                method: 'POST',
                url: `/services/cart/v1/${cartId}/entry`,
                payload: entryRequest,
                headers: defaultHeaders
              })
              .then(entryResponse => {
                if (entryResponse.result && entryResponse.result.statusCode) {
                  console.error(entryResponse.result);
                  return reject(entryResponse.result);
                }
                resolve(entryResponse);
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
          });
        };
        const allAddEntries = Array.from(new Array(numEntries), () => addEntry(cart.id));

        return Promise
          .all(allAddEntries)
          .then(() => {
            return server.inject({
                method: 'GET',
                url: `/services/cart/v1/${cart.id}`,
                headers: defaultHeaders
              })
              .then(response => {
                if (response.result && response.result.statusCode) {
                  console.error(response.result);
                }
                return response.result;
              })
              .catch(error => {
                console.error(error);
                return error;
              });
          });
      }
      return cartResponse.result;
    });
}

describe('Cart', () => {
  before((done) => {
    initDB(done);
  });
  after((done) => {
    initDB(done);
  });

  it('creates a Cart for an anonymous User', (done) => {
    const options = {
      method: 'POST',
      url: '/services/cart/v1',
      headers: defaultHeaders
    };
    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(201);
      // Expected result:
      //
      // {
      //   "expirationTime": "2016-05-29T17:10:37.872Z",
      //   "id": "ByUGODyQ",
      //   "items": [
      //   ],
      //   "userId": "anonymous"
      // }
      const cart = response.result;
      expect(cart.id).to.be.a.string();
      expect(cart.expirationTime).to.be.a.date();
      expect(cart.items).to.be.an.array().and.to.be.empty();
      expect(cart.userId).to.be.a.string().and.to.equal('anonymous');
      done();
    });
  });

  it('retrieves a non-existent cart', (done) => {
    const options = {
      method: 'GET',
      url: '/services/cart/v1/xxxx',
      headers: defaultHeaders
    };
    server.inject(options)
      .then((response) => {
        expect(response.statusCode).to.equal(404);
        const result = response.result;
        expect(result.statusCode).to.be.a.number().and.to.equal(404);
        expect(result.error).to.be.a.string().and.to.equal('Not Found');
        expect(result.message).to.be.a.string().and.to.equal('Cart not found');
        done();
      });
  });

  it('retrieves an existing cart', (done) => {
    let cartId;
    createCart()
      .then((cart) => {
        cartId = cart.id;
        const options = {
          method: 'GET',
          url: `/services/cart/v1/${cartId}`,
          headers: defaultHeaders
        };
        return server.inject(options);
      })
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        //
        // {
        //   "userId": "anonymous",
        //   "expirationTime": "2016-05-26T08:17:03.150Z",
        //   "items": [],
        //   "id": "HkwKLxjG"
        // }
        const cart = response.result;
        expect(cart.id).to.be.a.string().and.to.equal(cartId);
        expect(cart.expirationTime).to.be.a.date();
        expect(cart.items).to.be.an.array().and.to.be.empty();
        expect(cart.userId).to.be.a.string().and.to.equal('anonymous');
        done();
      })
      .catch((error) => done(error));
  });
});

describe('Cart Entries', () => {
  before((done) => {
    initDB(done);
  });
  after((done) => {
    initDB(done);
  });

  it('adds an entry to a non-existent cart', (done) => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    const options = {
      method: 'POST',
      url: '/services/cart/v1/xxxxxx/entry',
      payload: entryRequest,
      headers: defaultHeaders
    };
    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(404);
      // Expected result:
      //
      // {
      //   statusCode: 404,
      //   error: 'Not Found',
      //   message: 'Cart not found'
      // }
      const result = response.result;
      expect(result.statusCode).to.be.a.number().and.to.equal(404);
      expect(result.error).to.be.a.string().and.to.equal('Not Found');
      expect(result.message).to.be.a.string().and.to.equal('Cart not found');
      done();
    });
    /**/
  });

  it('adds an entry an existing cart', (done) => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        mockStockReserveOk(entryRequest);
        mockProductDataGet(entryRequest);
        mockProductTaxDataGet(entryRequest);
        const options = {
          method: 'POST',
          url: `/services/cart/v1/${cart.id}/entry`,
          payload: entryRequest,
          headers: defaultHeaders
        };
        return server.inject(options);
      })
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        // Expected result:
        //
        // {
        //   "id": "rJ5NVs-X",
        //   "productId": "0001",
        //   "quantity": 10,
        //   "reserves": [
        //     {
        //       "id": "ry5NVs-Q",
        //       "warehouseId": "001",
        //       "quantity": 10,
        //       "expirationTime": "2016-05-24T09:53:46.425Z"
        //     }
        //   ]
        // }
        const entry = response.result;
        expect(entry.id).to.be.a.string();
        expect(entry.productId).to.be.a.string().and.to.equal(entryRequest.productId);
        expect(entry.quantity).to.be.a.number().and.to.equal(entryRequest.quantity);
        expect(entry.reserves).to.be.an.array().and.to.have.length(1);
        expect(entry.reserves[0].id).to.be.a.string();
        expect(entry.reserves[0].warehouseId).to.be.a.string().and.to.equal(entryRequest.warehouseId);
        expect(entry.reserves[0].quantity).to.be.a.number().and.to.equal(entryRequest.quantity);
        expect(entry.reserves[0].expirationTime).to.be.a.string();
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a quantity > maxQuantityPerProduct', (done) => {
    const maxQuantityPerProduct = base.config.get('hooks:preAddToCart:maxQuantityPerProduct');
    const entryRequest = {
      productId: '0001',
      quantity: maxQuantityPerProduct + 1,
      warehouseId: '001'
    };
    createCart()
      .then(cart => {
        const options = {
          method: 'POST',
          url: `/services/cart/v1/${cart.id}/entry`,
          payload: entryRequest,
          headers: defaultHeaders
        };
        return server.inject(options);
      })
      .then((response) => {
        expect(response.statusCode).to.equal(406);
        // Expected result:
        //
        // {
        //   statusCode: 406,
        //   error: 'Not Acceptable',
        //   message: 'Quantity in cart for this product must be less than or equal to ${maxQuantityPerProduct}'
        // }
        const result = response.result;
        expect(result.statusCode).to.be.a.number().and.to.equal(406);
        expect(result.error).to.be.a.string().and.to.equal('Not Acceptable');
        expect(result.message).to.be.a.string().and.to.startWith(`Quantity in cart for this product must be less or equal than '${maxQuantityPerProduct}'`);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a full cart', (done) => {
    const maxNumberOfEntries = base.config.get('hooks:preAddToCart:maxNumberOfEntries');
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart(maxNumberOfEntries, entryRequest)
      .then(cart => {
        const options = {
          method: 'POST',
          url: `/services/cart/v1/${cart.id}/entry`,
          payload: entryRequest,
          headers: defaultHeaders
        };

        return server.inject(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(406);
        // Expected result:
        //
        // {
        //   statusCode: 406,
        //   error: 'Not Acceptable',
        //   message: 'Number of entries must be less or equal than ${maxQuantityPerProduct}'
        // }
        const result = response.result;
        expect(result.statusCode).to.be.a.number().and.to.equal(406);
        expect(result.error).to.be.a.string().and.to.equal('Not Acceptable');
        expect(result.message).to.be.a.string().and.to.startWith(`Number of entries must be less or equal than '${maxNumberOfEntries}'`);
        done();
      })
      .catch((error) => done(error));
  });

  it('adds an entry with a product without stock', (done) => {
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
          method: 'POST',
          url: `/services/cart/v1/${cart.id}/entry`,
          payload: entryRequest,
          headers: defaultHeaders
        };
        return server.inject(options);
      })
      .then(response => {
        expect(response.statusCode).to.equal(406);
        // Expected result:
        //
        // {
        //   statusCode: 406,
        //   error: 'Not Acceptable',
        //   message: 'The warehouse \'001\' doesn\'t have enough stock for the product \'0001\''
        // }
        const result = response.result;
        expect(result.statusCode).to.be.a.number().and.to.equal(406);
        expect(result.error).to.be.a.string().and.to.equal('Not Acceptable');
        expect(result.message).to.be.a.string().and.to.equal(`The warehouse '${entryRequest.warehouseId}' doesn't have enough stock for the product '${entryRequest.productId}'`);
        done();
      })
      .catch((error) => done(error));
  });

});

describe('Taxes', () => {
  before((done) => {
    initDB(done);
  });
  after((done) => {
    initDB(done);
  });

  it('calculates gross percentage tax', (done) => {
    const cart = {};
    const item = { quantity: 1, price: 100 };
    const product = { isNetPrice: false };
    const taxCode = 'default-percentage';
    const { beforeTax, tax, taxDetail } = base.taxesCalculationService.calculateItemTaxes(cart, item, product, taxCode);
    expect(beforeTax).to.be.a.number().and.to.equal(100);
    expect(tax).to.be.a.number().and.to.equal(21);
    done();
  });

  it('calculates net percentage tax', (done) => {
    const cart = {};
    const item = { quantity: 1, price: 100 };
    const product = { isNetPrice: true };
    const taxCode = 'default-percentage';
    const { beforeTax, tax, taxDetail } = base.taxesCalculationService.calculateItemTaxes(cart, item, product, taxCode);
    expect(beforeTax).to.be.a.number().and.to.equal(79);
    expect(tax).to.be.a.number().and.to.equal(21);
    done();
  });

  it('calculates gross fixed tax', (done) => {
    const cart = {};
    const item = { quantity: 1, price: 100 };
    const product = { isNetPrice: false };
    const taxCode = 'default-fixed';
    const { beforeTax, tax, taxDetail } = base.taxesCalculationService.calculateItemTaxes(cart, item, product, taxCode);
    expect(beforeTax).to.be.a.number().and.to.equal(100);
    expect(tax).to.be.a.number().and.to.equal(5);
    done();
  });

  it('calculates net fixed tax', (done) => {
    const cart = {};
    const item = { quantity: 1, price: 100 };
    const product = { isNetPrice: true };
    const taxCode = 'default-fixed';
    const { beforeTax, tax, taxDetail } = base.taxesCalculationService.calculateItemTaxes(cart, item, product, taxCode);
    expect(beforeTax).to.be.a.number().and.to.equal(95);
    expect(tax).to.be.a.number().and.to.equal(5);
    done();
  });

});