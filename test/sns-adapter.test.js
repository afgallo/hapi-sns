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
})
