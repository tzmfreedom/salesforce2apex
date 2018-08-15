const FormulaVisitor = require('./formula-visitor')
const RuntimeFunctions = require('./runtime-functions')

module.exports = new FormulaVisitor(RuntimeFunctions)
