const { handler } = require('./index');

const event = {
	url: 'https://work.qz.com/',
	options: {
		flags: {
			blockedUrlPatterns: [],
			runs: 3,
		},
	},
	dimensions: {
		//'My Custom Dimension': 'dimension-string-value',
	},
};

const callback = (err, metrics) => {
	if (err) {
		console.error(err);
		return;
	}

	metrics.forEach(metric => console.log(mertic));
};

// Simulate Lambda call.
handler(event, null, callback);
