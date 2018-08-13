const fs = require('fs')
const parseString = require('xml2js').parseString
const ejs = require('ejs')
const FormulaToApex = require('./formula2apex')

const parse = require('salesforce-formula-parser')

const WORKFLOW_OP_MAP = {
  equals: '==',
}

const WORKFLOW_NOT_OP_MAP = {
  equals: '!=',
}

const WORKFLOW_TEMPLATE_PATH = 'templates/workflow.apex.ejs'

const convertFromFile = (objectName, fileName) => {
  const xml = fs.readFileSync(fileName, "utf-8")
  convert(objectName, xml)
}

const convert = (objectName, xml) => {
  parseString(xml, { explicitArray: false }, (err, result) => {
    // console.log(require('util').inspect(result, {colors: true, depth: 10}))

    const fieldUpdates = result.Workflow.fieldUpdates

    const triggerName = `${objectName.replace(/__c/, '')}Trigger`

    const triggerTiming = (() => {
      const triggerTypes = result.Workflow.rules
        .map((rule) => rule.triggerType)
        .filter((x, i, self) => self.indexOf(x) === i)

      if (triggerTypes.includes('onAllChanges')) {
        return {
          on: 'before update, before insert',
          condition: 'Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)'
        }
      } else if (triggerTypes.includes('onCreateOrTriggeringUpdate')) {
        return {
          on: 'before update, before insert',
          condition: 'Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)'
        }
      } else if (triggerTypes.includes('onCreateOnly')) {
        return {
          on: 'before insert',
          condition: 'Trigger.isBefore && Trigger.isInsert'
        }
      }
    })()

    const rules = result.Workflow.rules.map((rule) => {
      const triggerType = rule.triggerType

      if (rule.active[0] == 'false') return

      if (rule.formula) {

      } else {
        if (!Array.isArray(rule.criteriaItems)) rule.criteriaItems = [rule.criteriaItems]
        const conditions = rule.criteriaItems.map((criteriaItem) => {
          const newField = criteriaItem.field.replace(/^(.+?)\./, 'newRecord.')
          const oldField = criteriaItem.field.replace(/^(.+?)\./, 'oldRecord.')
          const operator = WORKFLOW_OP_MAP[criteriaItem.operation]
          const not_operator = WORKFLOW_NOT_OP_MAP[criteriaItem.operation]
          const value = criteriaItem.value

          switch(triggerType) {
            case 'onAllChanges':
              return `${newField} ${operator} '${value}'`
            case 'onCreateOnly':
              return `${newField} ${operator} '${value}'`
            case 'onCreateOrTriggeringUpdate':
              return `(${oldField} ${not_operator} '${value}' && ${newField} ${operator} '${value}')`
          }
        })

        if (!rule.actions) rule.actions = []
        if (!Array.isArray(rule.actions)) rule.actions = [rule.actions]
        const actions = rule.actions.map((action) => {
          return fieldUpdates.find((fieldUpdate) => {
            return fieldUpdate.fullName == action.name
          })
        })

        if (rule.booleanFilter) {
          let filter = rule.booleanFilter
          filter = filter.replace(/AND/g, '&&')
          filter = filter.replace(/OR/g, '||')
          for (let i = 0; i < conditions.length; i++) {
            filter = filter.replace(i+1, conditions[i])
          }
          return {
            condition: filter,
            actions,
          }
        } else {
          return {
            condition: conditions.join(' && '),
            actions,
          }
        }
      }
    }).filter((rule) => rule )

    renderCode(triggerName, objectName, rules, triggerTiming)
  })
}

const renderCode = (triggerName, objectName, rules, triggerTiming) => {
  const visitor = new FormulaToApex()
  const toApexCode = (action) => {
    switch (action.operation) {
      case 'Formula':
        const node = parse(action.formula)
        const value = visitor.visit(node)
        const result = `${visitor.code.join("\n")}newRecord.${action.field} = ${value};`
        visitor.clear()
        return result
    }
  }

  ejs.renderFile(WORKFLOW_TEMPLATE_PATH, {
    triggerName,
    objectName,
    rules,
    toApexCode,
    triggerTiming
  }, {}, function (err, str) {
    if (err) {
      console.error(err)
      return
    }
    console.log(str.replace(/^\s*\n/gm, ''))
  });
}

module.exports.convert = convert
module.exports.convertFromFile = convertFromFile
