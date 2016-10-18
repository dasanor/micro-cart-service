const shortId = require('shortid');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Cart');

  // From ProductModel
  const STOCKSTATUS = {
    NORMAL: 0,
    UNLIMITED: 1,
    DISCONTINUED: 2
  };

  // The reservations schema
  const reservesSchema = base.db.Schema({
    id: { type: String, required: true },
    warehouseId: { type: String, required: true },
    quantity: { type: Number, required: true },
    expirationTime: { type: Date, required: true }
  }, { _id: false });

  // The taxes schema
  const taxesSchema = base.db.Schema({
    ok: { type: Boolean, required: true, default: true },
    error: { type: String, required: false },
    tax: { type: Number, required: true, default: 0.00 },
    beforeTax: { type: Number, required: true, default: 0.00 }
  }, { _id: false });

  // Enable the virtuals when converting to JSON
  reservesSchema.set('toJSON', {
    virtuals: true
  });

  // The line items schema
  const itemsSchema = base.db.Schema({
    id: { type: String, required: true },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    beforeTax: { type: Number, required: false, default: 0.00 },
    tax: { type: Number, required: false, default: 0.00 },
    taxDetail: { type: String, required: false },
    reserves: [reservesSchema]
  }, { _id: false });

  // Enable the virtuals when converting to JSON
  itemsSchema.set('toJSON', {
    virtuals: true
  });

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    userId: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    items: [itemsSchema],
    taxes: { type: taxesSchema, required: true },
    promotions: { type: base.db.Schema.Types.Mixed, required: true }
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

  const model = base.db.model('Cart', schema);
  model.STOCKSTATUS = STOCKSTATUS;

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
