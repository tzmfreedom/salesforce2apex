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

module.exports = FormulaToApex
