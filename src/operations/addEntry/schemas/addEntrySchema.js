module.exports = {
  payload: {
    type: 'object',
    properties: {
      cartId: {
        type: 'string'
      },
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
      'productId',
      'quantity'
    ],
    additionalProperties: true
  }
};

