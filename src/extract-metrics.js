module.exports = results => {
	// If results provide a median, use that.
	if (results && results.median) {
		return results.median;
	}

	// Otherwise return the first run.
	if (results && results.runs && results.runs.length) {
		return results.runs[0];
	}

	throw new Error('PWMetrics results do not contain usable timings.');
};
