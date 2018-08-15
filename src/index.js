const {Command, flags} = require('@oclif/command')
const convert = require('./workflow2apex').convertFromFile

class Salesforce2ApexCommand extends Command {
  async run() {
    const {flags} = this.parse(Salesforce2ApexCommand)
    const objectName = flags.object
    const filePath = flags.file
    const type = flags.type || 'workflow'

    convert(objectName, filePath)
  }
}

Salesforce2ApexCommand.description = `Convert Salesforce WorkflowRules to ApexTrigger
`

Salesforce2ApexCommand.flags = {
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
  object: flags.string({char: 'o', description: 'object name'}),
  file: flags.string({char: 'f', description: 'parse metadata filepath'}),
  type: flags.string({char: 't', description: 'parse type (workflow or flow)'}),
}

module.exports = Salesforce2ApexCommand
