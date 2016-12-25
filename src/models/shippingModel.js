const shortId = require('shortid');

function modelFactory(base, configKeys) {
  const modelName = configKeys[configKeys.length - 1];
  if (base.logger.isDebugEnabled()) base.logger.debug(`[db] registering model '${modelName}'`);

  // Rates Schema
  const ratesSchema = base.db.Schema({
    currency: { type: String, required: true }, // ISO 4217
    amount: { type: Number, required: true }
  }, { _id: false });

  // Locations Schema
  const locationsSchema = base.db.Schema({
    country: { type: String, required: true }, // ISO 3166-1 alpha-2
    state: { type: String, required: false }
  }, { _id: false });

  // Locations Rates Schema
  const locationsRatesSchema = base.db.Schema({
    id: { type: String, required: true, default: shortId.generate },
    locations: [locationsSchema],
    rates: [ratesSchema]
  }, { _id: false });

  // The root schema
  const schema = base.db.Schema({
    _id: { type: String, required: true, default: shortId.generate },
    title: { type: String, required: true },
    active: { type: Boolean, required: true },
    taxCode: { type: String, required: false, default: 'default' },
    rates: [locationsRatesSchema]
  }, { _id: false, minimize: false, timestamps: true });

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

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
