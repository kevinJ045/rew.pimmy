const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Custom arguments
const customArgs = ['node', 'some.js', 'skkss', 'ssks'];

const argv = yargs(hideBin(customArgs))
  .scriptName('pimmy')
  .argv;

console.log(argv);
