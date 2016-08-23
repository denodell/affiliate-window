Affiliate Window API Helper Methods
-----------------------------------

_Warning: ALPHA release - unstable API and feature incomplete_

Contains utilities to simplify interaction with the Affiliate Window marketing network APIs.

## Prerequisites

 - Node.js / NPM
 - Affiliate Window publisher ID
 - Affiliate Window API Key
 - Affiliate Window ProductServe API Key

## Install

```
npm i affiliate-window --save
```

## Usage

```
var AffiliateWindow = require('affiliate-window')

var AW = new AffiliateWindow({
 publisherId: 'xxxx',
 apiPassword: 'xxxx'
})
```

Returning a list of joined merchants (including commission group data):
```
 AW.getMerchants({ joined: true }).then(function (merchants) {
	 /*
	 'merchants' has the following example format:
	 [{
     "iId": 9,
     "sName": "Fragrancedirect",
     "sDisplayUrl": "http://www.fragrancedirect.co.uk",
     "sClickThroughUrl": "http://www.awin1.com/awclick.php?mid=9&id=272967",
     "oPrimaryRegion": {
       "sName": "United Kingdom",
       "sCountryCode": "GBR",
       "sCurrencyCode": "GBP"
     },
     "sLogoUrl": "http://www.affiliatewindow.com/logos/9/logo.gif",
     "aCommissionGroups": [
       {
         "sCommissionGroupCode": "DEFAULT",
         "sCommissionGroupName": "Default Commission",
         "mAmount": null,
         "fPercentage": 5
       }
     ]
   }, ...]
	 */
})
```

Returning a list of transactions (by default returns the last 30 days' of transaction data):
```
AW.getTransactions({
	startDate: '2016-08-21T01:00:00',
	endDate: '2016-08-23T01:00:00'
}).then(function (transactions) {
	/*
	'transactions' has the following example format:
	[{
		"iId": 1234,
		"sStatus": "declined",
		"sType": "normal",
		"sIp": "?",
		"bPaid": false,
		"iPaymentId": 0,
		"sDeclinedReason": "",
		"iMerchantId": 12345,
		"mSaleAmount": {
			"dAmount": 1.00,
			"sCurrency": "GBP"
		},
		"mCommissionAmount": {
			"dAmount": 0.30,
			"sCurrency": "GBP"
		},
		"dClickDate": "2014-02-03T15:19:11+00:00",
		"dTransactionDate": "2014-02-03T15:19:11+00:00",
		"dValidationDate": "2014-02-03T15:19:11+00:00",
		"sClickref": "",
		"sClickref2": "",
		"sClickref3": "",
		"sClickref4": "",
		"sClickref5": "",
		"sClickref6": "",
		"sSearchSiteName": "",
		"sSearchSiteKeyword": "",
		"aTransactionParts": [{
			"sCommissionGroupName": "Single",
			"mSaleAmount": {
				"dAmount": 1.00,
				"sCurrency": "GBP"
			},
			"mCommissionAmount": {
				"dAmount": 0.30,
				"sCurrency": "GBP"
			},
			"iCommission": 0,
			"sCommissionType": "amount"
		}]
	}, ...]
	*/
})
```
