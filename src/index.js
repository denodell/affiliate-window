import 'babel-polyfill'
import 'source-map-support/register'
import soap from 'soap-as-promised'

const PUBLISHER_SERVICE_WSDL_URL = 'http://api.affiliatewindow.com/v6/AffiliateService?wsdl'
const PRODUCT_SERVE_WSDL_URL = 'http://v3.core.com.productserve.com/ProductServeService.wsdl'

export default class AffiliateWindow {
	config = {
		publisherId: '',
		apiPassword: '',
		productServeApiKey: '34c105baeb240b5438defd7c45fef2d6',
	}

	constructor({ publisherId, apiPassword, productServeApiKey }) {
		this.config = Object.assign({}, this.config, {
			publisherId,
			apiPassword,
			productServeApiKey,
		})
	}

	connect(url) {
		return soap.createClient(url).then(client => {
			const { publisherId: iId, apiPassword: sPassword, productServeApiKey: sApiKey } = this.config
			client.addSoapHeader({
				UserAuthentication: {
					iId,
					sPassword,
					sApiKey,
					sType: 'affiliate',
				},
			})
			return client
		})
	}

	getMerchantsSimple({ joined = true } = {}) {
		return this.connect(PUBLISHER_SERVICE_WSDL_URL).then(client => {
			return client.getMerchantList(joined ? { sRelationship: 'joined' } : {}).then(result => {
				const { getMerchantListReturn = {} } = result
				const { Merchant = [] } = getMerchantListReturn
				return Merchant
			})
		})
	}

	getMerchants({ joined = true } = {}) {
		return this.getMerchantsSimple({ joined }).then(merchants => {
			const aMerchantIds = merchants.map(merchant => merchant.iId)

			return this.connect(PUBLISHER_SERVICE_WSDL_URL).then(client => {
				const promises = aMerchantIds.map(id => client.getCommissionGroupList({ iMerchantId: id }))

				return Promise.all(promises).then(data => data.map(data => (data.getCommissionGroupListReturn || {}).CommissionGroup || [])).then(data => {
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
				})
			})
		})
	}

	getVouchers() {
		return this.getMerchantsSimple({ joined: true }).then(merchants => {
			return this.connect(PRODUCT_SERVE_WSDL_URL).then(client => {
				const promises = merchants.map(merchant => merchant.iId).map(iMerchantId => client.getDiscountCodes({ iMerchantId }).then(out => out && out.oDiscountCode || {}))
				return Promise.all(promises).then(data => {
					const vouchers = data.reduce((previous, current) => previous.concat(current), []).filter(voucher => voucher && voucher.sCode)
					return vouchers
				})
			})
		})
	}

	// TODO:
	getLinks() {

	}

	getTransactions({
		startDate = new Date(Date.now() - (30 * 1000 * 60 * 60 * 24)).toISOString(), // 30 days ago
		endDate = new Date().toISOString(),	// now
	} = {}) {
		return this.connect(PUBLISHER_SERVICE_WSDL_URL).then(client => client.getTransactionList({
			dStartDate: startDate,
			dEndDate: endDate,
			sDateType: 'transaction',
			iLimit: 1000,
		})).then(result => {
			const { getTransactionListReturn = {} } = result
			const { Transaction = [] } = getTransactionListReturn || {}
			return Transaction
		})
	}
}
