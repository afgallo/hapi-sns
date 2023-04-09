const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Hapi = require('@hapi/hapi')

const SNSPlugin = require('../lib/index')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

describe('SNS Plugin', () => {
  it('registers the plugin and decorates the toolkit with the SNS client', async () => {
    const server = new Hapi.Server()

    await server.register({ plugin: SNSPlugin })

    expect(server.registrations['hapi-sns']).to.exist()
  })
})
