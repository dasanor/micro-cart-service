const Code = require('code');
const Lab = require('lab');
const DatabaseCleaner = require('database-cleaner');

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

if (!base.db.url.includes('test')) {
  console.log('')
  console.log('[test] THIS DATABASE IS NOT A TEST DATABASE!')
  console.log('')
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
};

describe('Cart', () => {

  before((done) => {
    initDB(done);
  });

  after((done) => {
    initDB(done);
  });

  it('creates a Cart for an anonymous User', (done) => {
    done();
  });

  it('creates a Cart for an anonymous User', (done) => {
    var options = {
      method: 'POST',
      url: '/services/cart/v1/new',
      payload: {}
    };
    server.inject(options, (response) => {
      const result = response.result;
      expect(response.statusCode).to.equal(200);
      // Expected result:
      //
      // {
      //   "expirationTime": "2016-05-29T17:10:37.872Z",
      //   "id": "ByUGODyQ",
      //   "items": [
      //   ],
      //   "userId": "anonymous"
      // }
      expect(result.id).to.be.a.string();
      expect(result.expirationTime).to.be.a.date();
      expect(result.items).to.be.an.array().and.to.be.empty();
      expect(result.userId).to.be.a.string().and.to.equal('anonymous');
      done();
    });
  });

  it('adds an entry to a unexistent cart', (done) => {
    var options = {
      method: 'POST',
      url: '/services/cart/v1/addEntry',
      payload: {
        cartId: 'xxxxxx',
        productId: '0001',
        quantity: 10,
        warehouse: '001'
      }
    };
    server.inject(options, (response) => {
      const result = response.result;
      expect(response.statusCode).to.equal(404);
      // Expected result:
      //
      // {
      //   statusCode: 404,
      //   error: 'Not Found',
      //   message: 'Cart not found'
      // }
      expect(result.statusCode).to.be.a.number().and.to.equal(404);
      expect(result.error).to.be.a.string().and.to.equal('Not Found');
      expect(result.message).to.be.a.string().and.to.equal('Cart not found');
      done();
    });
  });

});
