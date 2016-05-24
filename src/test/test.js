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

function initDB(done) {
  console.log('[test] cleaning database');
  connect(base.db.url, (err, db) => {
    databaseCleaner.clean(db, () => {
      console.log('[test] database cleaned');
      db.close();
      done();
    });
  });
}

function createCart() {
  return server.inject({
    method: 'POST',
    url: '/services/cart/v1'
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
    var options = {
      method: 'POST',
      url: '/services/cart/v1'
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

  it('adds an entry to a non-existent cart', (done) => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    var options = {
      method: 'PUT',
      url: '/services/cart/v1/xxxxxx/addEntry',
      payload: entryRequest
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
  });

  it('adds an entry an existing cart', (done) => {
    const entryRequest = {
      productId: '0001',
      quantity: 10,
      warehouseId: '001'
    };
    createCart()
      .then((response) => {
        const cart = response.result;

        // Mock a succesfull stock:reserve call
        nock('http://gateway/')
          .post('/services/stock/v1/reserve', {
            productId: entryRequest.productId,
            quantity: entryRequest.quantity,
            warehouseId: entryRequest.warehouseId,
            reserveStockForMinutes: 1440
          })
          .reply(200, {
            code: 301,
            msg: 'Stock verified and reserved',
            reserve: {
              id: 'HkMR42Wm',
              warehouseId: entryRequest.warehouseId,
              quantity: entryRequest.quantity,
              expirationTime: '2016-05-24T11:04:34.371Z'
            }
          });

        const options = {
          method: 'PUT',
          url: `/services/cart/v1/${cart.id}/addEntry`,
          payload: entryRequest
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
});
