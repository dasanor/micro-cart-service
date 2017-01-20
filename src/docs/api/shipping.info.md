# shipping.info

This method is used to obtain information about a Shipping Method

# Arguments

This method has the URL https://server/services/cart/v1/shipping.info and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token      | yes | Token   | Bearer xxxxx... | Authentication token.
shippingId | yes | String  | SJi0oca4e       | The Shippint Methos id to get info on.

# Response

Returns a Shipping Method object:

```json
{
  "ok": true,
  "shipping": {
    "id": "SJi0oca4e",
    "active": true,
    "title": "UPS Same Day",
    "taxCode": "default",
    "rates": [
      {
        "id": "SJbi0i5aNx",
        "rates": [
          { "currency": "EUR", "amount": 10.10 },
          { "currency": "GBP", "amount": 9.9 }
        ],
        "locations": [
          { "country": "ES" },
          { "country": "IT" },
          { "country": "GB" }
        ]
      },
      {
        "id": "BJxjCoca4e",
        "rates": [
          { "currency": "USD", "amount": 25.00 }
        ],
        "locations": [
          { "country": "US", "state": "Hawaii" },
          { "country": "US", "state": "Alaska" }
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
shipping_method_not_found | - | The Shipping Method was not found

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/cart/v1/shipping.info?shippingId=SJi0oca4e \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```