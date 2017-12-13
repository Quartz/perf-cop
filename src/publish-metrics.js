const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-east-1';

// Create CloudWatch instance.
AWS.config.update({ region });
const cloudwatch = new AWS.CloudWatch();

// Set a namespace for the CloudWatch metrics.
const Namespace = process.env.CLOUDWATCH_METRIC_NAMESPACE || 'PerfCop';

module.exports = MetricData => new Promise((resolve, reject) => {
	cloudwatch.putMetricData({ MetricData, Namespace }, (err, data) => {
		if (err) {
			reject(err);
			return;
		}

		console.log('Published metrics to CloudWatch.');
		resolve(data);
	});
});
