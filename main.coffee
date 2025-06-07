package pimmy;
import "#std!";
import "#std.yaml";
using public namespace rew::ns;

import "./features/loader/main.coffee";
import "./features/logger/main.coffee";
import "./features/utils/main.coffee";
import "./features/init/main.coffee";
import "./features/builder/main.coffee";
import "./features/cache/main.coffee";
import "./features/repo/main.coffee";
import "./features/git/main.coffee";
import "./features/project/main.coffee";
import "./features/cli/main.coffee";

# type
using pimmy::cli::option 'app', type: 'string', alias: 'A'
using pimmy::cli::option 'repo', type: 'string', alias: 'R'
using pimmy::cli::option 'cached', type: 'string', alias: 'C'
using pimmy::cli::option 'new', type: 'string', alias: 'N'
# action
using pimmy::cli::option 'sync', type: 'boolean', alias: 'S'
using pimmy::cli::option 'cache', type: 'boolean', alias: 'c'
using pimmy::cli::option 'remove', type: 'boolean', alias: 'r'
using pimmy::cli::option 'add', type: 'boolean', alias: 'a'
using pimmy::cli::option 'list', type: 'boolean', alias: 'l'
using pimmy::cli::option 'build', type: 'boolean', alias: 'b'
using pimmy::cli::option 'git', type: 'boolean', alias: 'g'
using pimmy::cli::option 'types', type: 'boolean', alias: 't'
using pimmy::cli::option 'ignore', type: 'boolean', alias: 'i'
# general
using pimmy::cli::option 'safe', type: 'boolean', alias: 's'
# misc
using pimmy::cli::option 'verbose', type: 'boolean', alias: 'v'
using pimmy::cli::option 'help', type: 'boolean', alias: 'h'
using pimmy::cli::parse rew::process::args;

pimmy::logger::LOG = cli_options.verbose;
pimmy::init::start();
pimmy::repo::init();

export function main()
  if cli_options.new
    return pimmy::project::new cli_options

  # when building, do not resolve the app elsewhere unless cache is enabled
  if cli_options.build and typeof cli_options.app == 'string'
    if cli_options.cache
      cli_options.app = await pimmy::cache::resolve cli_options.app
    pimmy::builder::build cli_options.app, cli_options.safe
    return

  if typeof cli_options.app == 'string'
    cli_options.app = await pimmy::cache::resolve cli_options.app
    if !cli_options.app then return    

  if cli_options.sync
    if cli_options.repo
      pimmy::repo::sync_all cli_options.repo
    else if cli_options.app
      pimmy::cache::install cli_options.app, true
  else if cli_options.add
    if cli_options.repo
      pimmy::repo::sync_all cli_options.repo
    else if cli_options.app
      pimmy::cache::install cli_options.app




