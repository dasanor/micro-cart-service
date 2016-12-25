# Cart Service

[![NPM version][npm-image]][npm-url] 
[![Downloads][downloads-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
[![Coverage Status][coveralls-image]][coveralls-url] 
[![bitHound Overall Score][bithound-overal-image]][bithound-url]
[![bitHound Code][bithound-code-image]][bithound-url]
[![Dependency status][bithound-image]][bithound-url] 
[![Dev Dependency status][bithound-dev-image]][bithound-url] 

[npm-url]:https://npmjs.org/package/microbase
[downloads-image]:http://img.shields.io/npm/dm/microbase.svg
[npm-image]:http://img.shields.io/npm/v/microbase.svg

[travis-url]:https://travis-ci.org/ncornag/micro-cart-service
[travis-image]:http://img.shields.io/travis/ncornag/micro-cart-service/develop.svg
[coveralls-url]:https://coveralls.io/r/ncornag/micro-cart-service
[coveralls-image]:https://img.shields.io/coveralls/ncornag/micro-cart-service/develop.svg

[bithound-url]:https://www.bithound.io/github/ncornag/micro-cart-service/develop
[bithound-overal-image]:https://www.bithound.io/github/ncornag/micro-cart-service/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/ncornag/micro-cart-service.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/ncornag/micro-cart-service.svg
[bithound-code-image]:https://www.bithound.io/github/ncornag/micro-cart-service/badges/code.svg

Ecommerce Cart service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

* Single or bulk add to Cart
* Stock checking available per product
* Define max number of items items in Cart
* Define max number of items per Product in Cart
* Aggregate same products or add them as a single line each
* Abandonment handling

# Entities

The Cart entity holds the Product inventory.

## Cart

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Cart identifier | String | yes | System generated
userId | Owner User identifier | String | yes | -
expirationTime | Cart expiration time | Date | yes | Configurable
items | List of Products added to the Cart | Object list | yes | -
taxes | The calculated Taxes for the Cart | Object | yes | -

### Taxes

Field | Description| Type | Required | Default
------|------------|------|----------|--------
ok | Flag describing the tax calculus result | Boolean | yes | -
tax | Cart taxes ammount | Number | yes | -
beforeTax | Cart total before taxes | Number | yes | -

## Items

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique item identifier | String | yes | System generated
productId | The Product identifier | String | yes | -
title | A Product description | String | yes | Product title + Variant details
quantity | The Product quantity | Number | yes | -
price | The single item sale price | Object | yes | -
taxes | The calculated Taxes for the item | Object | yes | -  
reserves | Reservation data | Object list | yes | -

### Prices

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
amount       | yes | Numeric | 109.99 | The Product base price
currency     | yes | String  | USD | The currency code (ISO 4217)
country      | no  | String  | US  | The country code (ISO 3166-1 alpha-2)
customerType | no  | String  | VIP | The Customer type (VIP, B2B, B2C)
channel      | no  | String  | WEB | The channel the Customer is using (WEB, MOBILE, Physical store ID)
validFrom    | no  | Date    | 2016-01-01T00:00:00.000+0000 | Date start (inclusive) for the validy period of this Price.
validUntil   | no  | Date    | 2017-12-31T23:59:59.000+0000 | Date end (inclusive) for the validy period of this Price.

### Taxes

Field | Description| Type | Required | Default
------|------------|------|----------|--------
tax | Item taxes amount | Number | yes | -
beforeTax | Item total before taxes | Number | yes | -
taxDetail | Item taxes detail | String | yes | -


### Reserves

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Reserve identifier | String | yes | System generated
warehouseId | The Warehouse identifier | String | yes | -
quantity | The quantity reserved | Number | yes | -
expirationTime | Reserve expiration time | Date | yes | System generated

# API

The full API documentation can be accessed in the microbase web http://docs.microbase.io
