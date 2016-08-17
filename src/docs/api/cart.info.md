# cart.info

This method is used to obtain information about a Cart

# Arguments

This method has the URL https://server/services/catalog/v1/cart.info and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token  | yes | Token   | Bearer xxxxx... | Authentication token.
cartId | yes | String  | H19PRsec        | The Cart id to get info on.

# Response

Returns a Cart object:

```javascript
{
    "ok": true,
    "cart": {
        "id": "H19PRsec",
        "userId": "anonymous",
        "expirationTime": "2016-08-23T15:16:50.407Z",
        "tax": 0,
        "beforeTax": 0,
        "items": []
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
cart_not_found | - | The Cart was not found

# Example

```bash
curl --request GET \
  --url http://localhost:3000/services/cart/v1/cart.info?cartId=H19PRsec \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```