# hapi-sns

![workflow](https://github.com/afgallo/hapi-sns/actions/workflows/main.yml/badge.svg)
[![codecov](https://codecov.io/gh/afgallo/hapi-sns/branch/main/graph/badge.svg?token=OGN40ZLIFZ)](https://codecov.io/gh/afgallo/hapi-sns)

This Hapi plugin simplifies interaction with Amazon Simple Notification Service (SNS) by providing a convenient way to use the AWS SDK for JavaScript (v3) with Hapi.js applications.

## Installation

```bash
npm i hapi-sns
```

## Usage

First, register the plugin with your Hapi server:

```javascript
const Hapi = require('@hapi/hapi')
const SNSPlugin = require('hapi-sns')

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  })

  await server.register({
    plugin: SNSPlugin,
    options: {
      region: 'us-east-1' // Replace with your desired AWS region
    }
  })

  // Add routes, start server, etc.
}

init()
```

The plugin will create an instance of `SNSAdapter` using the provided options and decorate the Hapi server toolkit with the sns property.

## Configuration

You can pass the following options when registering the plugin:

`region` (required) - The AWS region for your SNS resources (e.g., 'us-east-1'). Defaults to `us-east-1`.

`snsClient` (optional) - An instance of the AWS SNS client. Defaults to the `SNSClient` from AWS SDK.

`awsAccessKey` (optional) - Your AWS access key id.

`awsSecretKey` (optional) - Your AWS secret key.

Example:

```javascript
await server.register({
  plugin: SNSPlugin,
  options: {
    region: 'us-east-1',
    snsClient: customSNSClient,
    awsAccessKey: 'your_access_key',
    awsSecretKey: 'your_secret_key'
  }
})
```

## API

The plugin exposes the following method:

`publish(topicArn, message, options)`

Sends a message to the specified SNS queue.

`topicArn` (required) - The Amazon Resource Name (ARN) of the target SNS topic.

`message` (required) - The message to send.

`options` (optional) - An object containing additional options for the `PublishCommand`.

Returns a Promise that resolves with the `PublishCommand` response.

## Example

Here's an example of how to use the plugin in your Hapi routes:

```javascript
server.route({
  method: 'POST',
  path: '/publish',
  handler: async (request, h) => {
    const topicArn = 'arn:aws:sns:us-east-1:123456789012:MyTopic';
    const message = 'Hello, world!';
    const options = { Subject: 'Test Subject' };

    try {
      const response = await h.sns.publish(topicArn, message, options);
      return h.response(response).code(200);
    } catch (error) {
      return h.response(error).code(500);
    }
  },
});
```
