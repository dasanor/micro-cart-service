module.exports = {
  type: 'object',
  properties: {
    cartId: {
      type: 'string'
    },
    address: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string'
        },
        lastName: {
          type: 'string'
        },
        address_1: {
          type: 'string'
        },
        address_2: {
          type: 'string'
        },
        postCode: {
          type: 'string'
        },
        city: {
          type: 'string'
        },
        state: {
          type: 'string'
        },
        country: {
          type: 'string'
        },
        company: {
          type: 'string'
        },
        phone: {
          type: 'number'
        },
        instructions: {
          type: 'string'
        }
      },
      required: [
        'firstName',
        'address_1',
        'postCode',
        'city',
        'state',
        'country'
      ]
    }
  },
  required: [
    'cartId',
    'address'
  ],
  additionalProperties: true
};