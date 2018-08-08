const {Command, flags} = require('@oclif/command')
const convert = require('./workflow2apex')

class Salesforce2ApexCommand extends Command {
  async run() {
    const {flags} = this.parse(Salesforce2ApexCommand)
    const objectName = flags.object
    const filePath = flags.file
    const type = flags.type || 'workflow'

    convert(objectName, filePath)
  }
}

Salesforce2ApexCommand.description = `Describe the command here
...
Extra documentation goes here
`

Salesforce2ApexCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  object: flags.string({char: 'o', description: 'object name'}),
  file: flags.string({char: 'f', description: 'parse metadata filepath'}),
  type: flags.string({char: 't', description: 'parse type (workflow or flow)'}),
}

module.exports = Salesforce2ApexCommand
