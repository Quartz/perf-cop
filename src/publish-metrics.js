const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-east-1';

// Create CloudWatch instance.
AWS.config.update({ region });
const cloudwatch = new AWS.CloudWatch();

// Only support the metrics we know about.
const metricNames = {
	ttfcp: 'FirstContentfulPaint',
	ttfmp: 'FirstMeaningfulPaint',
	psi: 'PerceptualSpeedIndex',
	fv: 'FirstVisualChange',
	vc85: 'VisuallyComplete85',
	vc100: 'VisuallyComplete100',
	ttfi: 'FirstInteractive',
	ttci: 'ConsistentlyInteractive',
};

const getMetricName = timing => metricNames[timing.id];

const getMetricProps = metrics => ({
	Dimensions: [
		{
			Name: 'By Tested URL',
			Value: metrics.url,
		},
	],
	StorageResolution: 60,
	Timestamp: new Date(),
	Unit: 'Seconds',
});

const getMetric = timing => ({
	MetricName: getMetricName(timing),
	Value: Math.max(0, timing.timing / 1000),
});

module.exports = (metrics, eventName) => {
	const { timings } = metrics;
	const metricProps = getMetricProps(metrics);
	const addProps = metric => Object.assign(metric, metricProps);

	const metricData = {
		MetricData: timings.filter(getMetricName).map(getMetric).map(addProps),
		Namespace: process.env.CLOUDWATCH_METRIC_NAMESPACE || 'PerfCop',
	};

	return new Promise((resolve, reject) => {
		cloudwatch.putMetricData(metricData, (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			console.log('Published metrics to CloudWatch.');
			resolve(data);
		});
	});
};
