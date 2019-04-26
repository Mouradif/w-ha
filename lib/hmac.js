const crypto = require('crypto');

module.exports = (secret, data, algo='sha256', format='hex') => {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHmac(algo, secret);
		hash.on('readable', () => {
			const data = hash.read();
			if (!data)
				throw new Error("No data to read");
			resolve(data.toString(format));
		});
		hash.write(data);
		hash.end();
	});
};
