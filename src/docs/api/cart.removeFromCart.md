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

Returns a list of the reserves created:

```javascript
{
    "ok": true
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