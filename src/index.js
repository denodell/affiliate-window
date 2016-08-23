import 'babel-polyfill'
import 'source-map-support/register'
import soap from 'soap-as-promised'

const WEB_SERVICE_URL = 'http://api.affiliatewindow.com/v6/AffiliateService?wsdl'

export default class AffiliateWindow {
	config = {
		publisherId: '',
		apiPassword: '',
	}

	constructor({ publisherId, apiPassword }) {
		this.config = Object.assign({}, this.config, {
			publisherId,
			apiPassword,
		})
	}

	connect() {
		return soap.createClient(WEB_SERVICE_URL).then(client => {
			const { publisherId: iId, apiPassword: sPassword } = this.config
			client.addSoapHeader({
				UserAuthentication: {
					iId,
					sPassword,
					sType: 'affiliate',
				},
			})
			return client
		})
	}

	getMerchants({ joined = true }) {
		return this.connect().then(client => {
			return client.getMerchantList(joined ? { sRelationship: 'joined' } : {}).then(result => {
				const { getMerchantListReturn = {} } = result
				const { Merchant = [] } = getMerchantListReturn
				const aMerchantIds = Merchant.map(merchant => merchant.iId)
				const promises = aMerchantIds.map(id => client.getCommissionGroupList({ iMerchantId: id }))

				return Promise.all(promises).then(data => data.map(data => (data.getCommissionGroupListReturn || {}).CommissionGroup || [])).then(data => {
					const merchants = Merchant.map((merchant, index) => {
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

					return merchants
				})
			})
		})
	}

	// TODO:
	getVouchers() {

	}

	// TODO:
	getLinks() {

	}

	getTransactions({
		startDate = new Date(Date.now() - (30 * 1000 * 60 * 60 * 24)).toISOString(), // 30 days ago
		endDate = new Date().toISOString(),	// now
	}) {
		return this.connect().then(client => client.getTransactionList({
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
