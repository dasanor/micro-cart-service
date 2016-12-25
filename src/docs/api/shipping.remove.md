# shipping.remove

This method is used to remove a Shipping Method

# Arguments

This method has the URL https://server/services/cart/v1/shipping.remove and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token         | yes | Token  | Bearer xxxxx... | Authentication token.
id            | no  | String | iw3RA1EE        | The id of the Shipping Method to remove.

# Response

Returns a default response:

```json
{
    "ok": true
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
shipping_method_not_found | The id not found | The Shipping Method was not found

# Example
```bash
curl --request POST \
  --url 'http://localhost:3000/services/cart/v1/category.shipping?id=iw3RA1EE \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
```
