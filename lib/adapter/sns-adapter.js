const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')

module.exports = exports = class SNSAdapter {
  constructor(options = {}) {
    let credentials = null

    if (options.awsAccessKey && options.awsSecretKey) {
      credentials = { accessKeyId: options.awsAccessKey, secretAccessKey: options.awsSecretKey }
    }

    this.#snsClient = options.snsClient || new SNSClient({ region: options.region || 'us-east-1', credentials })
  }

  #snsClient

  async publish(topicArn, message, options) {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      ...options
    })

    return await this.#snsClient.send(command)
  }
}
