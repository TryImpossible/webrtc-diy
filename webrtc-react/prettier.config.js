/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 80, // 每行代码长度，默认80
  tabWidth: 2, // 每个tab相当于多少个空格，默认2
  useTabs: false, // 是否使用tab进行缩进，默认false
  semi: true, // 句尾是否使用分号，默认true
  singleQuote: true, // 是否使用单引号，默认false(使用双引号)
  quoteProps: 'as-needed', // 对象属性是否使用引号，有三个可选值"<as-needed|consistent|preserve>"
  jsxSingleQuote: false, // jsx中是否使用单引号，默认false(使用双引号)
  trailingComma: 'all', // 是否使用尾逗号，有三个可选值"<none|es5|all>"
  bracketSpacing: true, // 对象大括号直接是否有空格，默认true
  objectWrap: 'preserve', // 对象是否换行，有三个可选值"<preserve|collapse>"
  bracketSameLine: true, // 多行html元素的>是否另起一行，默认false
  arrowParens: 'always', // 箭头函数参数括号，有两个可选值"<always|avoid>"
  proseWrap: 'always', // 如何换行，有三个可选值"<always|never|preserve>"
  htmlWhitespaceSensitivity: 'css', // html文件空格敏感度，有三个可选值"<css|strict|ignore>"
};

export default config;
