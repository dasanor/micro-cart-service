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

The code is documented with `docco` and can be accessed [here](https://rawgit.com/ncornag/micro-cart-service/develop/docs/code/index.js.html)

## API documentation

The API is documented with `aglio` and can be accessed [here](https://rawgit.com/ncornag/micro-cart-service/develop/docs/api/index.html)

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
