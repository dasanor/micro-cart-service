function modelFactory(base) {
  // The reservations schema
  const reservesSchema = base.db.Schema({
    code: { type: String, required: true },
    expirationTime: { type: Date, required: true }
  }, { _id: false, minimize: false });

  // The line items schema
  const itemsSchema = base.db.Schema({
    id: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    reserves: [reservesSchema]
  }, { _id: false, minimize: false });

  // The root schema
  const schema = base.db.Schema({
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    items: [itemsSchema]
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

  // Add the model to mongoose
  return base.db.model('Cart', schema);
}

module.exports = modelFactory;
