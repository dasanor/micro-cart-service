# shipping.addressMethods

This method is used to obtain the suitable Shipping Methods for an address

# Arguments

This method has the URL https://server/services/cart/v1/shipping.addressMethods and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token      | yes | Token   | Bearer xxxxx... | Authentication token.
country    | yes | String  | US              | Address country
state      | yes | String  | Illinois        | Address state

# Response

Returns a list of Shipping Methods:

```json
{
  "ok": true,
  "methods": [
    {
      "title": "UPS Same Day",
      "taxCode": "default",
      "rates": [
        { "currency": "EUR", "amount": 10.10 },
        { "currency": "GBP", "amount": 9.90 }
      ]
    },
    {
      "title": "UPS Next Day",
      "taxCode": "default",
      "rates": [
        { "currency": "EUR", "amount": 4.90 },
        { "currency": "GBP", "amount": 5.90 }
      ]
    }
  ]
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
no_suitable_shipping_method | - | There are no Shipping Methods available for this address

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/cart/v1/shipping.addressMethods \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{ "address": { ... } }'
```