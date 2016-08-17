# tax.create

This method is used to create a Tax.

# Arguments

This method has the URL https://server/services/catalog/v1/tax.create and 
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token        | yes | Token    | Bearer xxxxx... | Authentication token.
code         | yes  | String  | default         | Identifier to be used as a reference in the Product. 
class        | yes  | String  | default         | Identifier to the implementation code (i.e.: default.js).
title        | yes  | String  | VAT 10%         | Tax description.
rate         | yes  | Number  | 10              | Number to be used in the calculations (i.e.: 10%).
isPercentage | no   | Boolean | false           | Is the tax a percentage or a fixed amount? Defaults to true. 

# Response

Returns a Tax object:

```javascript
{
    "ok": true,
    "tax": {
        "id": "HJs04P45",
        "code": "default",
        "class": "default",
        "title": "IVA 10%",
        "rate": 10,
        "isPercentage": true
    }
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
duplicate_key | Index name and data causing the error | Some unique key violation
validation_error | The data causing the error | Some validation error

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/tax.create \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
      "code": "default", "class": "default", "title": "VAT 10%", \
      "rate": 10, "isPercentage": true \
      }'
```