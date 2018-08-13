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

    const triggerTypes = result.Workflow.rules
                                        .map((rule) => rule.triggerType)
                                        .filter((x, i, self) => self.indexOf(x) === i)

    const triggerTiming = (() => {
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

class FormulaToApex {
  constructor() {
    this.code = []
  }

  visit(node) {
    let type = node.type
    const methodName = `visit${type.charAt(0).toUpperCase()}${type.slice(1)}`
    return this[methodName](node)
  }

  visitString(node) {
    return `'${node.value}'`
  }

  visitInteger(node) {
    return node.value
  }

  visitBoolean(node) {
    return node.value
  }

  visitOperator(node) {
    switch(node.operator) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '==':
      case '!=':
      case '<':
      case '<=':
      case '>':
      case '>=':
      case '&&':
      case '||':
        return `${this.visit(node.left)} ${node.operator} ${this.visit(node.right)}`
      case '&':
        return `${this.visit(node.left)} + ${this.visit(node.right)}`
      case '=':
        return `${this.visit(node.left)} == ${this.visit(node.right)}`
      case '<>':
        return `${this.visit(node.left)} != ${this.visit(node.right)}`
    }
  }

  visitFunction(node) {
    switch(node.name) {
      case 'IF':
        let condition, ifExpression, elseExpression
        [condition, ifExpression, elseExpression] = node.arguments
        const conditionCode = this.visit(condition)
        const ifCode = this.visit(ifExpression)
        const elseCode = this.visit(elseExpression)
        const variableName = `tmp${this.code.length + 1}`
        this.code.push(
        `
        String ${variableName};
        if (${conditionCode}) {
          ${variableName} = ${ifCode}
        } else {
          ${variableName} = ${elseCode}
        }
        `
        )
        return variableName
    }
  }

  clear() {
    this.code = []
  }
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

module.exports = convert
