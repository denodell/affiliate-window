/* eslint-disable no-console */

import 'babel-polyfill'
import fetch from 'isomorphic-fetch'
import 'source-map-support/register'
import getCSV from 'get-csv'
import 'date-format-lite'

export default class Awin {
	oAuthToken = null

	constructor({ oAuthToken }) {
		this.oAuthToken = oAuthToken
	}

	fetchJson(url) {
		return fetch(url, {
			headers: {
				'Authorization': `Bearer ${this.oAuthToken}`,
			},
		})
		.then(response => {
			if (!response.ok) {
				throw response.statusText
			}
			return response
		}).then(response => response.json()).catch(e => console.error(e))
	}

	fetchCSV(url) {
		return getCSV(url)
	}

	getAccounts(type = `publisher`) {
		return this.fetchJson(`https://api.awin.com/accounts?type=${type}`)
	}

	getProgrammes({ account, relationship = `joined` }) {
		return this.fetchJson(`https://api.awin.com/publishers/${account}/programmes?relationship=${relationship}`)
	}

	getProgrammeDetail({ account, advertiserId }) {
		return this.fetchJson(`https://api.awin.com/publishers/${account}/programmedetails?advertiserId=${advertiserId}`)
	}

	getProgrammeDetails({ account, relationship = `joined` }) {
		return (async () => {
			const programmes = await this.getProgrammes({ account, relationship })
			const programmeIds = programmes.map(programme => programme.id)
			const promises = programmeIds.map(advertiserId => this.getProgrammeDetail({ account, advertiserId }))
			return await Promise.all(promises)
		})()
	}

	getCommissionGroup({ account, advertiserId, commissionGroup }) {
		const urlExtra = advertiserId ? `?advertiserId=${advertiserId}` : `/${commissionGroup}`
		return this.fetchJson(`https://api.awin.com/publishers/${account}/commissiongroups${urlExtra}`)
	}

	getProgrammeAndCommissionGroups({ account, relationship = `joined` }) {
		return (async () => {
			const programmes = await this.getProgrammes({ account, relationship })
			const programmeIds = programmes.map(programme => programme.id)
			const promises = programmeIds.map(advertiserId => this.getCommissionGroup({ account, advertiserId }))
			const results = await Promise.all(promises)
			return results.map((result, index) => Object.assign({}, programmes[index], result))
		})()
	}

	// By default, gets most recent year's transactions
	getTransactions({ account, startDate = (new Date()).add(-1, `years`), endDate = new Date(), dateType = `transaction`, timezone = `UTC` }) {
		return (async () => {
			const dateRangeInDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
			const daysInRange = 31
			const numberOfDayRanges = Math.ceil(dateRangeInDays / daysInRange)
			const promises = (() => {
				let index = 0
				let promises = []
				for (; index < numberOfDayRanges; index = index + 1) {
					const startDateToUse = (new Date(startDate.getTime())).add(daysInRange * index, `days`)
					let endDateToUse = (new Date(startDate.getTime())).add(daysInRange * (index + 1), `days`)
					if (endDateToUse > endDate) {
						endDateToUse = endDate
					}
					promises.push(this.fetchJson(`https://api.awin.com/publishers/${account}/transactions/?startDate=${encodeURIComponent(startDateToUse.format(`YYYY-MM-DDThh:mm:ss`))}&endDate=${encodeURIComponent(endDateToUse.format(`YYYY-MM-DDThh:mm:ss`))}&dateType=${dateType}&timezone=${timezone}`))
				}
				return promises
			})()
			const results = await Promise.all(promises)
			return results.reduce((prev, curr) => prev.concat(curr), [])
		})()
	}

	getVouchers({ account, promotionsId }) {
		return (async () => {
			const csv = await this.fetchCSV(`https://ui.awin.com/export-promotions/${account}/${promotionsId}?promotionType=voucher&categoryIds=&regionIds=&advertiserIds=&membershipStatus=joined&promotionStatus=`)
			return csv.map(voucher => {
				return {
					id: voucher['Promotion ID'],
					advertiserId: voucher['Advertiser ID'],
					code: voucher.Code,
					description: voucher.Description,
					url: voucher['Deeplink Tracking'],
					startDate: voucher.Starts.date("YYYY-MM-DD hh:mm:ss"),
					endDate: voucher.Ends.date("YYYY-MM-DD hh:mm:ss"),
				}
			})
		})()
	}
}
