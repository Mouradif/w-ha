class Account {
	constructor(httpClient, accountData) {
		this.httpClient = httpClient;
		this.id = accountData.id;
		this.type = accountData.type;
		this.status = accountData.status;
		this.kycLevel = accountData.kyc_level;
		this.creationDate = accountData.creation_date;
		this.tag = accountData.tag;
	}

	getEvents() {
		return this.httpClient.getAccountEvents({
			account: this.id
		});
	}

	get
}
