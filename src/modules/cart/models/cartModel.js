function modelFactory(base) {
  const reservesSchema = base.db.Schema({
    code: { type: String, required: true },
    expirationTime: { type: Date, required: true }
  }, { _id: false, minimize: false });

  const entrySchema = base.db.Schema({
    code: { type: String, required: true },
    quantity: { type: Number, required: true },
    reserves: [reservesSchema]
  }, { _id: false, minimize: false });

  const schema = base.db.Schema({
    _id: { type: String, required: true },
    uid: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    entries: [entrySchema]
  }, { _id: false, minimize: false, timestamps: true });

  schema.set('toJSON', {
    virtuals: true
  });

  schema.method('toClient', function () {
    const obj = this.toJSON();
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  });

  return base.db.model('Cart', schema);
}

module.exports = modelFactory;
