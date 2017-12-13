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

const getDimension = (Name, Value) => ({ Name, Value });

const getMetricName = timing => metricNames[timing.id];

const getMetric = timing => ({
	MetricName: getMetricName(timing),
	Value: Math.max(0, timing.timing / 1000),
});

module.exports = (metrics, dimensions = {}) => {
	const { timings, url } = metrics;
	const metricProps = {
		Dimensions: [
			getDimension('By Tested URL', url),
			...Object.keys(dimensions).map(name => getDimension(name, dimensions[name])),
		],
		StorageResolution: 60,
		Timestamp: new Date(),
		Unit: 'Seconds',
	};
	const addProps = metric => Object.assign(metric, metricProps);

	return timings.filter(getMetricName).map(getMetric).map(addProps);
};
