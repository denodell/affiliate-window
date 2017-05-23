import { describe, beforeEach } from 'ava-spec'
import sinon from 'sinon'
import Awin from '../'
import fs from 'fs'

describe(`Awin`, it => {
	let AW
	const account = 12345
	const advertiserId = 123
	const promotionsId = `abcd1234abcd2123`

	beforeEach(() => {
		AW = new Awin({ oAuthToken: `__OATH_TOKEN__` })
	})

	it(`Gets accounts`, async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getAccounts.json', 'utf-8')))
		const accounts = await AW.getAccounts()
		expect.true(accounts.accounts.length > 0)
	})

	it(`Gets programmes`, async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getProgrammes.json', 'utf-8')))
		const programmes = await AW.getProgrammes({ account })
		expect.true(programmes.length > 0)
	})

	it(`Gets programme details`, async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getProgrammeDetails.json', 'utf-8')))
		const programmeDetails = await AW.getProgrammeDetails({ account })
		expect.true(programmeDetails.length > 0)
	})

	it(`Gets a commission group`, async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getCommissionGroup.json', 'utf-8')))
		const commissionGroup = await AW.getCommissionGroup({ account, advertiserId })
		expect.true(commissionGroup.commissionGroups.length > 0)
	})

	it(`Gets programme and commission groups`, async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getCommissionGroups.json', 'utf-8')))
		const programmeAndCommissionGroups = await AW.getProgrammeAndCommissionGroups({ account })
		expect.true(programmeAndCommissionGroups.length > 0)
	})

	it.only('Transactions', async expect => {
		sinon.stub(AW, `fetchJson`).returns(JSON.parse(fs.readFileSync('./mock-data/getTransactions.json', 'utf-8')))
		const transactions = await AW.getTransactions({ account })
		expect.true(transactions.length > 0)
	})

	it(`Vouchers`, async expect => {
		sinon.stub(AW, `fetchCSV`).returns(JSON.parse(fs.readFileSync('./mock-data/getVouchers.json', 'utf-8')))
		const vouchers = await AW.getVouchers({ account, promotionsId })
		expect.true(vouchers.length > 0)
	})
})
