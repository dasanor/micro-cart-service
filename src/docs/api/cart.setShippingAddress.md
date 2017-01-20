# cart.setShippingAddress

This method is used to assign a shipping address to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.setShippingAddress and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token      | yes | Token  | Bearer xxxxx... | Authentication token.
cartId     | yes | String | H19PRsec        | The Cart id to assign the address.
addresses  | yes | Object | -               | The shipping addresses

## Addresses

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
firstName    | yes  | String  | John                | Customer first name.
lastName     | no   | String  | Doe                 | Customer last name.
address_1    | yes  | String  | 1650 Bolman Court   | Address information.
address_2    | no   | Array   | Number 10           | Aditional address information.
postCode     | yes  | Number  | 61701               | Address post code
city         | yes  | String  | Bloomington         | Address city
state        | yes  | String  | Illinois            | Address state
country      | yes  | String  | US                  | Address country
company      | no   | String  | My Company          | Name of the company
phone        | no   | Number  | 2173203531          | Address phone
instructions | no   | String  | Some instructions   | Aditional instrucctions for the address

## Shipping Methods

The operation returns a list of the available Shipping Methods for the address.

If there is only one Shipping Method available, the Cart gets that method assigned by default. 

# Response

Returns a list of available Shipping Methods for this address:

```json
{
    "ok": true,
    "cart": {
        "id": "H19PRsec",
        "customerId": "ANON",
        "expirationTime": "2016-08-23T15:16:50.407Z",
        "tax": 0,
        "beforeTax": 0,
        "items": [],
        "shippingAddress": {
          "firstName": "John",
          "lastName": "Doe",
          "address_1": "1650 Bolman Court",
          "postCode": "61701",
          "city": "Valencia",
          "state": "Piemonte",
          "country": "IT",
          "company": "Thinkwrap",
          "phone": 2173203531,
          "instructions": "Instructions"        
        }
    },
    "shippingMethods": [
       {
         "title": "UPS Same Day",
         "taxCode": "default",
         "rates": [
           {
             "currency": "EUR",
             "amount": 10.1
           },
           {
             "currency": "GBP",
             "amount": 9.9
           }
         ]
       }
     ]

}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
cart_not_found   | The cart Id | The cart was not found
invalid_country  | The country code | The country code is invalid 
invalid_state    | The currency code | The state is invalid for the country 

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.setShippingAddress \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```
