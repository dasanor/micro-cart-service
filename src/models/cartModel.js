const shortId = require('shortid');

function modelFactory(base, configKeys) {
  const modelName = configKeys[configKeys.length - 1];
  if (base.logger.isDebugEnabled()) base.logger.debug(`[db] registering model '${modelName}'`);

  // From ProductModel
  const STOCKSTATUS = {
    NORMAL: 0,
    UNLIMITED: 1,
    DISCONTINUED: 2
  };

  // The address schema
  const shippingAddressSchema = base.db.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address_1: { type: String, required: true },
    address_2: { type: String, required: false },
    postCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    company: { type: String, required: false },
    phone: { type: Number, required: false },
    instructions: { type: String, required: false }
  }, { _id: false });

  // Rates Schema
  const ratesSchema = base.db.Schema({
    currency: { type: String, required: true }, // ISO 4217
    amount: { type: Number, required: true }
  }, { _id: false });

  // The shipping method schema
  const shippingMethodSchema = base.db.Schema({
    title: { type: String, required: true },
    taxCode: { type: String, required: false },
    rates: [ratesSchema]
  }, { _id: false });

  // The taxes schema
  const taxesSchema = base.db.Schema({
    ok: { type: Boolean, required: true, default: true },
    error: { type: String, required: false },
    tax: { type: Number, required: false, default: 0.00 },
    beforeTax: { type: Number, required: false, default: 0.00 }
  }, { _id: false });

  // The reservations schema
  const itemReservesSchema = base.db.Schema({
    id: { type: String, required: true },
    warehouseId: { type: String, required: true },
    quantity: { type: Number, required: false },
    expirationTime: { type: Date, required: false }
  }, { _id: false });

  // Enable the virtuals when converting to JSON
  itemReservesSchema.set('toJSON', {
    virtuals: true
  });

  // Price Schema
  const priceSchema = base.db.Schema({
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // ISO 4217
    country: { type: String, required: false }, // ISO 3166-1 alpha-2
    customerType: { type: String, required: false },
    channel: { type: String, required: false },
    validFrom: { type: Date, required: false },
    validUntil: { type: Date, required: false }
  }, { _id: false });

  // The item taxes schema
  const itemTaxesSchema = base.db.Schema({
    beforeTax: { type: Number, required: false, default: 0.00 },
    tax: { type: Number, required: false, default: 0.00 },
    taxDetail: { type: String, required: false },
  }, { _id: false });

  // The item discounts schema
  const itemDiscountsSchema = base.db.Schema({
    promotionId: { type: String, required: true },
    promotionTitle: { type: String, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, required: true }
  }, { _id: false });

  // The line items schema
  const itemsSchema = base.db.Schema({
    id: { type: String, required: true },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: priceSchema, required: true },
    reserves: [itemReservesSchema],
    taxes: [itemTaxesSchema],
    discounts: [itemDiscountsSchema]
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
    customerId: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    currency: { type: String, required: true }, // ISO 4217
    channel: { type: String, required: true },
    shippingAddress: shippingAddressSchema,
    shippingMethod: shippingMethodSchema,
    items: [itemsSchema],
    taxes: taxesSchema,
    promotions: { type: base.db.Schema.Types.Mixed, required: false }
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

  const model = base.db.model(modelName, schema);
  model.STOCKSTATUS = STOCKSTATUS;

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
