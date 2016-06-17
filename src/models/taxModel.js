const shortId = require('shortid');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Tax');
  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    code: { type: String, required: true },
    class: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    rate: { type: Number, required: true },
    isPercentage: { type: Boolean, required: true, default: true }
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

  // Add the indexes
  schema.index({ code: 1 }, { unique: true });

  // Add the model to mongoose
  return base.db.model('Tax', schema);
}

module.exports = modelFactory;
