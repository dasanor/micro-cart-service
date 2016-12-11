# Cart Service

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
