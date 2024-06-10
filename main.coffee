#!/usr/bin/env rew
yargs = require 'yargs/yargs'
{ hideBin } = require 'yargs/helpers'
path = require 'node:path'
conf = imp 'conf'
rune = imp 'rune'
loading =  require 'loading-cli'

db = rune.db 'main'
repos = db.collection 'repos'
packagesCol = db.collection 'packages'

rurl = (url) -> if url.startsWith '//' then "https://#{url}" else url

getcmd = (cmd) -> try 
    json exec("#{process.__execFile} #{cmd} --json", {output: false}).toString().trim()
  catch error
    {}

color = (code, text) -> "\x1b[#{code}m#{text}\x1b[0m"

findPackage = (name) ->
  pkg = getPkg name
  unless pkg
    return

  app = yaml pkg['app.yaml']
  pkgjson = json pkg['package.json']
  hasReadme = pkg['README.md'] isnt '404: Not Found'
  print color(1, 'Package '), color('1;35', app?.manifest?.package || app.package) + '@' + color('1;32', pkgjson.version), '\n'
  if pkgjson.description then print color(1, 'Description\n\n'), color(34, pkgjson.description)
  print color(1, '\nTags\n\n'), color('1;34', pkgjson.keywords?.map((i) -> '#' + i).join(' ') || 'none')

  if hasReadme then print color('33', '\n\n[README.md]')

searchPackages = (term) ->
  matches = packagesCol.list().filter (pkg) ->
    pkg.name.includes(term) or
    (pkg['package.json'] and json(pkg['package.json']).keywords?.some (keyword) -> keyword.includes(term))

  if matches.length > 0
    print color(36, "Matching Packages:\n")
    print matches.map((i) -> "- #{color(33, i.repo)}/#{color(32, i.name)}").join('\n')
  else
    print color(33, "No packages found matching:"), color(34, term)

openReadme = (name) ->
  pkg = getPkg name
  unless pkg
    return

  readmeContent = pkg['README.md']
  unless readmeContent
    print color(31, "README.md not found for package #{name}")
    return

  fname = "/tmp/readme-pimmy-#{pkg.name}-#{genID()}.md"

  write fname, readmeContent
  exec "less #{fname}"
  rm fname

getPkg = (name) ->
  repo = if name.match '/' then name.split('/')[0] else null
  if name.match '/' then name = name.split('/')[1]
  pkg = packagesCol.find(if repo then { name, repo } else  { name })
  unless pkg
    print color(31, "Package #{name} not found")
    return
  pkg

installPackage = (names, update) ->
  for name in names
    pkg = getPkg name
    unless pkg
      return
      
    p = spawn process.__execFile, ["install", pkg.url, if update then "-yu" else ""], stdio: 'inherit'
    await new Promise (r) ->
      p.on 'exit', r

removePackage = (names) ->
  for name in names
    p = spawn process.__execFile, ["uninstall", name, "-a"], stdio: 'inherit'
    await new Promise (r) ->
      p.on 'exit', r

syncRepos = (ignore = '') -> 
  repos = getcmd 'repo get'
  load = loading("Updating Repos").start()
  for repo, url of repos
    if ignore.includes(repo) then continue
    load.text = 'Get repo info ' + repo
    repoInfo = try getcmd "repo view #{repo}" 
    catch error 
        {}
    packages = repoInfo.packages
    for name, url of packages

      match = url.match /^github:([^\/]+)\/(.+)$/
      unless match
        print color(31, "Invalid URL format:"), color(34, url)
        continue
      [, owner, repoName] = match

      pkgData = { name, repo, url }

      load.text = 'Get package info ' + name

      filesToFetch = ['app.yaml', 'package.json', 'README.md']
      for file in filesToFetch
        fileUrl = "https://raw.githubusercontent.com/#{owner}/#{repoName}/main/#{file}"

        content = await curl(fileUrl, a: true, text: true)

        if content
          pkgData[file] = content

        if file == 'app.yaml'
          app = yaml content
          if app?.assets?.icon
            filesToFetch.push app.assets.icon

      if packagesCol.find({ name })
        packagesCol.update({ name }, pkgData)
      else
        packagesCol.insert pkgData
  load.stop()

filterOut = (array) -> if args.q then array.filter((i) -> i.match(args.q)) else array

listAllPackages = () -> 
  packages = filterOut packagesCol.list().map((pkg) -> " - #{color(33, pkg.repo)}/#{color(32, pkg.name)}#{if exists pjoin(conf.root, '../', pkg.name) then color(34, '*') else ''}")
  if packages.length > 0
    print color(36, "Available Packages:\n")
    print packages.join('\n')
  else
    print color(33, "No packages found")

listAllRepos = () ->
  repos = getcmd 'repo get'
  repoEntries = filterOut Object.entries(repos).map((i) -> "#{color(33, i[0])}: #{color(32, i[1])}")
  if repoEntries.length > 0
    print color(36, "Available Repositories:\n")
    print repoEntries.join('\n')
  else
    print color(33, "No repositories found")

addRepo = (repo, url) ->
  getcmd 'repo add ' + repo + ' ' + url

removeRepo = (repo) ->
  getcmd 'repo delete ' + repo 

listInstalled = () ->
  folders = ls pjoin(conf.root, '../')
  installedPackages = []
  if folders.length > 0
    for folder in folders
      if args.q and !folder.includes args.q then continue
      appPath = pjoin(conf.root, '../', folder, 'app')
      if exists appPath
        installedPackages.push(path.basename path.dirname appPath)

    if installedPackages.length > 0
      print color(36, "Installed Packages:\n")
      print installedPackages.map((pkg) -> "- #{color(32, pkg)}").join('\n')
    else
      print color(33, "No installed packages found matching:"), color(34, args.q)
  else
    print color(33, "No installed packages found")

args = yargs(hideBin(['rew', ...process.argv]))
  .scriptName 'pimmy'
  .option 'S', {
    alias: 'sync',
    describe: 'Synchronize repositories or install packages. Use with -R for repos or -a for packages.',
    type: 'boolean'
  }
  .option 'R', {
    alias: 'repo',
    describe: 'Manage repositories. Combine with -a to add a repo, -r to remove a repo, or -L to list all repos.',
    type: 'boolean'
  }
  .option 'q', {
    alias: 'query',
    describe: 'Search for packages by keyword or name. Provide a search term. Use with -L to filter out results from lists. User with -R to filter repos',
    type: 'string'
  }
  .option 'L', {
    alias: 'list',
    describe: 'List all packages or repositories. Use without -R to list packages or with -R to list repositories.',
    type: 'boolean'
  }
  .option 'l', {
    alias: 'installed',
    describe: 'Use with -L to list installed',
    type: 'boolean'
  }
  .option 'i', {
    alias: 'ignore',
    describe: 'Ignore specified repositories during synchronization. Provide a comma-separated list of repo names.',
    type: 'string'
  }
  .option 'a', {
    alias: 'add',
    describe: 'Add a repository or install a package. Use with -R to add a repository, or without -R to install a package.',
    type: 'string'
  }
  .option 'r', {
    alias: 'remove',
    describe: 'Remove a repository or package. Use with -R to remove a repository, or without -R to remove a package.',
    type: 'string'
  }
  .option 'p', {
    alias: 'package',
    describe: 'Display detailed information about a specific package. Provide the package name.',
    type: 'string'
  }
  .option 'm', {
    alias: 'readme',
    describe: 'Show the README.md file of a specific package. Provide the package name.',
    type: 'string'
  }
  .example('$0 -SR', 'Synchronize all repositories.')
  .example('$0 -a some.package', 'Install a specific package.')
  .example('$0 -L', 'Lists all packages.')
  .example('$0 -Li', 'Lists installed packages.')
  .example('$0 -Sa some.package', 'Update a specific package.')
  .example('$0 -Ra my-repo "https://example.com/path/to/package.yaml"', 'Add a new repository.')
  .example('$0 -q "keyword"', 'Search for packages containing "keyword".')
  .example('$0 -Rq "keyword"', 'Search for repos containing "keyword".')
  .example('$0 -r some.package', 'Remove a specific package.')
  .help('h')
  .alias('h', 'help')
  .argv


init = () -> 
  if args.S
    if args.R
      return syncRepos args.i
    else if args.a
      return installPackage [args.a, ...args._], true
    else
      print color 31, 'Unsure what to sync'

  if args.R
    if args.a
      return addRepo(args.a, args._[0])
    else if args.r
      return removeRepo(args.r)
    else if args.L or args.q
      return listAllRepos()
    
  else 
    if args.a
      return installPackage [args.a, ...args._]
    else if args.r
      return removePackage [args.r, ...args._]

  if args.L and not args.R
    if args.l
      return listInstalled()  
    else
      return listAllPackages()
  else 
    if args.q
      return searchPackages(args.q)

  if args.p
    return findPackage(args.p)

  if args.m
    return openReadme(args.m)

init()