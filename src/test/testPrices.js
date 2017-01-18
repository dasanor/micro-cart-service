const moment = require('moment');

const Code = require('code');
const Lab = require('lab');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const service = require('../index.js');
const base = service.base || service.start().base;

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

/*
 Prices Tests
 */
describe('Prices', () => {
  const fn = require('../operations/chains/addToCart/selectPrice')(base);

  let context;

  beforeEach((done) => {
    initDB(done);
    context = {
      cart: { currency: 'USD', channel: 'WEB', country: 'US' },
      customer: { country: 'US', tags: ['VIP'] },
      product: {
        prices: [{ amount: 10.00, currency: 'USD' }]
      }
    };
  });
  after((done) => {
    cleanDB(done);
  });

  it('select a price - single', (done) => {
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[0]);
      done();
    });
  });

  it('select a price - country over single', (done) => {
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US' });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[1]);
      done();
    });
  });

  it('select a price - channel over country', (done) => {
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', channel: 'WEB' });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[2]);
      done();
    });
  });

  it('select a price - customerType over country & channel', (done) => {
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', channel: 'WEB' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US', channel: 'WEB' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', customerType: 'VIP' });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[4]);
      done();
    });
  });

  it('select a price - customerType+channel over customerType+country', (done) => {
    context.product.prices.push({ amount: 10.00, currency: 'USD', customerType: 'VIP', country: 'US' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', customerType: 'VIP', channel: 'WEB' });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[2]);
      done();
    });
  });

  it('select a price - within period over without period', (done) => {
    const validFrom = moment().add(-1, 'day').toISOString();
    const validUntil = moment().add(1, 'day').toISOString();
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US', validFrom, validUntil });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[2]);
      done();
    });
  });

  it('select a price - don\'t consider invalid period', (done) => {
    const validFrom = moment().add(1, 'day').toISOString();
    const validUntil = moment().add(2, 'day').toISOString();
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US' });
    context.product.prices.push({ amount: 10.00, currency: 'USD', country: 'US', validFrom, validUntil });
    fn(context, (error) => {
      expect(error).to.equal(undefined);
      expect(context.selectedPrice).to.equal(context.product.prices[1]);
      done();
    });
  });
});
