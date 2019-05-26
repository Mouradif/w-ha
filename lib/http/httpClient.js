const h = {
	http: require('http'),
	https: require('https')
};
const httpOptions = require('./httpOptions');
const whaOptions = require('./whaOptions');
const Hmac = require('../utils/hmac');

class HttpClient {

	constructor(options) {
		if (!options.apiKey || !options.apiSecret || !options.baseUrl)
			throw new Error("HttpClient constructor argument must include keys apiKey, apiSecret and baseUrl");
		if (!options.version)
			options.version = 1;
		this.baseUrl = options.baseUrl;
		this.version = options.version;
		this.apiKey = options.apiKey;
		this.apiSecret = options.apiSecret;
		this.history = [];
		this.cookies = {};
	}

	request(options) {
		return new Promise((resolve, reject) => {
			for (let i in httpOptions) {
				if (options[i])
					continue;
				if (!httpOptions[i].hasOwnProperty("default"))
					throw new Error(`[HttpClient] Missing required option ${i}`);
				options[i] = httpOptions[i].default;
			}
			const url = new URL(options.url);
			const module = h[options.scheme];
			options.protocol = url.protocol;
			options.hostname = url.hostname;
			options.port = url.port;
			options.path = url.pathname;
			options.headers["Content-Type"] = "application/json";

			const req = module.request(url.href, options, (res) => {
				// TODO: Parse Cookie/Session Headers
				let body = [];
				res.on('data', (chunk) => {
					body.push(chunk);
				});
				res.on('end', () => {
					const response = {
						status: res.statusCode,
						headers: res.headers,
						body: body.join('')
					};
					this.history.push({
						success: true,
						request: options,
						response
					});
					try {
						let result = JSON.parse(response.body);
						resolve(result);
					} catch(e) {
						resolve(response.body);
					}
				});
			});
			req.on('error', (e) => {
				this.history.push({
					success: false,
					request: options,
					error: e
				});
				reject(e);
			});
			if (options.hasOwnProperty('data')) {
				if (typeof options.data === "object")
					options.data = JSON.stringify(options.data);
				req.write(options.data);
			}
			req.end();
		});
	}

	async authRequest(options) {
		const timestamp = Date.now();
		let body = '';
		if (options.hasOwnProperty('data')) {
			if (typeof options.data === "object")
				options.data = JSON.stringify(options.data);
			body = options.data;
		}
		const hashString = [
			this.apiKey,
			timestamp,
			this.version,
			body
		].join(':');
		try {
			const sign = Hmac(this.apiSecret, hashString);
			const authString = [
				this.apiKey,
				timestamp,
				this.version,
				sign
			].join(':');
			if (!options.headers)
				options.headers = {};
			options.headers["Authorization"] = ['AUTH', authString].join(' ');
			return this.request(options);
		} catch (e) {
			return Promise.resolve();
		}
	}

	whaRequest(options) {
		options.url = this.baseUrl + options.url;
		options.scheme = 'https';
		return this.authRequest(options);
	}

	getAccount(id) {
		return this.whaRequest({
			url: `/accounts/${id}`
		});
	}

	getAccounts() {
		return this.whaRequest({
			url: '/accounts'
		});
	}

	getStandardAccounts(filters) {
		let query = [];
		for (let i in filters) {
			query.push(`${i}=${filters[i]}`);
		}
		let querystring = (query.length > 0) ? '?' + query.join('&') : '';
		return this.whaRequest({
			url: `/accounts/standard${querystring}`
		});
	}

	createAccount(type, data) {
		switch (type) {
			case 'standard':
				if (!data.email && !data.phone)
					throw new Error("E-Mail or Phone must be filled");
				break;
			case 'business':
				const mandatoryFields = [
					'name',
					'email',
					'registration_number',
					'representative',
					'tag'
				];
				let missingFields = [];
				for (let i = 0; i < mandatoryFields.length; i++) {
					const field = mandatoryFields[i];
					if (!data.hasOwnProperty(field)) {
						missingFields.push(field);
					}
				}
				if (missingFields.length)
					throw new Error("These mandatory fields are missing to create a business account: " + missingFields.join(', '));
				if (data.business_type != null && ['COMPANY', 'ASSOCIATION', 'SOLE_TRADER'].indexOf(data.business_type) === -1)
					throw new Error("business_type must be one of 'COMPANY', 'ASSOCIATION' or 'SOLE_TRADER'");
				break;
			default:
				throw new Error("Type should be 'standard' or 'business'");
				break;
		}

		return this.whaRequest({
			url: `/accounts/${type}`,
			method: 'POST',
			data: data
		});
	}

	getAccountEvents(id) {
		return this.whaRequest({
			url: `/accounts/${id}/events`,
			method: 'GET'
		});
	}

	updateAccount(id, data) {
		return this.getAccount(id)
			.then((account) => {
				const type = account.type.toLowerCase();
				this.whaRequest({
					url: `/accounts/${id}/${type}`,
					method: 'PUT',
					data
				})
			});
	}

	updateDocuments(id, documents) {
		return this.whaRequest({
			url: `/accounts/${id}/documents`,
			method: 'PUT',
			data: documents
		});
	}

	getDocument(id, type) {
		return this.whaRequest({
			url: `/accounts/${id}/documents/${type}`,
			method: 'GET'
		});
	}

	getDocuments(id) {
		return this.whaRequest({
			url: `/accounts/${id}/documents`,
			method: 'GET'
		});
	}

	requestKYC(id, level) {
		return this.whaRequest({
			url: `/accounts/${id}/validations/${level}/submit`,
			method: 'PUT'
		});
	}

	getKYC(id) {
		return this.whaRequest({
			url: `/accounts/${id}/validations`,
			method: 'GET'
		});
	}

	getWallet(id) {
		return this.whaRequest({
			url: `/wallets/${id}`,
			method: 'GET'
		})
	}

	getWallets() {
		return this.whaRequest({
			url: '/wallets'
		});
	}

	createWallet(data) {
		let options = {
			url: '/wallets',
			method: 'POST'
		};
		if (data)
			options.data = data;
		return this.whaRequest(options);
	}

	updateWallet(id, data) {
		return this.whaRequest({
			url: `/wallets/${id}`,
			method: 'PUT',
			data
		});
	}

	initCashIn(options) {
		return this.whaRequest({
			url: '/cash-in/creditcards/init',
			method: 'POST',
			data: options
		});
	}

	getCreditCards(options) {
		return this.whaRequest({
			url: `/creditcards`,
			method: 'GET'
		});
	}

	cancelCashIn(id) {
		return this.whaRequest({
			url: `/cash-in/${id}`,
			method: 'DELETE'
		});
	}

	confirmCashIn(id) {
		return this.whaRequest({
			url: `/cash-in/${id}`,
			method: 'PUT'
		});
	}
}

module.exports = HttpClient;
