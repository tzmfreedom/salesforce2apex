const fs = require('fs')
const parseString = require('xml2js').parseString
const ejs = require('ejs')

const parse = require('salesforce-formula-parser')

const WORKFLOW_OP_MAP = {
  equals: '==',
}

const WORKFLOW_NOT_OP_MAP = {
  equals: '!=',
}

const WORKFLOW_TEMPLATE_PATH = 'templates/workflow.apex.ejs'

const convert = (objectName, fileName) => {
  const xml_data = fs.readFileSync(fileName, "utf-8")

  parseString(xml_data, { explicitArray: false }, (err, result) => {
    // console.log(require('util').inspect(result, {colors: true, depth: 10}))

    const fieldUpdates = result.Workflow.fieldUpdates

    const triggerName = `${objectName.replace(/__c/, '')}Trigger`

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

    renderCode(triggerName, objectName, rules)
  })
}

const renderCode = (triggerName, objectName, rules) => {
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
    switch (action.operation) {
      case 'Formula':
        return `record.${action.field} = ${formulaToCode(action.formula)};`
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

module.exports = convert
