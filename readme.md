# Perf Cop 🚓

**Perf Cop** is an [AWS Lambda][lambda] function that watches your site with
[PWMetrics][pwmetrics] (Lighthouse, Headless Chrome) and publishes the results
as [AWS CloudWatch][cloudwatch] metrics.

With the results in CloudWatch, you can monitor performance over time and create
[alarms][alarms] that let you know when your site’s performance degrades.

## Why?

[Performance matters][performance].

## How?

1. Create the Lambda function, then create and assign an IAM role to the
function. We use [ClaudiaJS][claudia] to automate this step:

```
claudia create \
  --region us-east-1 --handler index.handler \
  --memory 1024 --timeout 120 \
  --use-s3-bucket my-bucket \
  --policies ./conf/iam-policies.json
```

Note that the default Lambda timeout and memory limits are far too low for
PWMetrics / Headless Chrome; 30 seconds and 768 MB are a good start, but they
may need to be adjusted depending on your use case (especially if you want to
increase the number of runs made by PWMetrics).

A Chrome binary is included in this projects’s dependencies, which makes the
resulting package too big to upload directly to Lambda. You will need to
side-load your function via S3. Most frameworks support this (above, we use the
`--use-s3-bucket` flag with Claudia).

2. Next, make sure the IAM role associated with your Lambda function has the
permissions it needs to publish metrics to CloudWatch. If you are using Claudia,
then this is taken care of via the `--policies` argument.

3. Now you are ready to invoke your Lambda function and, ideally, schedule it to
run regularly. We do this with [CloudWatch Scheduled Events][scheduled].

You must provide an event payload to the Lambda function containing, at minimum,
the URL to test. You can optionally pass an options object, which will be passed
directly to PWMetrics (see their [docs][pwmetrics] for details). If you use
CloudWatch Scheduled Events, use the “Constant” input type and provide your
payload.

```
{
  "url": "https://www.example.com",
  "options": { /* PWMetrics options */ }
}
```

[lambda]: https://aws.amazon.com/lambda/
[pwmetrics]: https://github.com/paulirish/pwmetrics
[cloudwatch]: https://aws.amazon.com/cloudwatch/
[alarms]: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html
[performance]:  https://medium.com/dev-channel/a-pinterest-progressive-web-app-performance-case-study-3bd6ed2e6154
[claudia]: https://claudiajs.com
[scheduled]: http://docs.aws.amazon.com/lambda/latest/dg/with-scheduled-events.html
