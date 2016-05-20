# micro-cart-service

Ecommerce Cart service using micro-base framework (beta).

Micro-base is a small framework to define and call services, and gives some basic utilities like config, logging, jobs and MongoDB access.
More info abot the framework [here](https://github.com/ncornag/micro-base/tree/develop).

## Start

```
cd src
npm install
npm start
```

## Code documentation

The code is documented with `docco` and can be accessed [here](https://rawgit.com/ncornag/micro-cart-service/develop/docs/index.js.html)

## Tests

Shamefully, no tests yet.

## Configuration properties

The configuration properties are handled via the framework and `nconf`. Out of the box the framework reads the files:

```
config/development.json
config/default.json
node_modules/micro-base/modules/config/defaults.json
```

Each file in the list provides sensitive defaults for the previous one.
The file `config/development.json` is built with the `NODE_ENV` environment variable therefore, if you want to customize the configuration values for a different environment just start node with a different one.
If `NODE_ENV` is `prod`, the config file used will be `config/prod.json`

## Operations

### new

Creates a new Cart

#### Request

```shell
curl --request POST \
  --url http://localhost:3001/services/cart/v1/new \
  --header 'content-type: application/json' \
  --header 'accept: application/json' \
  --data '{}'
```

#### Response

The new Cart

```json
{
  "id": "ByQpDBcM",
  "userId": "anonymous",
  "expirationTime": "2016-05-25T19:51:23.055Z",
  "items": []
}
```

Without sending a `userId`, the Cart is associated with the anonymous user.
You can associate a Cart to an specific user sending the user id in the payload:

```shell
--data '{userId: "1234567890"}'
```

### get

Finds a Cart and returns it

#### Request

```shell
curl --request POST \
  --url http://localhost:3001/services/cart/v1/get \
  --header 'content-type: application/json' \
  --header 'accept: application/json' \
  --data '{"id": "ByQpDBcM"}'
```

#### Response

The requested Cart

```json
{
  "id": "ByQpDBcM",
  "userId": "anonymous",
  "expirationTime": "2016-05-25T19:51:23.055Z",
  "items": []
}
```

### addEntry

Adds an entry to an existing Cart or adds the quantity to an existent entry

#### Request

```shell
curl --request POST \
  --url http://localhost:3001/services/cart/v1/addEntry \
  --header 'content-type: application/json' \
  --header 'accept: application/json' \
  --data '{"cartId": "ByQpDBcM", "productId": "0001", "quantity": 1, "warehouseId": "001"}'
```

##### Request Validation

The validation is done via a JSON Schema configured in the property files under the `schema` key

```json
  "addEntry": "./schemas/addEntrySchema"
```

#### Response

The Cart with the entry added (or the quantity added to an existent entry), and the reserve data.

```json
{
  "id": "ByQpDBcM",
  "userId": "anonymous",
  "expirationTime": "2016-05-25T19:51:23.055Z",
  "items": [
    {
      "id": "HyRAPH9z",
      "productId": "0001",
      "quantity": 1,
      "reserves": [
        {
          "code": "S1C0vScM",
          "warehouseId": "001",
          "quantity": 1,
          "expirationTime": "2016-05-19T19:51:49.648Z"
        }
      ]
    }
  ]
}
```

### Customizations

#### Models

The service uses the framework provided db utilities, based in Mongoose.

You can customize the models used modifying the properties under thr `models` key.

The module must follow the following convention:

```javascript
function hook(base) {
  return (data) => {
    return new Promise((resolve, reject) => {

      return resolve(data);
    });
  };
}
module.exports = hook;
```

##### Cart

```json
  "cartModel": "./models/cartModel"
```

#### Hooks

There is a "hook" system to allow customization of the different parts of the system.

You can provide your own implementation configuring the module to be used in a properties file.

##### preAddToCart

Called before adding the entry to the Cart, used for validations.

```json
"preAddToCart": {
  "handler": "./modules/cart/hooks/preAddToCart",
  "maxQuantityPerProduct": 10000,
  "maxNumberOfEntries": 15
}
```

###### stockAvailability

Called to verify the stock and reserve it. Uses an external Stock Service.

```json
"stockAvailability": {
  "handler": "./modules/cart/hooks/stockAvailability",
  "reserveStockForMinutes": 1440
}
```

##### addToCart

Add the entry to the Cart

```json
"addToCart": {
  "handler": "./modules/cart/hooks/addToCart"
}
```

##### postAddToCart

Called after the item was added to the Cart

```json
"postAddToCart": {
  "handler": "./modules/cart/hooks/postAddToCart",
}
```

##### saveCart

Saves the Cart using the framework provided db utilities

```json
"saveCart": {
  "handler": "./modules/cart/hooks/saveCart"
}
```

##### postSaveCart

Called after the Cart was succesfully saved

```json
"postSaveCart": {
  "handler": "./modules/cart/hooks/postSaveCart"
}
```
