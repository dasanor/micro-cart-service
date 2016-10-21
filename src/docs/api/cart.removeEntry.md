# cart.removeEntry

This method is used to remove a Cart Entry.

# Arguments

This method has the URL https://server/services/cart/v1/cart.removeEntry and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token   | yes | Token  | Bearer xxxxx... | Authentication token.
cartId  | yes | String | H19PRsec        | The id of the Cart.
entryId | yes | String | HyR1hMmc        | The id of the Entry to remove.

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
cart_not_found  | - | The Cart was not found
entry_not_found | - | The Entry was not found

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.addEntry?cartId=H19PRsec \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{ "cartId": "H19PRsec", "entryId": "HyR1hMmc" }'
```