module.exports = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string'
          },
          quantity: {
            type: 'integer',
            minimum: 1
          },
          warehouseId: {
            type: 'string'
          }
        },
        required: [
          'productId', 'quantity'
        ],
        additionalProperties: true
      }
    }
  },
  required: [
    'items'
  ],
  additionalProperties: true
};

