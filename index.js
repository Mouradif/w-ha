const fs = require('fs');
const HttpClient = require('./lib/http/httpClient');
const config = require('./config.json');
JSON.prettify = function(res) {
	return this.stringify(res, null, 2);
}
const client = new HttpClient(config);

/**
 * Create Standard Account
 */
 client.createAccount('standard', {
 	email: 'email@mail.com',
 	phone_number: '0101010102',
 	subscriber: {
 		firstname: 'Firstname',
 		lastname: 'Lastname',
 		nationality: 'MAR',
 		birthdate: '1980-01-01'
 	},
 	address: {
 		label1: '1, rue de l\'Exemple',
 		zip_code: '10000',
 		city: 'Simcity',
 		country: 'MAR'
 	}
 })

/**
 * Create Business Account
 */
// client.createAccount('business', {
// 	name: 'Example Business Account',
// 	business_type: 'COMPANY',
// 	email: 'business.account@mail.com',
// 	registration_number: 'GG98149814',
// 	representative: {
// 		firstname: 'First',
// 		lastname: 'Last',
// 		birthdate: '1980-01-01',
// 		nationality: 'FRA'
// 	},
// 	tag: 'example_business_account'
// });

/**
 * Init Cash-in
 */
// client.initCashIn({
// 	partner_ref: 'CI-TEST-0002',
// 	tag: 'Cash-in-test',
// 	receiver_wallet_id: 'WE-0090627546358840',
// 	fees_wallet_id: 'WF-4039830628867210',
// 	amount: 100,
// 	fees: 5,
// 	return_url: 'http://devhunt.eu:4545',
// 	lang: 'fr',
// 	auth_timeout_delay: 86400
// })

/**
 * Upload documents
 */
// const files = {
// 	PROOF_OF_IBAN: 'iban.pdf',
// 	PROOF_OF_ID: 'id.pdf'
// };
// let documents = [];
// for (let type in files) {
// 	const file = files[type];
// 	data = fs.readFileSync(file);
// 	documents.push({
// 		type,
// 		files: [
// 			{
// 				file_name: file,
// 				content: data.toString('base64')
// 			}
// 		]
// 	});
// }
// client.updateDocuments('AS-6118225910763798', documents)

/**
 * List documents
 */
// client.getDocument('AS-6118225910763798')

/**
 * Get document
 */
// client.getDocument('AS-6118225910763798', 'PROOF_OF_ID')
	.then((res) => console.log(JSON.prettify(res)))
	.catch((err) => {
		console.error("Erreur");
		console.error(err);
	});
