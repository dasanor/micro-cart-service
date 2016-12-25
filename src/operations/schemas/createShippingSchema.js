module.exports = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    active: { type: 'boolean' },
    taxCode: { type: 'string' },
    rates: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          locations: {
            type: 'array',
            minItems: 1,
            properties: {
              country: { type: 'string' },
              state: { type: 'string' }
            },
            required: [
              'country'
            ],
            additionalProperties: true
          },
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
          'locations', 'rates'
        ],
        additionalProperties: true
      }
    }
  },
  required: [
    'title', 'active', 'rates'
  ],
  additionalProperties: true
};

