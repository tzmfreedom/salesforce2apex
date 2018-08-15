class FormulaVisitor {
  constructor(runtimeFunctions) {
    this.code = []
    this.runtimeFunctions = runtimeFunctions
  }

  run(node) {
    this.clear()
    this.visit(node)
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

  visitReference(node) {
    return node.path.join('.')
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
    return this.runtimeFunctions[node.name.toUpperCase()](node, this)
  }

  clear() {
    this.code = []
  }
}

module.exports = FormulaVisitor
