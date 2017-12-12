const pwmetrics = require('pwmetrics-lambda');
const extract = require('./src/extract-metrics');
const publish = require('./src/publish-metrics');

// See README for expected format of event payload.
exports.handler = (event, context, callback) => {
	const { name, options, url } = event;
	const success = callback.bind(null, null);

	pwmetrics(url, options).then(extract).then(publish).then(success).catch(callback);
};
