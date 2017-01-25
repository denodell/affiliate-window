import { describe, beforeEach } from 'ava-spec'
import sinon from 'sinon'
import AffiliateWindow from '../'
import fs from 'fs'
const getMerchantListData = JSON.parse(fs.readFileSync('./mock-data/getMerchantList.json', 'utf-8'))
const getTransactionListData = JSON.parse(fs.readFileSync('./mock-data/getTransactionList.json', 'utf-8'))
const getCommissionGroupListData = {
	9: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-0.json', 'utf-8')),
	2186: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-1.json', 'utf-8')),
	3355: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-2.json', 'utf-8')),
	3578: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-3.json', 'utf-8')),
	3744: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-4.json', 'utf-8')),
	6733: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-5.json', 'utf-8')),
	6986: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-6.json', 'utf-8')),
	7204: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-7.json', 'utf-8')),
	7256: JSON.parse(fs.readFileSync('./mock-data/getCommissionGroupList-8.json', 'utf-8')),
}
const getDiscountCodes = {
	9: [{}],
	2186: [{}],
	3355: [{}],
	3578: [{}],
	3744: JSON.parse(fs.readFileSync('./mock-data/getDiscountCodes-0.json', 'utf-8')),
	6733: [{}],
	6986: [{}],
	7204: [{}],
	7256: [{}],
}

describe(`Affiliate Window`, it => {
	let AW

	sinon.stub(AffiliateWindow.prototype, 'connect').returns(Promise.resolve({
		getMerchantList: () => Promise.resolve(getMerchantListData),
		getCommissionGroupList: ({ iMerchantId }) => Promise.resolve(getCommissionGroupListData[iMerchantId]),
		getDiscountCodes: ({ iMerchantId }) => Promise.resolve(getDiscountCodes[iMerchantId]),
		getTransactionList: () => Promise.resolve(getTransactionListData),
	}))

	beforeEach(() => {
		AW = new AffiliateWindow({
			publisherId: '-',
			apiPassword: '-',
			productServeApiKey: '-',
			promotionsId: '-',
		})
	})

	it('Joined Merchants', async expect => {
		let joinedMerchants = await AW.getMerchants({ joined: true })
		expect.true(joinedMerchants.length > 0)
	})

	it(`Vouchers`, async expect => {
		let vouchers = await AW.getVouchers()
		expect.true(vouchers.length > 0)
	})

	it('Transactions', async expect => {
		let transactions = await AW.getTransactions({ })
		expect.true(transactions.length > 0)
	})
})
