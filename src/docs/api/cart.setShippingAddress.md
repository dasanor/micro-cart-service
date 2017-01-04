# cart.setShippingAddress

This method is used to assign a shipping address to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.setShippingAddress and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token      | yes | Token  | Bearer xxxxx... | Authentication token.
cartId     | yes | String | H19PRsec        | The Cart id to assign the address.
addresses  | yes | Object | -               | The shipping addresses

## Addresses

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
firstName    | yes  | String  | John                | Customer first name.
lastName     | no   | String  | Doe                 | Customer last name.
address_1    | yes  | String  | 1650 Bolman Court   | Address information.
address_2    | no   | Array   | Number 10           | Aditional address information.
postCode     | yes  | Number  | 61701               | Address post code
city         | yes  | String  | Bloomington         | Address city
state        | yes  | String  | Illinois            | Address state
country      | yes  | String  | US                  | Address country
company      | no   | String  | My Company          | Name of the company
phone        | no   | Number  | 2173203531          | Address phone
instructions | no   | String  | Some instructions   | Aditional instrucctions for the address

# Response

Returns a list of available Shipping Methods for this address:

```json
{
  "ok": true,
  "methods": [
    {
      "title": "UPS Same Day",
      "rates": [
        { "currency": "EUR", "amount": 10.1 },
        { "currency": "GBP", "amount": 9.9 }
      ]
    },
    {
      "title": "UPS Next Day",
      "rates": [
        { "currency": "EUR", "amount": 10.1 },
        { "currency": "GBP", "amount": 9.9 }
      ]
    }
  ]
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
cart_not_found   | The cart Id | The cart was not found
invalid_country  | The state | The country code is invalid 
invalid_state    | The currency code | The state is invalid for the country 

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.setShippingAddress \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{}'
```
