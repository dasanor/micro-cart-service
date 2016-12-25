# shipping.create

This method is used to create a Shipping method.

# Arguments

This method has the URL https://server/services/cart/v1/shipping.create and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token    | yes | Token       | Bearer xxxxx... | Authentication token.
title    | yes | String      | UPS Same Day    | Shipping method title.
active   | yes | Boolean     | true            | Active or disabled.
taxCode  | no  | String      | vat-7           | Tax code applicable to this shipping method. Defaults to 'default'.   
rates    | yes | Object List | *see below*     | List of rates by location.

## Rates

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
locations | yes | Object List | [{ "country": "SP" }] | List of locations where this method is applicable. 
rates     | yes | Object List | [{ "currency": "EUR", "amount": 10.10 }] | List of rates.

# Response

Returns a Shipping Method object:

```json
{
  "ok" : true,
  "shipping" : {
    "id" : "iw3RA1EE",
    "title" : "UPS Same Day",
    "active" : true,
    "taxCode" : "default",
    "rates" : [
      {
        "id" : "QJSY863b",
        "locations" : [
          { "country" : "ES" },
          { "country" : "IT" },
          { "country" : "GB" }
        ],
        "rates": [
          {"currency" : "EUR", "amount" : 10.10},
          {"currency" : "GBP", "amount" : 9.90}
        ]
      },
      {
        "id" : "1sSf368D",
        "locations" : [
          { "country" : "US", "state" : "Hawaii" },
          { "country" : "US", "state" : "Alaska" }
        ],
        "rates" : [
          {"currency" : "USD", "amount" : 25.00}
        ]
      }
    ]
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/shipping.create \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```
