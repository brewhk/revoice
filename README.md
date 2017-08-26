[![Build Status](https://travis-ci.org/brewhk/revoice.svg?branch=master)](https://travis-ci.org/brewhk/revoice)

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

## Usage

#### Installation

You can install revoice through [npmjs.com](https://www.npmjs.com/package/revoice)

```
$ yarn add revoice
```

## How it works



## Schema

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

## Testing

Make sure you're running the latest version of Node (currently 7.8.0) and yarn (currently 0.19.1).

Clone the repository, install the dependencies and run the coverage script.

```
$ git clone https://github.com/brewhk/revoice.git
$ cd revoice/
$ yarn
$ yarn run coverage
```
