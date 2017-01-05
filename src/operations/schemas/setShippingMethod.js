module.exports = {
  type: 'object',
  properties: {
    cartId: {
      type: 'string'
    },
    method: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        taxCode: { type: 'string' },
        rates: {
          type: 'array',
          minItems: 1,
          properties: {
            currency: { type: 'string' },
            amount: { type: 'number' }
          },
          required: [
            'currency', 'amount'
          ],
          additionalProperties: true
        }
      },
      required: [
        'title',
        'taxCode',
        'rates'
      ]
    }
  },
  required: [
    'cartId',
    'method'
  ],
  additionalProperties: true
};