import 'babel-polyfill'
import 'source-map-support/register'
import soap from 'soap'

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
			productServeApiPassword,
		})
	}

	connect() {
		return new Promise((resolve, reject) => {
			soap.createClient(WEB_SERVICE_URL, (err, client) => {
				if (err) {
					return reject(err)
				}

				const { iId: publisherId, sPassword: apiPassword, sApiKey: productServeApiPassword } = this.config

				client.addSoapHeader({
					UserAuthentication: {
						iId,
						sPassword,
						sApiKey,
						sType: 'affiliate',
					},
				})

				resolve(client)
			})
		})
	}

	get(client, methodName, params) {
		return new Promise((resolve, reject) => {
			client[methodName](params, (err, result) => {
				if (err) {
					return reject(err)
				}

				resolve(result)
			})
		})
	}

	getMerchantList(params) {
		this.connect().then(client => get(client, `getMerchantList`, params)).then(result => {
			result.getMerchantListReturn.Transaction
		})
	}

	getTransactionList(params) {
		this.connect().then(client => get(client, `getTransactionList`, params)).then(result => {
			result.getTransactionListReturn.Transaction
		})
	}
}
