# cart.removeFromCart

This method is used to remove items from a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.removeFromCart and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token    | yes | Token  | Bearer xxxxx... | Authentication token.
cartId   | yes | String | H19PRsec        | The id of the Cart.
itemId   | yes | String | HyR1hMmc        | The id of the item to remove.
quantity | yes | Number | 1               | The quantity of product to remove from the Cart.

# Response

Returns the complete cart:

```json
{
  "ok": true,
  "cart": {
    "id": "H19PRsec",
    "customerId": "ANON",
    "expirationTime": "2016-08-23T15:16:50.407Z",
    "tax": 2062,
    "beforeTax": 9820.05,
    "promotions": {
      "almostFulfilledPromos": [],
      "fulfilledPromos": [],
      "ok": true
    },
    "taxes": {
      "beforeTax": 577.65,
      "tax": 121,
      "ok": true
    },
    "items": [
      {
        "taxDetail": "IVA 21%",
        "id": "Hypqnvqyx",
        "productId": "By2ZWfAPnV",
        "quantity": 1,
        "price" : {
         "amount": 577.65,
         "currency": "EUR"
        },
        "title": "001004721736835 - Frigorífico combi Samsung RB31FEJNCSS/EF No Frost (Samsung)",
        "reserves": [
          {
            "id": "ByT5hDcJg",
            "warehouseId": "001",
            "quantity": 1,
            "expirationTime": "2016-10-23T17:20:05.245Z"
          }
        ],
        "tax": 121,
        "beforeTax": 577.65
      }
    ]
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
cart_not_found | - | The Cart was not found
item_not_found | - | The item was not found

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.addToCart?cartId=H19PRsec \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{ "cartId": "H19PRsec", "itemId": "HyR1hMmc", "quantity", 1 }'
```