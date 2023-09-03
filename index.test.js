const process = require('process');
const cp = require('child_process');
const path = require('path');
require('dotenv').config()

/*this function seems to be broken on infisical-node*/
// describe("infisical-actions", () => {
// 	test("set", async () => {
// 		let secretData = await infisicalActions.updateSecrets(
// 			process.env.TOKEN_DEV_DIR1,
// 			"/dir1",
// 			"dev",
// 			["UPDATE_TEST"],
// 			["456"]
// 		)

// 		console.log(secretData)
// 	})
// })

function expectOutputs(resultString, outputs) {
	//make sure all outputs are set
	outputs.forEach(output => {
		expect(resultString).toContain(`::set-output name=${output.name}::${output.value}`)
	})

	//make sure no other outputs are set
	const outputNames = outputs.map(output => output.name)
	const resultOutputs = resultString.match(/::set-output name=(.*?)::/g)
	resultOutputs.forEach(resultOutput => {
		const resultOutputName = resultOutput.match(/::set-output name=(.*?)::/)[1]
		expect(outputNames).toContain(resultOutputName)
	})
}

function wipeEnv() {
	process.env['INPUT_DOMAIN'] = ''
	process.env['INPUT_GET'] = ''
	process.env['INPUT_DELETE'] = ''
	process.env['INPUT_CREATE'] = ''
	process.env['INPUT_UPDATE'] = ''
}

describe("get", () => {
	beforeEach(() => {
		wipeEnv()
	})

	test('get all secrets', () => {
		process.env['INPUT_GET'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"outputListName": "get"
				},
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"outputListName": "get"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "get_DIR1_SECRET1", value: "DIR1_SECRET1_VALUE_DEV" },
			{ name: "get_DIR1_SECRET2", value: "DIR1_SECRET2_VALUE_DEV" },
			{ name: "get_DIR2_SECRET1", value: "DIR2_SECRET1_VALUE_DEV" },
		]
		expectOutputs(result, outputs)
	})

	test('get some secrets', () => {
		process.env['INPUT_GET'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"secrets": ["DIR1_SECRET1", "DIR1_SECRET2"],
					"outputListName": "dir1"
				},
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_SECRET1"],
					"outputListName": "dir2"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "dir1_DIR1_SECRET1", value: "DIR1_SECRET1_VALUE_DEV" },
			{ name: "dir1_DIR1_SECRET2", value: "DIR1_SECRET2_VALUE_DEV" },
			{ name: "dir2_DIR2_SECRET1", value: "DIR2_SECRET1_VALUE_DEV" },
		]
		expectOutputs(result, outputs)
	})

	test('get secrets in one output list', () => {
		process.env['INPUT_GET'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"outputListName": "secrets"
				},
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_SECRET1"],
					"outputListName": "secrets"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "secrets_DIR1_SECRET1", value: "DIR1_SECRET1_VALUE_DEV" },
			{ name: "secrets_DIR1_SECRET2", value: "DIR1_SECRET2_VALUE_DEV" },
			{ name: "secrets_DIR2_SECRET1", value: "DIR2_SECRET1_VALUE_DEV" },
		]
		expectOutputs(result, outputs)
	})

	test('no provided outputListName', () => {
		process.env['INPUT_GET'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}"
				},
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_SECRET1"]
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "dev_dir1_DIR1_SECRET1", value: "DIR1_SECRET1_VALUE_DEV" },
			{ name: "dev_dir1_DIR1_SECRET2", value: "DIR1_SECRET2_VALUE_DEV" },
			{ name: "dev_dir2_DIR2_SECRET1", value: "DIR2_SECRET1_VALUE_DEV" },
		]
		expectOutputs(result, outputs)
	})
})

describe("create", () => {
	beforeEach(() => {
		wipeEnv()
	})

	test("create secret", () => {
		process.env['INPUT_CREATE'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"secrets": ["DIR1_CREATED_SECRET1"],
					"secretValues": ["DIR1_CREATED_SECRET1_VALUE"],
					"outputListName": "created"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "created_DIR1_CREATED_SECRET1", value: "DIR1_CREATED_SECRET1_VALUE" },
		]
		expectOutputs(result, outputs)
	})

	test("create multiple secrets", () => {
		process.env['INPUT_CREATE'] = `
			[
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_CREATED_SECRET1", "DIR2_CREATED_SECRET2"],
					"secretValues": ["DIR2_CREATED_SECRET1_VALUE", "DIR2_CREATED_SECRET2_VALUE"],
					"outputListName": "created_multiple"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "created_multiple_DIR2_CREATED_SECRET1", value: "DIR2_CREATED_SECRET1_VALUE" },
			{ name: "created_multiple_DIR2_CREATED_SECRET2", value: "DIR2_CREATED_SECRET2_VALUE" },
		]
		expectOutputs(result, outputs)
	})
})

describe("update", () => {
	beforeEach(() => {
		wipeEnv()
	})

	test("update secret", () => {
		process.env['INPUT_UPDATE'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"secrets": ["DIR1_CREATED_SECRET1"],
					"secretValues": ["DIR1_CREATED_SECRET1_VALUE_UPDATED"],
					"outputListName": "updated"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "updated_DIR1_CREATED_SECRET1", value: "DIR1_CREATED_SECRET1_VALUE_UPDATED" },
		]
		expectOutputs(result, outputs)
	})

	test("update multiple secrets", () => {
		process.env['INPUT_UPDATE'] = `
			[
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_CREATED_SECRET1", "DIR2_CREATED_SECRET2"],
					"secretValues": ["DIR2_CREATED_SECRET1_VALUE_UPDATED", "DIR2_CREATED_SECRET2_VALUE_UPDATED"],
					"outputListName": "updated_multiple"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "updated_multiple_DIR2_CREATED_SECRET1", value: "DIR2_CREATED_SECRET1_VALUE_UPDATED" },
			{ name: "updated_multiple_DIR2_CREATED_SECRET2", value: "DIR2_CREATED_SECRET2_VALUE_UPDATED" },
		]
		expectOutputs(result, outputs)
	})
})

describe("delete", () => {
	beforeEach(() => {
		wipeEnv()
	})

	test("delete secret", () => {
		process.env['INPUT_DELETE'] = `
			[
				{
					"path": "/dir1",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR1']}",
					"secrets": ["DIR1_CREATED_SECRET1"],
					"outputListName": "deleted"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "deleted_DIR1_CREATED_SECRET1", value: "" },
		]
		expectOutputs(result, outputs)
	})

	test("delete multiple secrets", () => {
		process.env['INPUT_DELETE'] = `
			[
				{
					"path": "/dir2",
					"env": "dev",
					"token": "${process.env['TOKEN_DEV_DIR2']}",
					"secrets": ["DIR2_CREATED_SECRET1", "DIR2_CREATED_SECRET2"],
					"outputListName": "deleted_multiple"
				}
			]
		`
		process.env['INPUT_DOMAIN'] = process.env['DOMAIN']

		const ip = path.join(__dirname, 'index.js');
		const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
		console.log(result)

		const outputs = [
			{ name: "deleted_multiple_DIR2_CREATED_SECRET1", value: "" },
			{ name: "deleted_multiple_DIR2_CREATED_SECRET2", value: "" },
		]
		expectOutputs(result, outputs)
	})
})
