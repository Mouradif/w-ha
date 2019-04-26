const h = {
	http: require('http'),
	https: require('https')
};
const httpOptions = require('./http-options');
const whaOptions = require('./wha-options');
const Hmac = require('./hmac');

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

			console.log("Sending request:", options);
			const req = module.request(url.href, options, (res) => {
				console.log(res.statusCode)
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
					resolve(response);
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
			if (options.hasOwnProperty('body')) {
				if (typeof options.body === "object")
					options.body = JSON.stringify(options.body);
				req.write(options.body);
			}
			req.end();
		});
	}

	async authRequest(options) {
		const timestamp = Date.now();
		let body = '';
		if (options.hasOwnProperty('body')) {
			if (typeof options.body === "object")
				options.body = JSON.stringify(options.body);
			body = options.body;
		}
		const hashString = [
			this.apiKey,
			timestamp,
			this.version,
			body
		].join(':');
		console.log("String to sign", hashString);
		const sign = await Hmac(this.apiSecret, hashString);
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
	}

	async whaRequest(options) {
		options.url = this.baseUrl + options.url;
		options.scheme = 'https';
		return this.authRequest(options);
	}

	async getAccounts() {
		return this.whaRequest({
			url: '/accounts'
		});
	}

	async createAccount(type, data) {
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
					'address',
					''
				];
		}

		return this.whaRequest({
			url: `/accounts/${type}`,
			method: 'POST',
			data: data
		});
	}

	async 
}

module.exports = HttpClient;
