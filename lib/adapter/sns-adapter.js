const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')

module.exports = exports = class SNSAdapter {
  #snsClient

  constructor(options = {}) {
    let credentials = null
    let endpoint = null
    options.region = options.region || 'us-east-1'

    if (options.awsAccessKey && options.awsSecretKey) {
      credentials = { accessKeyId: options.awsAccessKey, secretAccessKey: options.awsSecretKey }
    }

    if (options.endpoint) {
      endpoint = options.endpoint // Only used in local development
    }

    this.#snsClient = options.snsClient || new SNSClient({ region: options.region, credentials, endpoint })
  }

  // Getter for snsClient - mostly for unit testing
  get getSNSClient() {
    return this.#snsClient
  }

  async publish(topicArn, message, options = {}) {
    if (!topicArn || !message) {
      throw new Error('Topic ARN and message must be provided')
    }

    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      ...options
    })

    try {
      return await this.#snsClient.send(command)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to publish message:', error)
      throw error
    }
  }
}
