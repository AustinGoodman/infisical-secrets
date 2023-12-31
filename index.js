const core = require('@actions/core')
const infisicalActions = require('./infisical-actions')

//will mask all tokens given in the secreRequests array of get, set, create, delete
function maskTokens(secretRequests) {
	//mask tokens
	secretRequests.forEach(secretRequest => {
		core.setSecret(secretRequest.token)
	})
}

//will mask all secret values in secretMap generated by infisical-actions.js function calls
function maskSecretValues(secretMap) {
	Object.keys(secretMap).forEach(secretName => {
		core.setSecret(secretMap[secretName])
	})
}

function setActionsOutputs(prefix, secretMap) {
	Object.keys(secretMap).forEach(secretName => {
		core.setOutput(`${prefix}_${secretName}`, secretMap[secretName])
	})

}

//user input for get, set, create, delete are given as arrays of json objects
async function inputStringToJSON(inputName) {
	let json = undefined

	try {
		let jsonString = "{\n\"secrets\":\n" + core.getInput(inputName) + "\n}"
		json = JSON.parse(jsonString)
	} catch (error) {
		core.setFailed(error.message)
	}

	return json
}

//parse and execute get actions from user input
async function getSecrets() {
	try {
		if (!core.getInput('get')) return

		//get input data in json format
		const secretRequestData = await inputStringToJSON('get')
		const secretRequests = secretRequestData.secrets

		//mask tokens
		maskTokens(secretRequests)

		//secrets will be bucketed by secretRequest.outputListName
		const outputLists = {}

		//retrieve secrets and map to outputLists
		for (const secretRequest of secretRequests) {
			//generate output list name if not given: <env>_<pathdir1>_..._<pathdirN>
			const outputListName =
				secretRequest.outputListName ||
				`${secretRequest.env}${secretRequest.path.replace(/\//g, '_')}`

			//get secret data
			let secretData
			if (!secretRequest.secrets) {//no secrets specified, get all secrets
				core.info(`Getting all secrets for ${secretRequest.path} in ${secretRequest.env} environment`)
				secretData = await infisicalActions.getAllSecrets(
					secretRequest.token,
					secretRequest.path,
					secretRequest.env
				)
			}
			else {//get specified secrets
				core.info(`Getting secrets ${secretRequest.secrets.join(", ")} for ${secretRequest.path} in ${secretRequest.env} environment`)
				secretData = await infisicalActions.getSecrets(
					secretRequest.token,
					secretRequest.path,
					secretRequest.env,
					secretRequest.secrets
				)
			}
			//create output list if it doesn't exist
			if (!outputLists[outputListName])
				outputLists[outputListName] = {}

			//add secret data to output list
			outputLists[outputListName] = { ...outputLists[outputListName], ...secretData }
		}

		//set actions outputs for each output list and mask secret values
		Object.keys(outputLists).forEach(outputListName => {
			maskSecretValues(outputLists[outputListName])
			setActionsOutputs(outputListName, outputLists[outputListName])
		})
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function createSecrets() {
	try {
		if (!core.getInput('create')) return

		//get input data in json format
		const secretRequestData = await inputStringToJSON('create')
		const secretRequests = secretRequestData.secrets

		//mask tokens
		maskTokens(secretRequests)

		//secrets will be bucketed by secretRequest.outputListName
		const outputLists = {}

		//retrieve secrets and map to outputLists
		for (const secretRequest of secretRequests) {
			//generate output list name if not given: <env>_<pathdir1>_..._<pathdirN>
			const outputListName =
				secretRequest.outputListName ||
				`${secretRequest.env}${secretRequest.path.replace(/\//g, '_')}`

			//get secret data
			core.info(`Creating secrets ${secretRequest.secrets.join(", ")} for ${secretRequest.path} in ${secretRequest.env} environment`)
			let secretData = await infisicalActions.createSecrets(
				secretRequest.token,
				secretRequest.path,
				secretRequest.env,
				secretRequest.secrets,
				secretRequest.secretValues
			)

			//create output list if it doesn't exist
			if (!outputLists[outputListName])
				outputLists[outputListName] = {}

			//add secret data to output list
			outputLists[outputListName] = { ...outputLists[outputListName], ...secretData }
		}

		//set actions outputs for each output list and mask secret values
		Object.keys(outputLists).forEach(outputListName => {
			maskSecretValues(outputLists[outputListName])
			setActionsOutputs(outputListName, outputLists[outputListName])
		})
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function deleteSecrets() {
	try {
		if (!core.getInput('delete')) return

		//get input data in json format
		const secretRequestData = await inputStringToJSON('delete')
		const secretRequests = secretRequestData.secrets

		//mask tokens
		maskTokens(secretRequests)

		//secrets will be bucketed by secretRequest.outputListName
		const outputLists = {}

		//retrieve secrets and map to outputLists
		for (const secretRequest of secretRequests) {
			//generate output list name if not given: <env>_<pathdir1>_..._<pathdirN>
			const outputListName =
				secretRequest.outputListName ||
				`${secretRequest.env}${secretRequest.path.replace(/\//g, '_')}`

			//get secret data
			core.info(`Deleting secrets ${secretRequest.secrets.join(", ")} for ${secretRequest.path} in ${secretRequest.env} environment`)
			let secretData = await infisicalActions.deleteSecrets(
				secretRequest.token,
				secretRequest.path,
				secretRequest.env,
				secretRequest.secrets
			)

			//create output list if it doesn't exist
			if (!outputLists[outputListName])
				outputLists[outputListName] = {}

			//add secret data to output list
			outputLists[outputListName] = { ...outputLists[outputListName], ...secretData }
		}

		//set actions outputs for each output list and mask secret values
		Object.keys(outputLists).forEach(outputListName => {
			maskSecretValues(outputLists[outputListName])
			setActionsOutputs(outputListName, outputLists[outputListName])
		})
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function updateSecrets() {
	try {
		if (!core.getInput('update')) return

		//get input data in json format
		const secretRequestData = await inputStringToJSON('update')
		const secretRequests = secretRequestData.secrets

		//mask tokens
		maskTokens(secretRequests)

		//secrets will be bucketed by secretRequest.outputListName
		const outputLists = {}

		//retrieve secrets and map to outputLists
		for (const secretRequest of secretRequests) {
			//generate output list name if not given: <env>_<pathdir1>_..._<pathdirN>
			const outputListName =
				secretRequest.outputListName ||
				`${secretRequest.env}${secretRequest.path.replace(/\//g, '_')}`

			//get secret data
			core.info(`Updating secrets ${secretRequest.secrets.join(", ")} for ${secretRequest.path} in ${secretRequest.env} environment`)
			//the following function is broken, therefore delete and create are used instead
			// let secretData = await infisicalActions.updateSecrets(
			// 	secretRequest.token,
			// 	secretRequest.path,
			// 	secretRequest.env,
			// 	secretRequest.secrets,
			// 	secretRequest.secretValues
			// )
			await infisicalActions.deleteSecrets(
				secretRequest.token,
				secretRequest.path,
				secretRequest.env,
				secretRequest.secrets
			)
			let secretData = await infisicalActions.createSecrets(
				secretRequest.token,
				secretRequest.path,
				secretRequest.env,
				secretRequest.secrets,
				secretRequest.secretValues
			)

			//create output list if it doesn't exist
			if (!outputLists[outputListName])
				outputLists[outputListName] = {}

			//add secret data to output list
			outputLists[outputListName] = { ...outputLists[outputListName], ...secretData }
		}

		//set actions outputs for each output list and mask secret values
		Object.keys(outputLists).forEach(outputListName => {
			maskSecretValues(outputLists[outputListName])
			setActionsOutputs(outputListName, outputLists[outputListName])
		})
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function run() {
	try {
		await getSecrets()
		await deleteSecrets()
		await createSecrets()
		await updateSecrets()

	} catch (error) {
		core.setFailed(error.message)
	}
}

run();
