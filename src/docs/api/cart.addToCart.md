# cart.addToCart

This method is used to add items to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.addToCart and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token  | yes | Token       | Bearer xxxxx... | Authentication token.
cartId | yes | String      | H19PRsec        | The id of the Cart to add entries.
items  | yes | Object List | -               | The list of entries to add to the Cart.

## Items

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
productId   | yes | String | By2ZWfAPnV | The Product Id.
quantity    | yes | Number | 1          | The quantity of product to add to the Cart.
warehouseId | yes | String | 001        | The id of the warehouse to pick products.

# Response

Returns the complete cart:

```json
{
  "ok": true,
  "cart": {
    "id": "H19PRsec",
    "userId": "anonymous",
    "expirationTime": "2016-08-23T15:16:50.407Z",
    "tax": 2062.00,
    "beforeTax": 9820.05,
    "promotions": {
      "almostFulfilledPromos": [],
      "fulfilledPromos": [],
      "ok": true
    },
    "taxes": {
      "beforeTax": 577.65,
      "tax": 121.00,
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
        "tax": 121.00,
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
max_quantity_per_product_exceeded | productId, requestedQuantity, maxQuantityAllowed | The requested quantity exceeds the limit.
max_number_of_entries_exceeded | requestedEntries, maxEntriesAllowed | The requested entries exceeds the limit.
product_not_found | productId | The Product was not found.
product_discontinued | productId | The Product is discontinued.
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.addToCart?cartId=H19PRsec \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{ "items": [
              {"productId": "By2ZWfAPnV", "quantity": 1, "warehouseId": "001"} \                                                 
          ]}'
```