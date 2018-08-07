const fs = require('fs')
const parseString = require('xml2js').parseString
const ejs = require('ejs')

const parse = require('salesforce-formula-parser')

const WORKFLOW_OP_MAP = {
  equals: '==',
}
const WORKFLOW_TEMPLATE_PATH = 'templates/workflow.apex.ejs'

class Workflow2ApexConverter {
  convert(objectName, fileName) {
    const xml_data = fs.readFileSync(fileName, "utf-8")

    parseString(xml_data, (err, result) => {
      // console.log(require('util').inspect(result, {colors: true, depth: 10}))

      const fieldUpdates = result.Workflow.fieldUpdates

      const triggerName = `${objectName.replace(/__c/, '')}Trigger`

      const rules = result.Workflow.rules.map((rule) => {
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

          return {
            condition: conditions.join(' AND '),
            actions,
          }
        }
      }).filter((rule) => rule )

      this.renderCode(triggerName, objectName, rules)
    })
  }

  renderCode(triggerName, objectName, rules) {
    const formulaToCode = (formula) => {
      const result = parse(formula)
      if (result.type == 'string') {
        return `'${result.value}'`
      } else if (result.type == 'integer') {
        return result.value
      } else if (result.type == 'function') {
        return result
      }
      return result
    }

    const toApexCode = (action) => {
      switch (action.operation[0]) {
        case 'Formula':
          return `record.${action.field[0]} = ${formulaToCode(action.formula[0])};`
      }
    }


    ejs.renderFile(WORKFLOW_TEMPLATE_PATH, {
      triggerName,
      objectName,
      rules,
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