const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const SNSAdapter = require('../lib/adapter/sns-adapter')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

describe('SNSAdapter', () => {
  let snsClient
  let publishStub
  let snsAdapter

  beforeEach(() => {
    snsClient = new SNSClient()
    publishStub = Sinon.stub(snsClient, 'send')
    snsAdapter = new SNSAdapter({ snsClient })
  })

  afterEach(() => {
    publishStub.restore()
  })

  it('creates a new SNSAdapter if not provided as an option', () => {
    let newSNSAdapter = new SNSAdapter()
    expect(newSNSAdapter).to.be.an.instanceof(SNSAdapter)

    newSNSAdapter = new SNSAdapter({ region: 'ap-southeast-1' })
    expect(newSNSAdapter).to.be.an.instanceof(SNSAdapter)
  })

  it('creates a new SNSAdapter with custom AWS access and secret keys', () => {
    const customSNSAdapter = new SNSAdapter({
      awsAccessKey: 'custom_access_key',
      awsSecretKey: 'custom_secret_key'
    })

    expect(customSNSAdapter).to.exist()
    expect(customSNSAdapter).to.be.an.instanceof(SNSAdapter)
  })

  it('creates a new SNSAdapter and ignores AWS access and secret keys', () => {
    const customAdapter = new SNSAdapter({
      awsAccessKey: 'custom_access_key'
    })

    expect(customAdapter).to.be.an.instanceof(SNSAdapter)
  })

  it('publishes a message with additional options', async () => {
    const topicArn = 'arn:aws:sns:us-east-1:123456789012:MyTopic'
    const message = 'Hello, world!'
    const options = { Subject: 'Test Subject' }

    publishStub.resolves('publish result')

    const result = await snsAdapter.publish(topicArn, message, options)

    expect(result).to.equal('publish result')
    Sinon.assert.calledOnceWithExactly(publishStub, Sinon.match.instanceOf(PublishCommand))
    Sinon.assert.calledWithMatch(
      publishStub,
      Sinon.match.has('input', { TopicArn: topicArn, Message: message, ...options })
    )
  })

  it('throws an error if topicArn or message is not provided', async () => {
    const topicArn = 'arn:aws:sns:us-east-1:123456789012:MyTopic'
    const message = 'Hello, world!'

    await expect(snsAdapter.publish(null, message)).to.reject(Error, 'Topic ARN and message must be provided')
    await expect(snsAdapter.publish(topicArn, null)).to.reject(Error, 'Topic ARN and message must be provided')
  })

  it('handles errors when publishing a message', async () => {
    const topicArn = 'arn:aws:sns:us-east-1:123456789012:MyTopic'
    const message = 'Hello, world!'
    const options = { Subject: 'Test Subject' }

    const error = new Error('publish error')
    publishStub.rejects(error)

    const consoleErrorStub = Sinon.stub(console, 'error') // keep test output clean

    await expect(snsAdapter.publish(topicArn, message, options)).to.reject(Error, 'publish error')
    Sinon.assert.calledOnceWithExactly(publishStub, Sinon.match.instanceOf(PublishCommand))

    consoleErrorStub.restore()
  })

  it('creates a new SNSAdapter with a custom endpoint', async () => {
    const endpoint = 'http://localhost:4575' // LocalStack SNS endpoint for local testing
    const customSNSAdapter = new SNSAdapter({ endpoint })

    expect(customSNSAdapter).to.exist()
    expect(customSNSAdapter).to.be.an.instanceof(SNSAdapter)

    // Check that the SNSClient was created with the correct endpoint
    const client = customSNSAdapter.getSNSClient
    const actualEndpoint = await client.config.endpoint()

    expect(actualEndpoint.hostname).to.equal('localhost')
    expect(actualEndpoint.port).to.equal(4575)
  })
})
