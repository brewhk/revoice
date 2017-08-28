[![Build Status](https://travis-ci.org/brewhk/revoice.svg?branch=master)](https://travis-ci.org/brewhk/revoice) [![codecov](https://codecov.io/gh/brewhk/revoice/branch/master/graph/badge.svg)](https://codecov.io/gh/brewhk/revoice)

Create HTML and PDF receipts and invoices

## Examples

* [HTML](./examples/default/index.html)
* [PDF](./examples/default/index.pdf)

## Overview

At its core, Revoice simply combines data into a [Handlebars](http://handlebarsjs.com/) template to generate a HTML file. After that, it uses [PhantomJS](http://phantomjs.org/) to render the page and writes it into a PDF file.

Apart from that, it also performs a few more functions:

* Provides Handlebar helpers that enables you to create your own templates
* Uses JSON Schema-compliant schema
* Uses [`he`](https://github.com/mathiasbynens/he) to decode HTML

## Getting Started

#### Installation

You can install revoice through [npmjs.com](https://www.npmjs.com/package/revoice)

```
$ yarn add revoice
```

#### Usage

```
import Revoice from 'revoice';

const data = {
  "id": "yvjhn76b87808",
  "date": "2017-02-02",
  "issuer": {
    "name": "Brew Creative Limited",
    "address": [
      "1905, Nan Fung Centre",
      "264-298 Castle Peak Road",
      "Tsuen Wan",
      "New Territories",
      "Hong Kong"
    ],
    "contact": {
      "name": "Daniel Li",
      "tel": "+852 1234 5678",
      "email": "dan@brew.com.hk"
    }
  },
  "invoicee": {
    "name": "Cerc Lannister"
  },
  "items": [{
    "id": "7A73YHAS",
    "title": "Amazon Echo Dot (2nd Generation)",
    "date": "2017-02-02",
    "amount": 39.99,
    "tax": 10.00,
    "quantity": 12
  }]
}

const options = {
  template: 'default',
  destination: path,
  name: 'index'
}

Revoice.generateHTMLInvoice(data, options); // Returns a promise
```

## Data Schema

The schema for the invoice and each item can be found under `/src/schema`. The schema are written in accordance with the [JSON Schema](http://json-schema.org/) specification, and are validated using [Ajv](https://github.com/epoberezkin/ajv).

#### Item

_* denotes a required field_

* `id*` *string* - Unique identifier for the item; e.g. `UG23H7F9Y`
* `title*` *string* - Title of the goods or service
* `description` *string* - Description of the goods or service
* `link` *string* - URL link to the web page for the product or sevice
* `date` *string* - The date the goods or service were provided, in a format satisfying [RFC3339](https://tools.ietf.org/html/rfc3339#section-5.6); e.g. `2017-08-25`
* `amount*` *number* - Unit Price per item (excluding tax)
* `tax*` *number* - Amount of tax charged for unit
* `quantity*` *integer* - Number of units

#### Invoice

_* denotes a required field_

* `id*` *string* - Unique identifier for the invoice; e.g. `AUS-0001-A`
* `date*` *string* - Date the invoice is issued, in a format satisfying [RFC3339](https://tools.ietf.org/html/rfc3339#section-5.6); e.g. `2017-08-25`
* `due` *string* - Date the invoice is due, in a format satisfying [RFC3339](https://tools.ietf.org/html/rfc3339#section-5.6); e.g. `2017-08-25`
* `issuer*` *object* - Details about the party issuing the invoice
  * `name*` *string* - Name of the issuer; e.g. `Acme Corp`
  * `logo` *string* - URL of the issuer's logo
  * `address*` *[string]* - An array of string that composes the issuer's address; e.g. `["123 Example Street", "London", "United Kingdom", "W1 2BC"]`
  * `contact*` *object* - Details of the issuer's contact details
    * `name*` *string* - Name of the contact person representing the issuer
    * `position*` *string* - Position / role of the contact person representing the issuer
    * `tel*` *string* - Telephone number of the contact person representing the issuer
    * `fax` *string* - Fax number of the contact person representing the issuer
    * `email*` *string* - Email of the contact person representing the issuer
    * `address*` *[string]* - An array of string that composes the contact person's address (this may be different to the issuer's _registered_ address); e.g. `["123 Example Street", "London", "United Kingdom", "W1 2BC"]`
    * `website` *string* - Website of the contact person representing the issuer
* `invoicee*` *object* - Details of the entity the invoice is addressed to
  * `name*` *string* - Name of the invoicee; e.g. `Jon Snow`
  * `address` *[string]* - An array of string that composes the invoicee's address; e.g. `["123 Example Street", "London", "United Kingdom", "W1 2BC"]`
  * `contact` *object* - Details of the invoicee's contact details
    * `name` *string* - Name of the invoicee
    * `position*` *string* - Position / role of the contact person representing the invoicee
    * `tel` *string* - Telephone number of the invoicee
    * `email` *string* - Email of the invoicee
* `items*` *[Items]* - A list of items included in the invoice (see the `Item` schema above)
* `comments` *string* - Any messages/comments the issuer wishes to convey to the invoicee

## Options

Default options can be accessed at `Revoice.DEFAULT_OPTIONS`, which evaluates to:

```
{
  template: 'default',
  destination: './tmp',
  format: 'A3',
  orientation: 'portrait',
  margin: '1cm',
}
```

A detailed explanation of available options is as follows:

* `name` *string* - the name to give to the invoice file(s). For example, you can use your invoice number as the name of the file E.g. `YG87ASDG`. Overrules the `nomenclature` option.
* `nomenclature` *string* - the rules for which files are named. Valid values are `'hash'`, which will generate a SHA512 hash of the HTML invoice and use that as the name of the file. Is overruled by the `name` option.
* `template` *string* - the template to use for the invoice. You can specify a pre-defined template by using its name (e.g. `'default'`), or specify your own template by entering the path to the file (e.g. `'./test/sample/templates/test.html'`) .
* `destination` *string* - the destination directory where you want to the invoice to be outputted at (e.g. `'./tmp'`)
* `format` *string* - format of the page, valid values are `'A3'`, `'A4'`, `'A5'`, `'Legal'`, `'Letter'`, `'Tabloid'`
* `orientation` *string* - orientation of the page, valid values are `'portrait'` and `'landscape'`
* `margin` *string* - margin on the page. Should be a number followed by a unit (e.g. `'1cm'`). Valid units are `'mm'`, `'cm'`, `'in'`, `'px'`

`format`, `orientation` and `margin` options are derived from [PhantomJS's `paperSize`](http://phantomjs.org/api/webpage/property/paper-size.html) object options

## Testing

Make sure you're running the latest version of Node (currently 7.8.0) and yarn (currently 0.19.1).

Clone the repository, install the dependencies and run the coverage script.

```
$ git clone https://github.com/brewhk/revoice.git
$ cd revoice/
$ yarn
$ yarn run coverage
```

## TODOs

* Set up code styling with ESLint
* Provide better documentation on how to create your own template
