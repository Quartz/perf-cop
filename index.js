const pwmetrics = require('pwmetrics-lambda');
const extract = require('./src/extract-metrics');
const format = require('./src/format-metrics');
const publish = require('./src/publish-metrics');

// See README for expected format of event payload.
exports.handler = (event, context, callback) => {
	const { dimensions, options, url } = event;
	const success = callback.bind(null, null);

	pwmetrics(url, options)
		.then(extract)
		.then(results => format(results, dimensions))
		.then(publish)
		.then(success)
		.catch(callback);
};
