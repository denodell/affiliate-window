import 'babel-polyfill'
import 'source-map-support/register'
import getCSV from 'get-csv'
import soap from 'soap-as-promised'
import 'date-format-lite'

const PUBLISHER_SERVICE_WSDL_URL = 'http://api.affiliatewindow.com/v6/AffiliateService?wsdl'
const PRODUCT_SERVE_WSDL_URL = 'http://v3.core.com.productserve.com/ProductServeService.wsdl'

export default class AffiliateWindow {
	config = {
		publisherId: '',
		apiPassword: '',
		productServeApiKey: '',
		promotionsId: '',
	}

	constructor({ publisherId, apiPassword, productServeApiKey, promotionsId }) {
		this.config = Object.assign({}, this.config, {
			publisherId,
			apiPassword,
			productServeApiKey,
			promotionsId,
		})
	}

	connect(url) {
		return (async () => {
			const { publisherId: iId, apiPassword: sPassword, productServeApiKey: sApiKey } = this.config
			const client = await soap.createClient(url)
			client.addSoapHeader({
				UserAuthentication: {
					iId,
					sPassword,
					sApiKey,
					sType: 'affiliate',
				},
			})
			return client
		})()
	}

	getMerchantsSimple({ joined = true } = {}) {
		return (async () => {
			const client = await this.connect(PUBLISHER_SERVICE_WSDL_URL)
			const result = await client.getMerchantList(joined ? { sRelationship: 'joined' } : {})
			const { getMerchantListReturn = {} } = result
			const { Merchant = [] } = getMerchantListReturn
			return Merchant
		})()
	}

	getMerchants({ joined = true } = {}) {
		return (async () => {
			const merchants = await this.getMerchantsSimple({ joined })
			const aMerchantIds = merchants.map(merchant => merchant.iId)
			const client = await this.connect(PUBLISHER_SERVICE_WSDL_URL)
			const promises = aMerchantIds.map(id => client.getCommissionGroupList({ iMerchantId: id }))
			const dataResult = await Promise.all(promises)
			const data = dataResult.map(data => (data.getCommissionGroupListReturn || {}).CommissionGroup || [])
			return merchants.map((merchant, index) => {
				let commissionGroups = data[index] ? Array.isArray(data[index]) ? data[index]: [data[index]] : []
				commissionGroups = commissionGroups.map(group => Object.assign({}, group, {
					fPercentage: typeof(group.fPercentage) === 'string' ? +group.fPercentage : group.fPercentage,
					mAmount: group.mAmount ? Object.assign({}, group.mAmount, {
						dAmount: +group.mAmount.dAmount,
					}) : null,
				}))

				return Object.assign({}, merchant, {
					iId: +merchant.iId,
					aCommissionGroups: commissionGroups,
				})
			})
		})()
	}

	getVouchers() {
		const { publisherId, promotionsId } = this.config

		return (async () => {
			const csv = await getCSV(`https://darwin.affiliatewindow.com/export-promotions/${publisherId}/${promotionsId}?promotionType=voucher&categoryIds=&regionIds=&advertiserIds=&membershipStatus=joined&promotionStatus=`)

			return csv.map(voucher => {
				return {
					id: voucher['Promotion ID'],
					iMerchantId: voucher['Advertiser ID'],
					sCode: voucher.Code,
					sDescription: voucher.Description,
					sUrl: voucher['Deeplink Tracking'],
					sStartDate: voucher.Starts.date("YYYY-MM-DD hh:mm:ss"),
					sEndDate: voucher.Ends.date("YYYY-MM-DD hh:mm:ss"),
				}
			})
		})()
	}

	// TODO:
	getLinks() {

	}

	getTransactions({
		startDate = new Date(Date.now() - (365 * 1000 * 60 * 60 * 24)), // 365 days ago
		endDate = new Date(),	// now
	} = {}) {
		const dateRangeInDays = (endDate - startDate ) / (1000 * 60 * 60 * 24)
		const numberOf30DayRanges = Math.ceil(dateRangeInDays / 30)
		let index = 0
		let promises = []

		return (async () => {
			const client = await this.connect(PUBLISHER_SERVICE_WSDL_URL)

			for (; index < numberOf30DayRanges; index = index + 1) {
				const startDateToUse = new Date(startDate.getTime() + (index * (30 * 1000 * 60 * 60 * 24)))
				let endDateToUse = new Date(startDate.getTime() + ((index + 1) * (30 * 1000 * 60 * 60 * 24)))
				if (endDateToUse > endDate) {
					endDateToUse = endDate
				}

				// WARNING: only returns 1000 transactions for any given 30-day period
				promises.push(client.getTransactionList({
					dStartDate: startDateToUse.toISOString(),
					dEndDate: endDateToUse.toISOString(),
					sDateType: 'transaction',
					iLimit: 1000,
				}))
			}

			const resultsData = await Promise.all(promises)

			const results = resultsData.map(result => {
				const { getTransactionListReturn = {} } = result
				const { Transaction = [] } = getTransactionListReturn || {}
				return Array.isArray(Transaction) ? Transaction : [Transaction]
			})

			return results.reduce((prev, curr) => prev.concat(curr), [])
		})()
	}
}
