Awin / Affiliate Window API Helper Methods
-----------------------------------

Contains utilities to simplify interaction with the Awin (formerly known as Affiliate Window) marketing network APIs.

## Prerequisites

 - Node.js / NPM
 - Awin oAuth Token
 - Awin Promotions ID (located under Link & Tools \ My Offers in the Awin interface) for getting voucher codes

## Install

```
npm i affiliate-window --save
```

## Usage

```
var Awin = require('affiliate-window')

var AW = new Awin({
 oAuthToken: 'xxxx',
})
```

Returning a list of accounts: (http://wiki.awin.com/index.php/API_get_accounts)
```
AW.getAccounts().then(function (accounts) {
	 // 'accounts' has the response format described at: http://wiki.awin.com/index.php/API_get_accounts
})
```

Returning a list of programmes: (http://wiki.awin.com/index.php/API_get_programmes)
```
AW.getProgrammes({ account, relationship = 'joined' }).then(function (programmes) {
	 // 'programmes' has the response format described at: http://wiki.awin.com/index.php/API_get_programmes
})
```

Returning an individual programme details: (http://wiki.awin.com/index.php/API_get_programmedetails)
```
AW.getProgrammeDetail({ account, advertiserId }).then(function (programmeDetail) {
	 // 'programmeDetail' has the response format described at: http://wiki.awin.com/index.php/API_get_programmedetails
})
```

Returning all programme details: (http://wiki.awin.com/index.php/API_get_programmedetails)
```
AW.getProgrammeDetails({ account }).then(function (programmeDetails) {
	 // 'programmeDetails' has an array of responses in the format described at: http://wiki.awin.com/index.php/API_get_programmedetails
})
```

Returning a list of commissions for a given advertiser: (http://wiki.awin.com/index.php/API_get_commissiongroups)
```
AW.getCommissionGroup({ account, advertiserId }).then(function (commissions) {
	 // 'commissions' has the response format described at: http://wiki.awin.com/index.php/API_get_commissiongroups
})
```

Returning an individual commission group by its ID: (http://wiki.awin.com/index.php/API_get_commissiongroups)
```
AW.getCommissionGroup({ account, commissionGroup }).then(function (commissionGroup) {
	 // 'commissionGroup' has the response format described at: http://wiki.awin.com/index.php/API_get_commissiongroups
})
```

Returning all commission group data along with programme data: (http://wiki.awin.com/index.php/API_get_programmes and http://wiki.awin.com/index.php/API_get_commissiongroups)
```
AW.getProgrammeAndCommissionGroups({ account, relationship = 'joined' }).then(function (programmesAndCommissionGroups) {
	 // 'programmesAndCommissionGroups' has an array of responses in the format described at:
   http://wiki.awin.com/index.php/API_get_programmes
   merged together with the response from  http://wiki.awin.com/index.php/API_get_commissiongroups
})
```

Returning a list of transactions (by default returns the last 365 days' of transaction data):
```
AW.getTransactions({
  account,
	startDate: new Date(`2016-08-21T01:00:00`), // optional
	endDate: new Date(`2016-08-23T01:00:00`), // optional
  dateType = `transaction`, // optional
  timezone = `UTC` // optional
}).then(function (transactions) {
	// 'transactions' has the following response format: http://wiki.awin.com/index.php/API_get_transactions_list
})
```

Returning a list of voucher codes:
```
AW.getVouchers({ account, promotionsId }).then(function (vouchers) {
	/*
	'vouchers' has the following response format:
	[{
		"id": 1234,
    "advertiserId": 3744,
    "code": "RMV8",
    "description": "8% OFF ALL TRANSACTIONS",
    "url": "http://www.awin1.com/cread.php?v=3744&t=XXXX&p=http://www.rockmyvintage.co.uk/",
    "startDate": "2014-04-02 23:00:00",
    "endDate": "2019-04-03 22:59:59"
  }]
	*/
})
```
