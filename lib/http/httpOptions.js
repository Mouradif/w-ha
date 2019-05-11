module.exports = {
	method: {
		type: "string",
		required: true,
		default: "GET"
	},
	scheme: {
		type: "string",
		require: true,
		default: "http"
	},
	url: {
		type: "string",
		required: true
	},
	headers: {
		type: "object",
		required: true,
		default: {}
	},
	path: {
		type: "string",
		required: true,
		default: '/'
	},
	port: {
		type: "number",
		required: true,
		default: 80
	}
};
