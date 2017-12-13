# Perf Cop 📉🚓

**Perf Cop** is an [AWS Lambda][lambda] function that profiles your site with
[PWMetrics][pwmetrics] (Lighthouse, Headless Chrome) and publishes the results
as [AWS CloudWatch][cloudwatch] metrics.

With the results in CloudWatch, you can monitor performance over time and create
[alarms][alarms] that let you know when your site’s performance degrades.

## Why?

[Performance matters.][performance]

## How?

Create the Lambda function, then create and assign an IAM role to the function.
We use [ClaudiaJS][claudia] to automate this step:

```
claudia create \
  --region us-east-1 --handler index.handler \
  --memory 1024 --timeout 120 \
  --use-s3-bucket my-bucket \
  --policies ./conf/iam-policies.json
```

Make sure the IAM role associated with your Lambda function has the permissions
it needs to publish metrics to CloudWatch. (Claudia takes care of this via the
`--policies` argument.)

Now you are ready to invoke your Lambda function and, ideally, schedule it to
run regularly. We run ours hourly using [CloudWatch Scheduled Events][scheduled].

## Event payload

You must provide an event payload to the Lambda function containing, at minimum,
the URL to test, e.g.:

```
{
  "url": "https://www.example.com/page.html"
}
```

- `url` (`String`, required): The URL to test.

- `options` (`Object`): PWMetrics options. See their [docs][pwmetrics] for
details on supported options and flags. Useful to provide Lighthouse options or
[Chrome flags][flags] for your test.

- `dimensions` (`Object`): An object of key-value pairs that should be added as
[dimensions][dimensions] to each CloudWatch metric.

## CloudWatch metrics

The following CloudWatch metrics (in seconds) are published for each test run.
See the [PWMetrics docs][pwmetrics] for an explanation of methodology.

- `FirstContentfulPaint`
- `FirstMeaningfulPaint`
- `PerceptualSpeedIndex`
- `FirstVisualChange`
- `VisuallyComplete85`
- `VisuallyComplete100`
- `FirstInteractive`
- `ConsistentlyInteractive`

## Testing locally

Because PWMetrics uses Lighthouse, you can test this script on your local
environment and Lighthouse will use your local copy of Chrome. You only need
to simulate the Lambda event. The provided `test.js` file does just that.

## Tips and tricks

1. The default Lambda timeout and memory limits are far too low for PWMetrics /
Headless Chrome; 120 seconds and 1024 MB usually get the job done, but you may
need to adjust them further depending on your use case (especially if you want
to increase the number of runs made by PWMetrics).

2. A Chrome binary is included in this projects’s dependencies, which makes the
resulting package too big to upload directly to Lambda. You will need to
side-load your function via S3. Most Lambda frameworks support this; in our
[example Claudia command](#how), the `--use-s3-bucket` flag accomplishes this.

3. If you use CloudWatch Scheduled Events, use the “Constant” input type to
provide your Lambda event payload.

4. The Time to Consistently Interactive measurement will fail if network traffic
continues after page load. Ad network calls and analytics can therefore
interfere with obtaining this measurement. You can block the URLs of these
services using the `blockedUrlPatterns` Lighthouse flag, but first consider the
value of measuring the performance of the user’s actual experience.


[lambda]: https://aws.amazon.com/lambda/
[pwmetrics]: https://github.com/paulirish/pwmetrics
[cloudwatch]: https://aws.amazon.com/cloudwatch/
[alarms]: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html
[performance]:  https://medium.com/dev-channel/a-pinterest-progressive-web-app-performance-case-study-3bd6ed2e6154
[claudia]: https://claudiajs.com
[scheduled]: http://docs.aws.amazon.com/lambda/latest/dg/with-scheduled-events.html
[flags]: https://peter.sh/experiments/chromium-command-line-switches/
[dimensions]: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Dimension
