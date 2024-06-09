#!/usr/bin/env rew
yargs = require 'yargs/yargs'
{ hideBin } = require 'yargs/helpers'
path = require 'node:path'
conf = imp 'conf'

f = yargs(hideBin ['rew', ...process.argv])
  .scriptName 'pimmy'
  .command 'sync',
    'manage repos',
    (yargs) -> 
      yargs
        .option 'ignore',
          alias: 'i',
          describe: 'Ignore Repos',
          type: 'string'
    (argv) -> 
      # print conf.root
      print conf.loadYaml pjoin conf.root, '../repos.yaml'
  .help().argv