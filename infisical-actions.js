const InfisicalClient = require('infisical-node')
const core = require('@actions/core')

const SITE_URL = core.getInput('domain') || undefined

async function getAllSecrets(token, path, env) {
	try {
		//create client
		const client = new InfisicalClient({
			token,
			siteURL: SITE_URL
		})

		//get all secrets
		const secrets = await client.getAllSecrets({
			environment: env,
			path: path
		})

		//convert secret data to map and return
		const secretsMap = {}
		for (const secret of secrets) {
			//exclude the fallback secret
			if (!secret.isFallback)
				secretsMap[secret.secretName] = secret.secretValue
		}

		return secretsMap
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function getSecrets(token, path, env, secretNames) {
	try {
		//create client
		const client = new InfisicalClient({
			token,
			siteURL: SITE_URL
		})

		//get the secrets with async requests
		const promises = []
		secretNames.forEach(secretName =>
			promises.push(client.getSecret(secretName, {
				environment: env,
				path: path,
				type: "shared"
			}))
		)

		//wait for all promises to resolve
		const secrets = await Promise.all(promises)

		//convert secret data to map and return
		const secretsMap = {}
		for (const secret of secrets) {
			//exclude the fallback secret
			if (!secret.isFallback)
				secretsMap[secret.secretName] = secret.secretValue
		}

		return secretsMap
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function createSecrets(token, path, env, secretNames, secretValues) {
	try {
		//create client
		const client = new InfisicalClient({
			token,
			siteURL: SITE_URL
		})

		//create secrets with async requests
		const promises = []
		secretNames.forEach((secretName, index) =>
			promises.push(client.createSecret(secretName, secretValues[index], {
				environment: env,
				path: path,
				type: "shared"
			}))
		)

		//wait for all promises to resolve
		const secrets = await Promise.all(promises)

		//convert secret data to map and return
		const secretsMap = {}
		for (const secret of secrets) {
			//exclude the fallback secret
			if (!secret.isFallback)
				secretsMap[secret.secretName] = secret.secretValue
		}

		return secretsMap
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function deleteSecrets(token, path, env, secretNames) {
	try {
		//create client
		const client = new InfisicalClient({
			token,
			siteURL: SITE_URL
		})

		//delete secrets with async requests
		const promises = []
		secretNames.forEach(secretName =>
			promises.push(client.deleteSecret(secretName, {
				environment: env,
				path: path,
				type: "shared"
			}))
		)

		//wait for all promises to resolve
		const secrets = await Promise.all(promises)

		//convert secret data to map and return
		const secretsMap = {}
		for (const secret of secrets) {
			//exclude the fallback secret
			if (!secret.isFallback)
				secretsMap[secret.secretName] = secret.secretValue
		}

		return secretsMap
	} catch (error) {
		core.setFailed(error.message)
	}
}

async function updateSecrets(token, path, env, secretNames, secretValues) {
	try {
		//create client
		const client = new InfisicalClient({
			token,
			siteURL: SITE_URL
		})

		//update secrets with async requests
		const promises = []
		secretNames.forEach((secretName, index) =>
			promises.push(client.updateSecret(secretName, secretValues[index], {
				environment: env,
				path: path
			}))
		)

		//wait for all promises to resolve
		const secrets = await Promise.all(promises)

		console.log(secretNames)
		console.log(secretValues)
		console.log(secrets)

		//convert secret data to map and return
		const secretsMap = {}
		for (const secret of secrets) {
			//exclude the fallback secret
			if (!secret.isFallback)
				secretsMap[secret.secretName] = secret.secretValue
		}

		return secretsMap
	} catch (error) {
		core.setFailed(error.message)
	}
}

module.exports = {
	getAllSecrets,
	getSecrets,
	createSecrets,
	deleteSecrets,
	updateSecrets
}
