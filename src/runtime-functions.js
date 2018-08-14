module.exports = {
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
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  BLANKVALUE: (node, visitor) => {
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  BR: (node, visitor) => {
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  CASE: (node, visitor) => {
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  CASESAFEID: (node, visitor) => {
    let num = node.arguments[0]
    return `Math.abs(${visitor.visit(num)})`
  },
  ABS: (node, visitor) => {
    let date = node.arguments[0]
    return `Math.abs(${visitor.visit(date)})`
  },
  YEAR: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.year()`
  },
  MONTH: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.month()`
  },
  DAY: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.day()`
  },
  HOUR: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.hour()`
  },
  MINUTE: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.minute()`
  },
  SECOND: (node, visitor) => {
    let date = node.arguments[0]
    return `${visitor.visit(date)}.second()`
  },
  GETSESSIONID: (node, visitor) => {
    return 'UserInfo.getSessionId()'
  }
}
