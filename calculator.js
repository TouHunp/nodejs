function add(num1, num2) {
  return num1 + num2;
}

function subtract(num1, num2) {
  return num1 - num2;
}

//module.exports.function名 = function名 *module可以省略
exports.add = add;
exports.subtract = subtract;
//以下為精簡寫法 *add = add 同名可省略成 add
module.exports = {
  add,
  subtract,
};
