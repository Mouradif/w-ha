const crypto = require('crypto');

module.exports = (secret, data, algo='sha256', format='hex') => {
	return crypto.createHmac(algo, secret).update(data).digest(format);
};
