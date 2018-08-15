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
    return "'\n'"
  },
  CASE: (node, visitor) => {
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
  CASESAFEID: (node, visitor) => {
  },
  CEILING: (node, visitor) => {
    return `Math.ceil(${visitor.visit(node.arguments[0])}`
  },
  CONTAINS: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.contains(${visitor.visit(node.arguments[1])}`
  },
  CURRENCYRATE: (node, visitor) => {},
  DATE: (node, visitor) => {
    const year = visitor.visit(node.arguments[0])
    const month = visitor.visit(node.arguments[1])
    const day = visitor.visit(node.arguments[2])
    return `Date.newInstance(${year}, ${month}, ${day})`
  },
  DATEVALUE: (node, visitor) => {
    return `Date.parse(${visitor.visit(node.arguments[0])})`
  },
  DATETIMEVALUE: (node, visitor) => {
    return `DateTime.parse(${visitor.visit(node.arguments[0])})`
  },
  DAY: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.year()`
  },
  DISTANCE: (node, visitor) => {
    const firstLocation = visitor.visit(node.arguments[0])
    const secondLocation = visitor.visit(node.arguments[1])
    const unit = visitor.visit(node.arguments[2])
    return `Location.getDistance(${firstLocation}, ${secondLocation}, ${unit})`
  },
  EXP: (node, visitor) => {
    return `Math.exp(${visitor.visit(node.arguments[0])})`
  },
  FIND: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.indexOf(${visitor.visit(node.arguments[1])}`
  },
  FLOOR: (node, visitor) => {
    return `Math.floor(${visitor.visit(node.arguments[0])}`
  },
  GEOLOCATION: (node, visitor) => {
    const latitude = visitor.visit(node.arguments[0])
    const longitude = visitor.visit(node.arguments[1])
    return `Location.newInstance(${latitude}, ${longitude})`
  },
  GETRECORDIDS: (node, visitor) => {},
  GETSESSIONID: (node, visitor) => {
    return 'UserInfo.getSessionId()'
  },
  HOUR: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.hour()`
  },
  HTMLENCODE: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.escapeHtml4()`
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
  IMAGE: (node, visitor) => {},
  INCLUDE: (node, visitor) => {},
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
  ISCLONE: (node, visitor) => {},
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
    return `${visitor.visit(node.arguments[0])}.escapeEcmaScript()`
  },
  JSINHTMLENCODE: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.escapeHtml4().escapeEcmaScript()`
  },
  JUNCTIONIDLIST: (node, visitor) => {},
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
    return `Math.log(${visitor.visit(node.arguments[0])})`
  },
  LOG: (node, visitor) => {
    return `Math.log10(${visitor.visit(node.arguments[0])})`
  },
  LOWER: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.toLowerCase()`
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
    const str = visitor.visit(node.arguments[0])
    const startIndex = visitor.visit(node.arguments[1])
    const length = visitor.visit(node.arguments[2])
    return `${str}.mid(${startIndex}, ${length})`
  },
  MILLISECOND: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.millisecond()`
  },
  MIN: (node, visitor) => {
  },
  MINUTE: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.minute()`
  },
  MOD: (node, visitor) => {
    const number = visitor.visit(node.arguments[0])
    const devider = visitor.visit(node.arguments[1])
    return `${number} % ${devider}`
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
  PRIORVALUE: (node, visitor) => {
    return `oldRecord.${visitor.visit(node.arguments[0])}`
  },
  REGEX: (node, visitor) => {
    const regExp = visitor.visit(node.arguments[0])
    const input = visitor.visit(node.arguments[1])
    return `Pattern.matches(${regExp}, ${input})`
  },
  REQUIRESCRIPT: (node, visitor) => {},
  RIGHT: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.right(${visitor.visit(node.arguments[1])})`
  },
  ROUND: (node, visitor) => {
    return `Math.round(${visitor.visit(node.arguments[0])})`
  },
  RPAD: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.rightPad(${visitor.visit(node.arguments[1])})`
  },
  SECOND: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.second()`
  },
  SQRT: (node, visitor) => {
    return `Math.sqrt(${visitor.visit(node.arguments[0])})`
  },
  SUBSTITUTE: (node, visitor) => {
    const text = visitor.visit(node.arguments[0])
    const oldText = visitor.visit(node.arguments[1])
    const newText = visitor.visit(node.arguments[2])
    return `${text}.replace(${oldText}, ${newText})`
  },
  TEXT: (node, visitor) => {
    return `String.valueOf(${visitor.visit(node.arguments[0])})`
  },
  TIMENOW: (node, visitor) => {
  },
  TIMEVALUE: (node, visitor) => {
  },
  TODAY: (node, visitor) => {
    return `Date.today()`
  },
  TRIM: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.trim()`
  },
  UPPER: (node, visitor) => {
    return `${visitor.visit(node.arguments[0])}.toUpperCase()`
  },
  URLENCODE: (node, visitor) => {
    return `EncodingUtil.urlEncode(${node.arguments[0]}, 'UTF-8')`
  },
  URLFOR: (node, visitor) => {},
  VALUE: (node, visitor) => {
    return ``
  },
  VLOOKUP: (node, visitor) => {
  },
  WEEKDAY: (node, visitor) => {
  },
  YEAR: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.year()`
  },
}
