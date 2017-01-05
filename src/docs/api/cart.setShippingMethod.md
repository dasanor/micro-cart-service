# cart.setShippingMethod

This method is used to assign a shipping method to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.setShippingMethod and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token   | yes | Token  | Bearer xxxxx... | Authentication token.
cartId  | yes | String | H19PRsec        | The Cart id to assign the address.
method  | yes | Object | -               | The shipping method

## Shipping Method

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
title    | yes | String      | UPS Same Day    | Shipping method title.
taxCode  | no  | String      | vat-7           | Tax code applicable to this shipping method. Defaults to 'default'.   
rates    | yes | Object List | -               | List of rates by location.

## Rates

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
locations | yes | Object List | [{ "country": "SP" }] | List of locations where this method is applicable. 
rates     | yes | Object List | [{ "currency": "EUR", "amount": 10.10 }] | List of rates.

# Response

Returns a Cart object:

```json
{
  "ok": true,
  "cart": {
  
  },
  "methods": [
    {
      "title": "UPS Same Day",
      "taxCode": "default",
      "rates": [
        { "currency": "EUR", "amount": 10.1 },
        { "currency": "GBP", "amount": 9.9 }
      ]
    },
    {
      "title": "UPS Next Day",
      "taxCode": "default",
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

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.setShippingMethod \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```
