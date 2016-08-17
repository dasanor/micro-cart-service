# cart.new

This method is used to create a Cart.

# Arguments

This method has the URL https://server/services/catalog/v1/cart.new and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token   | yes | Token  | Bearer xxxxx... | Authentication token.
userId  | no  | String | A21afRq1        | The User identifier. Defaults to 'anonymous'.

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
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.new \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{}'
```