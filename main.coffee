package pimmy;
import "#std!";
import "#std.yaml";
using pub namespace rew::ns;

import "./features/loader/main.coffee";
import "./features/logger/main.coffee";
import "./features/utils/main.coffee";
import "./features/init/main.coffee";
import "./features/builder/main.coffee";
import "./features/cli/main.coffee";

# type
using pimmy::cli::option 'app', type: 'string', alias: 'A'
using pimmy::cli::option 'repo', type: 'string', alias: 'R'
# action
using pimmy::cli::option 'sync', type: 'boolean', alias: 'S'
using pimmy::cli::option 'remove', type: 'boolean', alias: 'r'
using pimmy::cli::option 'add', type: 'boolean', alias: 'a'
using pimmy::cli::option 'build', type: 'boolean', alias: 'b'
# general
using pimmy::cli::option 'safe', type: 'boolean', alias: 's'
# misc
using pimmy::cli::option 'verbose', type: 'boolean', alias: 'v'
using pimmy::cli::option 'help', type: 'boolean', alias: 'h'
using pimmy::cli::parse rew::process::args;

pimmy::logger::LOG = cli_options.verbose;
pimmy::init::start();


if cli_options.build and typeof cli_options.app == 'string'
  pimmy::builder::build cli_options.app, cli_options.safe
    





