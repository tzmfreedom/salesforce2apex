module.exports = {
  ABS: (node, visitor) => {
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  ADDMONTHS: (node, visitor) => {
    let date = node.arguments[0]
    let num = node.arguments[0]
    return `${visitor.visit(date)}.addMonths(${this.visit(num)})`
  },
  AND: (node, visitor) => {
    return node.arguments.map((argument) => {
      return visitor.visit(argument)
    }).join(' && ')
  },
  BEGINS: (node, visitor) => {
    const str = node.arguments[0]
    const prefix = node.arguments[1]
    return `${visitor.visit(str)}.startsWith(${visitor.visit(prefix)})`
  },
  BLANKVALUE: (node, visitor) => {
    const expression = visitor.visit(node.arguments[0])
    const alternative = visitor.visit(node.arguments[1])
    const variableName = `tmp${visitor.code.length + 1}`
    visitor.code.push(
      `
        String ${variableName};
        if (String.isBlank(${expression})) {
          ${variableName} = ${alternative}
        } else {
          ${variableName} = ${expression}
        }
        `
    )
    return variableName

  },
  BR: (node, visitor) => {
    return "\n"
  },
  CASE: (node, visitor) => {
  },
  CASESAFEID: (node, visitor) => {
  },
  CEILING: (node, visitor) => {
    return `Math.ceil(${visitor.visit(node.arguments[0])}`
  },
  CONTAINS: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.contains(${visitor.visit(node.arguments[1])}`
  },
  CURRENCYRATE: (node, visitor) => {
  },
  DATE: (node, visitor) => {
  },
  DATEVALUE: (node, visitor) => {
  },
  DATETIMEVALUE: (node, visitor) => {
  },
  DAY: (node, visitor) => {
  },
  DISTANCE: (node, visitor) => {
  },
  EXP: (node, visitor) => {
  },
  FIND: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.indexOf(${visitor.visit(node.arguments[1])}`
  },
  FLOOR: (node, visitor) => {
    return `Math.floor(${visitor.visit(node.arguments[0])}`
  },
  GEOLOCATION: (node, visitor) => {
  },
  GETRECORDIDS: (node, visitor) => {
  },
  GETSESSIONID: (node, visitor) => {
    return 'UserInfo.getSessionId()'
  },
  HOUR: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.hour()`
  },
  HTMLENCODE: (node, visitor) => {
  },
  HYPERLINK: (node, visitor) => {
    return visitor.visit(node.arguments[0])
  },
  IF: (node, visitor) => {
    let condition, ifExpression, elseExpression
    [condition, ifExpression, elseExpression] = node.arguments
    const conditionCode = visitor.visit(condition)
    const ifCode = visitor.visit(ifExpression)
    const elseCode = visitor.visit(elseExpression)
    const variableName = `tmp${visitor.code.length + 1}`
    visitor.code.push(
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
  },
  IMAGE: (node, visitor) => {
  },
  INCLUDE: (node, visitor) => {
  },
  INCLUDES: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.split(';').contains(${visitor.visit(node.arguments[1])})`
  },
  ISBLANK: (node, visitor) => {
    return `String.isBlank(${visitor.visit(node.arguments[0])})`
  },
  ISCHANGED: (node, visitor) => {
    const variableName = visitor.visit(node.arguments[0])
    return `oldRecord.${variableName} != newRecord.${variableName}`
  },
  ISCLONE: (node, visitor) => {
  },
  ISNEW: (node, visitor) => {
    return `Trigger.isInsert`
  },
  ISNULL: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])} != null`
  },
  ISNUMBER: (node, visitor) => {
    return `double.valueOf(${visitor.visit(node.arguments[0])})`
  },
  ISPICKVAL: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])} == ${visitor.visit(node.arguments[1])}`
  },
  JSENCODE: (node, visitor) => {
  },
  JSINHTMLENCODE: (node, visitor) => {
  },
  JUNCTIONIDLIST: (node, visitor) => {
  },
  LEFT: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.left(${visitor.visit(node.arguments[1])})`
  },
  LEN: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.length()`
  },
  LINKTO: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}`
  },
  LN: (node, visitor) => {
  },
  LOG: (node, visitor) => {
  },
  LOWER: (node, visitor) => {
  },
  LPAD: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.leftPad(${visitor.visit(node.arguments[1])})`
  },
  MAX: (node, visitor) => {
  },
  MCEILING: (node, visitor) => {
  },
  MFLOOR: (node, visitor) => {
  },
  MID: (node, visitor) => {
  },
  MILLISECOND: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.millisecond()`
  },
  MIN: (node, visitor) => {
  },
  MINUTE: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.minute()`
  },
  MOD: (node, visitor) => {
  },
  MONTH: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.month()`
  },
  NOT: (node, visitor) => {
    return `!${visitor.visit(node.arguments[0])}`
  },
  NOW: (node, visitor) => {
    return 'DateTime.now()'
  },
  NULLVALUE: (node, visitor) => {
    return 'null'
  },
  OR: (node, visitor) => {
    return node.arguments.map((argument) => {
      return visitor.visit(argument)
    }).join(' || ')
  },
  PARENTGROUPVAL: (node, visitor) => {
  },
  PREVGROUPVAL: (node, visitor) => {
  },
  YEAR: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.year()`
  },
  DAY: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.day()`
  },
  SECOND: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.second()`
  },
}
