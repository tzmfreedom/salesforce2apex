const fs = require('fs')
const parseString = require('xml2js').parseString
const ejs = require('ejs')
const path = require('path')
const parse = require('salesforce-formula-parser')
const convertVisitor = require('./formula2apex')

const WORKFLOW_OP_MAP = {
  equals: '${1} == ${2}',
  notEqual: '${1} != ${2}',
  lessThan: '${1} < ${2}',
  greaterThan: '${1} > ${2}',
  lessOrEqual: '${1} <= ${2}',
  greaterOrEqual: '${1} >= ${2}',
  contains: '${1}.contains(${2})',
  notContain: '!(${1}.contains(${2}))',
  startsWith: '${1}.startWith(${2})',
  includes: "${1}.split(',').contains(${2})",
  excludes: "!(${1}.split(',').contains(${2}))",
}

const WORKFLOW_NOT_OP_MAP = {
  equals: '${1} != ${2}',
  notEqual: '${1} == ${2}',
  lessThan: '${1} >= ${2}',
  greaterThan: '${1} <= ${2}',
  lessOrEqual: '${1} > ${2}',
  greaterOrEqual: '${1} < ${2}',
  contains: '!(${1}.contains(${2}))',
  notContain: '${1}.contains(${2})',
  startsWith: '!(${1}.startWith(${2}))',
  includes: "!(${1}.split(',').contains(${2}))",
  excludes: "${1}.split(',').contains(${2})",
}

const WORKFLOW_TEMPLATE_PATH = '../templates/workflow.apex.ejs'

const convertFromFile = (objectName, fileName) => {
  const xml = fs.readFileSync(fileName, "utf-8")
  convert(objectName, xml)
}

const convert = (objectName, xml) => {
  parseString(xml, { explicitArray: false }, (err, result) => {
    const triggerName = `${objectName.replace(/__c/, '')}Trigger`
    const triggerTiming = getTriggerTiming(result.Workflow.rules)
    const rules = getRules(result.Workflow.rules, result.Workflow.fieldUpdates)

    renderCode({ triggerName, objectName, rules, triggerTiming })
  })
}

const getTriggerTiming = (rules) => {
  const triggerTypes = rules.map((rule) => rule.triggerType)
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
}

const getRules = (rules, fieldUpdates) => {
  return rules.map((rule) => {
    const triggerType = rule.triggerType

    if (rule.active[0] == 'false') return

    if (rule.formula) {
      const node = parse(rule.formula)
      const value = convertVisitor.run(node)
      const condition = `${convertVisitor.code.join("\n")}if (${value}) {`
      const actions = getActions(fieldUpdates, rule)
      return {
        condition,
        actions,
      }
    }
    if (!Array.isArray(rule.criteriaItems)) rule.criteriaItems = [rule.criteriaItems]
    const conditions = rule.criteriaItems.map((criteriaItem) => {
      const newField = criteriaItem.field.replace(/^(.+?)\./, 'newRecord.')
      const oldField = criteriaItem.field.replace(/^(.+?)\./, 'oldRecord.')
      const operator = WORKFLOW_OP_MAP[criteriaItem.operation]
      const not_operator = WORKFLOW_NOT_OP_MAP[criteriaItem.operation]
      const value = criteriaItem.value

      switch(triggerType) {
        case 'onAllChanges':
          return operator.replace('${1}', newField).replace('${2}', "'" + value + "'")
        case 'onCreateOnly':
          return operator.replace('${1}', newField).replace('${2}', "'" + value + "'")
        case 'onCreateOrTriggeringUpdate':
          const before = not_operator.replace('${1}', oldField).replace('${2}', "'" + value + "'")
          const after = operator.replace('${1}', newField).replace('${2}', "'" + value + "'")
          return `(${before} && ${after})`
      }
    })

    const actions = getActions(fieldUpdates, rule)
    if (rule.booleanFilter) {
      let filter = rule.booleanFilter
      filter = filter.replace(/AND/g, '&&')
      filter = filter.replace(/OR/g, '||')
      for (let i = 0; i < conditions.length; i++) {
        filter = filter.replace(i+1, conditions[i])
      }
      return {
        condition: `if (${filter}) {`,
        actions,
      }
    }
    return {
      condition: `if (${conditions.join(' && ')}) {`,
      actions,
    }
  })
}

const getActions = (fieldUpdates, rule) => {
  if (!rule.actions) rule.actions = []
  if (!Array.isArray(rule.actions)) rule.actions = [rule.actions]
  return rule.actions.map((action) => {
    return fieldUpdates.find((fieldUpdate) => {
      return fieldUpdate.fullName == action.name
    })
  })
}

const formula2apex = (action) => {
  switch (action.operation) {
    case 'Formula':
      const node = parse(action.formula)
      const value = convertVisitor.run(node)
      const result = `${convertVisitor.code.join("\n")}newRecord.${action.field} = ${value};`
      return result
  }
}

const renderCode = (context) => {
  ejs.renderFile(path.resolve(__dirname, WORKFLOW_TEMPLATE_PATH), Object.assign({ formula2apex }, context), {}, (err, str) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(str.replace(/^\s*\n/gm, ''))
  });
}

module.exports.convert = convert
module.exports.convertFromFile = convertFromFile
