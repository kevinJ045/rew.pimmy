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
using pimmy::cli::option 'app', type: 'string', alias: 'A', description: 'Use app mode'
using pimmy::cli::option 'repo', type: 'string', alias: 'R', description: 'Use repo mode'
using pimmy::cli::option 'cached', type: 'string', alias: 'C', description: 'Use cached mode'
using pimmy::cli::option 'new', type: 'string', alias: 'N', description: 'New app'
# action
using pimmy::cli::option 'sync', type: 'boolean', alias: 'S', description: 'Synchronize selected mode'
using pimmy::cli::option 'query', type: 'boolean', alias: 'Q', description: 'Query'
using pimmy::cli::option 'cache', type: 'boolean', alias: 'c', description: 'Use cache'
using pimmy::cli::option 'remove', type: 'boolean', alias: 'r', description: 'Remove selected mode'
using pimmy::cli::option 'add', type: 'boolean', alias: 'a', description: 'Add in selected mode'
using pimmy::cli::option 'list', type: 'boolean', alias: 'l', description: 'List selected mode'
using pimmy::cli::option 'build', type: 'boolean', alias: 'b', description: 'Build selected app'
using pimmy::cli::option 'git', type: 'boolean', alias: 'g', description: 'Git mode'
using pimmy::cli::option 'types', type: 'boolean', alias: 't', description: 'Types mode'
using pimmy::cli::option 'ignore', type: 'boolean', alias: 'i', description: 'Ignore interactives'
using pimmy::cli::option 'readme', type: 'boolean', alias: 'm', description: 'Open readme'
# general
using pimmy::cli::option 'safe', type: 'boolean', alias: 's', description: 'Enable Safe mode'
# misc
using pimmy::cli::option 'verbose', type: 'boolean', alias: 'v'
using pimmy::cli::option 'version', type: 'boolean'
using pimmy::cli::option 'help', type: 'boolean', alias: 'h'
# examples
using pimmy::cli::example "pimmy --version", "Print version"
using pimmy::cli::example "pimmy --help", "Show help information"
using pimmy::cli::example "pimmy --new myapp", "Create a new app called 'myapp'"
using pimmy::cli::example "pimmy -Ngit myapp", "Create a new app with git, types and without inputs"
using pimmy::cli::example "pimmy --repo rewpkgs --list", "List all packages in repo 'rewpkgs'"
using pimmy::cli::example "pimmy -Rl rewpkgs", "Alias to list repo packages"
using pimmy::cli::example "pimmy --repo rewpkgs --add //url", "Add a package to a repo"
using pimmy::cli::example "pimmy -Ra rewpkgs //url", "Alias to add to repo"
using pimmy::cli::example "pimmy --repo rewpkgs --remove", "Remove a package from repo"
using pimmy::cli::example "pimmy -Rr rewpkgs", "Alias to remove from repo"
using pimmy::cli::example "pimmy --repo rewpkgs --sync", "Sync packages from repo"
using pimmy::cli::example "pimmy -RS", "Sync all repos"
using pimmy::cli::example "pimmy -RS rewpkgs", "Alias to sync from repo"
using pimmy::cli::example "pimmy --cached --list", "List all cached apps"
using pimmy::cli::example "pimmy -Cl", "Alias to list all cached"
using pimmy::cli::example "pimmy --cached BlaBlaBla --remove", "Remove cache entry"
using pimmy::cli::example "pimmy -Cr BlaBlaBla", "Alias to remove cached app"
using pimmy::cli::example "pimmy --cached BlaBlaBla --remove --ignore", "Remove cache entry force mode"
using pimmy::cli::example "pimmy --app myapp --build", "Build app without cache"
using pimmy::cli::example "pimmy -Ab myapp", "Alias to build app"
using pimmy::cli::example "pimmy -Am myapp", "Open app readme"
using pimmy::cli::example "pimmy --app myapp --build --safe", "Safe mode build"
using pimmy::cli::example "pimmy --app myapp --sync", "Install or sync app from remote"
using pimmy::cli::example "pimmy -AS myapp", "Alias to sync app"
using pimmy::cli::example "pimmy --app myapp --remove", "Remove installed app"
using pimmy::cli::example "pimmy -Ar myapp", "Alias to remove app"
using pimmy::cli::example "pimmy --app myapp --query", "Find app in remote repos"
using pimmy::cli::example "pimmy -AQ myapp", "Alias to query app"
using pimmy::cli::example "pimmy --app myapp --list", "List installed modules for app"
using pimmy::cli::example "pimmy -Al myapp", "Alias to list app modules"
using pimmy::cli::example "pimmy --app myapp --cache --build", "Build using cache override"
using pimmy::cli::example "pimmy --app myapp --types", "Generate types for app"
using pimmy::cli::example "pimmy --verbose --app myapp --build", "Verbose build for app"
# misc
using pimmy::cli::description "The package manager for rew"
using pimmy::cli::parse rew::process::args;

pimmy::logger::LOG = cli_options.verbose;
pimmy::init::start();
pimmy::repo::init();

export function main()

  if cli_options.help
    print_help()

  if cli_options.version
    return print module.app.config.manifest.version

  if cli_options.new
    return pimmy::project::new cli_options

  if cli_options.cached
    if cli_options.list
      pimmy::cache::list(cli_options.cached == true ? null : cli_options.cached)
    if cli_options.remove
      pimmy::cache::remove(cli_options.cached, cli_options.ignore)

  if cli_options.readme
    pimmy::repo::readme cli_options.app
    return

  if cli_options.list
    if cli_options.repo
      pimmy::repo::list cli_options.repo
    else if cli_options.app
      pimmy::cache::list_installed cli_options.app
    return
  else if cli_options.remove
    if cli_options.repo
      pimmy::repo::remove cli_options.repo
    else if cli_options.app
      pimmy::cache::remove_app cli_options.app, cli_options.ignore
    return
  else if cli_options.query
    if cli_options.app
      pimmy::repo::find_app cli_options.app
    return

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
      pimmy::repo::add cli_options.repo, ...cli_options._
    else if cli_options.app
      pimmy::cache::install cli_options.app




