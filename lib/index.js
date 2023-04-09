const SNSAdapter = require('../lib/adapter/sns-adapter')
const Package = require('../package.json')

exports.plugin = {
  pkg: Package,
  register: (server, options) => {
    const snsClient = new SNSAdapter(options)
    server.decorate('toolkit', 'sns', snsClient)
  }
}
