const shortId = require('shortid');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Stock')
  // The reservations schema
  const reservesSchema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    warehouseId: { type: String, required: true },
    quantity: { type: Number, required: true },
    expirationTime: { type: Date, required: true }
  }, { _id: false });

  // The line items schema
  const itemsSchema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    reserves: [reservesSchema]
  }, { _id: false });

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    userId: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    total: { type: Number, required: true, default: 0.00 },
    items: [itemsSchema]
  }, { _id: false, timestamps: true });

  // Enable the virtuals when converting to JSON
  schema.set('toJSON', {
    virtuals: true
  });

  // Add a method to clean the object before sending it to the client
  schema.method('toClient', function () {
    const obj = this.toJSON();
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  });

  // Add the model to mongoose
  return base.db.model('Cart', schema);
}

module.exports = modelFactory;
