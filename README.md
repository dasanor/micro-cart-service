# Cart Service

Ecommerce Cart service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

* Single or bulk add to Cart
* Stock checking available per product
* Define max number of items items in Cart
* Define max number of items per Product in Cart
* Aggregate same products or add them as a single line each
* Fast Cart calculation
* Configurable Taxes
* Abandonment handling

# Entities

The Cart entity holds the Product inventory.

**Cart**

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Cart identifier | String | yes | System generated
userId | Owner User identifier | String | yes | -
expirationTime | Cart expiration time | Date | yes | Configurable
items | List of Products added to the Cart | Object list | yes | -
beforeTax | Cart total before taxes | Number | yes | -
tax | Cart taxes total | Number | yes | -

**Items**

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique item identifier | String | yes | System generated
productId | The Product identifier | String | yes | -
title | A Product description | String | yes | Product title + Variant details
quantity | The Product quantity | Number | yes | -
price | The single item sale price | Number | yes | -
beforeTax | Item total before taxes (price * quantity - discounts) | Number | yes | -
tax | Item taxes | Number | yes | -
taxDetail | Item taxes detail | String | yes | -
reserves | Reservation data | Object list | yes | -

**Reserves**

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Reserve identifier | String | yes | System generated
warehouseId | The Warehouse identifier | String | yes | -
quantity | The quantity reserved | Number | yes | -
expirationTime | Reserve expiration time | Date | yes | System generated

## Taxes

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id | Internal unique Tax identifier | String | yes | System generated
code | The Tax code unique identifier (i.e.: VAT) | String | yes | -
class | The Tax class (specific implementation) identifier | String | yes | -
title | The Tax title | String | yes | -
description | The Tax description | String | no | -
rate | The Tax rate | Number | yes | -
isPercentage | The Tax rate is a percentaje or absolute | Boolean | yes | true

# API

The full API documentation can be accessed in the microbase web http://api.microbase.io 
and provide access to the Stocks and Reserves endpoints to create, 
modify and delete them:

## Carts

Name | Description | Method | Endpoint
-----|-------------|--------|---------
cart:new | Creates a Cart | `POST` | `/services/cart/v1`
cart:get | Retrieves a Cart | `GET` | `/services/cart/v1/{cartId}`
cart:addEntry | Adds and entry to a Cart | `POST` | `/services/cart/v1/{cartId}/entry`
cart:removeEntry | Deletes an entry from a Cart | `POST` | `/services/cart/v1/{cartId}/entry/{entryId}`

## Taxes

Name | Description | Method | Endpoint
-----|-------------|--------|---------
cart:createTax | Creates a Tax | `POST` | `/services/cart/v1/tax`
cart:cartTaxes | Calculates the Cart taxes | `POST` | `/services/cart/v1/cart/{cartId}/taxes`
