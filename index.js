const HttpClient = require('./lib/http/httpClient');
const config = require('./config.json');
JSON.prettify = function(res) {
	return this.stringify(res, null, 2);
}
const client = new HttpClient(config);

/*
client.initCashIn({
	partner_ref: 'CI-TEST-0002',
	tag: 'Cash-in-test',
	receiver_wallet_id: 'WE-0090627546358840',
	fees_wallet_id: 'WF-4039830628867210',
	amount: 100,
	fees: 5,
	return_url: 'http://devhunt.eu:4545',
	lang: 'fr',
	auth_timeout_delay: 86400
})
*/
client.confirmCashIn('TX-8373472067548957')
	.then((res) => console.log(JSON.prettify(res)))
	.catch((err) => {
		console.error("Erreur");
		console.error(err);
	});
