const fs = require('fs')
const parseString = require('xml2js').parseString
const ejs = require('ejs')

const WORKFLOW_OP_MAP = {
  equals: '==',
}
const WORKFLOW_TEMPLATE_PATH = 'templates/workflow.apex.ejs'

class Workflow2ApexConverter {
  convert(objectName, fileName) {
    const xml_data = fs.readFileSync(fileName, "utf-8")

    parseString(xml_data, (err, result) => {
      // console.log(require('util').inspect(result, {colors: true, depth: 10}))

      const rules = result.Workflow.rules
      const fieldUpdates = result.Workflow.fieldUpdates

      rules.forEach((rule) => {
        if (rule.active[0] == 'false') return

        if (rule.formula) {

        } else {
          const conditions = rule.criteriaItems.map((criteriaItem) => {
            return `${criteriaItem.field[0].replace(/^(.+?)\./, 'record.')} ${WORKFLOW_OP_MAP[criteriaItem.operation]} '${criteriaItem.value}'`
          })

          const actions = rule.actions.map((action) => {
            return fieldUpdates.find((fieldUpdate) => {
              return fieldUpdate.fullName[0] == action.name[0]
            })
          })

          const triggerName = `${objectName}Trigger`
          this.renderCode(triggerName, objectName, conditions, actions)
        }
      })
    })
  }

  renderCode(triggerName, objectName, conditions, actions) {
    const formulaToCode = (formula) => {
      return formula
    }

    const toApexCode = (action) => {
      switch (action.operation[0]) {
        case 'Formula':
          return `record.${action.field[0]} = ${formulaToCode(action.formula[0])};`
      }
    }

    const condition = conditions.join(' AND ')

    ejs.renderFile(WORKFLOW_TEMPLATE_PATH, {
      triggerName,
      objectName,
      condition,
      actions,
      toApexCode
    }, {}, function (err, str) {
      if (err) {
        console.error(err)
        return
      }
      console.log(str.replace(/^\s*\n/gm, ''))
    });
  }
}

const converter = new Workflow2ApexConverter()
converter.convert('TestObject__c', 'workflows/TestObject__c.workflow')