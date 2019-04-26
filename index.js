const HttpClient = require('./lib/http-client');
const config = require('./config.json');

const client = new HttpClient(config);

client.getAccounts().then((res) => {
	console.log("Server said", res);
}).catch((err) => {
	console.error("Erreur");
	console.error(err);
});
