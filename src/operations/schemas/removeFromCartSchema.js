module.exports = {
  type: 'object',
  properties: {
    cartId: {
      type: 'string'
    },
    itemId: {
      type: 'string'
    },
    quantity: {
      type: 'integer',
      minimum: 1
    }
  },
  required: [
    'cartId',
    'itemId',
    'quantity'
  ],
  additionalProperties: true
};

