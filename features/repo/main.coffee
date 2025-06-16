package pimmy::repo;
using compiler::autoLet.disable
using compiler::autoVar
import "#std.net";
using namespace pimmy::logger;

# c = rew::channel::new ->

function _fetchFile(url)
  await rew::net::fetch url
        .then .text()
        .catch -> null

function display_app(app)
  terminal_size = rew::io::out.size()
  logger::log logger::start + logger::indentNatural(terminal_size[0] / 4 - 3), ":icon package yellow bold", "@blue(#{app.name})", logger::indentNatural((terminal_size[0] - ((terminal_size[0] / 4) + app.name.length + 4))) 

  logger::log logger::indent(1), ":icon info blue", "@blue(version)", "--", "@green(#{app.version ?? "unknown"})"

  if app.description
    logger::log logger::indent(1), ":icon info blue", "Description", "--", app.description

  if app.tags
    logger::log logger::indent(1), ":icon info blue", "Tags"
    logger::log logger::indent(3), app.tags.join(' ')
  
  if app.readme
    logger::log logger::indent(1), ":icon info blue", "README entry found"  

  logger::log logger::indent(1), ":icon info blue", "@blue(URL)", "--", "@green(#{app.url})"

  logger::log logger::end + logger::indentNatural(terminal_size[0] - 3)

function repo::find_app(app_name)
  found = repo::lookup app_name, true
  unless found.length
    logger::warm "No app found"
  logger::title ""
  for app of found
    display_app app
  logger::closeTitle()
  

function repo::list(repo_name, app_name)
  if typeis(repo_name, str)
    repos = conf::readYAML 'repo/main.yaml'
    caches = readdir path::join conf::path(), 'cache/repo-cache'
    repo = Object.keys(repos).map((item, index) => [item, index]).find((item) => item[0] == repo_name)
    unless repo then return logger::error "Repo #{repo_name} not found"
    unless caches[repo[1]] then return logger::error "Repo not cached"
    logger::title "#{repo_name} Items"
    items = JSON.parse rew::encoding::bytesToString rew::conf::readAuto "cache/repo-cache/db_#{repo[1]}.bin"
    terminal_size = rew::io::out.size()
    for app of items
      display_app(app)
    logger::closeTitle()
  else
    logger::title "Available repos"
    repos = conf::readYAML 'repo/main.yaml'
    caches = readdir path::join conf::path(), 'cache/repo-cache'

    index = 0
    max_index_len = "#{repos.length - 1}".length + 2
    max_key_len = Math.max ...Object.keys(repos).map((k) => k.length)
    max_url_len = Math.max ...Object.values(repos).map((v) => v.length)

    pad = (str, len) -> str + " ".repeat(len - str.length)

    logger::log "Index".padEnd(max_index_len), "|", "Repo".padEnd(max_key_len), "|", "URL".padEnd(max_url_len), "|", "Cached"

    for key, value in repos
      index_str = pad("#{index}", max_index_len)
      key_str = pad(key, max_key_len)
      url_str = pad(value, max_url_len)

      logger::log "@yellow(#{index_str})", "|", "@blue(#{key_str})", "|", "@green(#{url_str})", "|", if caches[index] then "@green(#{caches[index].name})" else "@red(None)"
      index++
    logger::closeTitle()

function repo::lookup(pkgname, match_only)
  results = []
  index = 0 

  # Parse names like "@repo/package"
  if pkgname.startsWith "@"
    parts = pkgname.slice(1).split('/')
    if parts.length != 2
      pimmy::logger::error "Invalid qualified package: #{pkgname}"
      return null

    [repo_name, real_name] = parts
  else
    repo_name = null
    real_name = pkgname

  while true
    path = "cache/repo-cache/db_#{index}.bin"
    try
      data = JSON.parse rew::encoding::bytesToString rew::conf::readAuto path
    catch
      break

    for pkg of data
      if repo_name and pkg.repo == repo_name and pkg.name == real_name
        return pkg
      if not repo_name and pkg.name == real_name
        results.push pkg
      else if not repo_name and match_only and pkg.name.match real_name
        results.push pkg

    index += 1

  if results.length > 0
    return if match_only then results else results[0]  
  else
    pimmy::logger::warn "Package not found: #{pkgname}"
    return null



function _resolveGithub(name, github_url)
  { baseUrl } = pimmy::utils::resolveGithubURL github_url

  pkg = {
    name: name,
    url: github_url, 
  }

  files = ['app.yaml']

  app_content = await _fetchFile baseUrl + "app.yaml"
  
  app = rew::yaml::parse app_content
  if app?.assets?.icon
    icon_path = app.assets.icon
    pkg.icon = baseUrl + icon_path
  if app?.manifest?.readme
    readme = await _fetchFile baseUrl + app?.manifest?.readme
    pkg.readme = readme
  if app?.manifest?.tags
    pkg.tags = app?.manifest?.tags ?? []
  if app?.manifest?.version
    pkg.version = app?.manifest?.version ?? "unknown"
  if app?.manifest?.description
    pkg.description = app.manifest.description

  return pkg

function _parseRepo(name, repo_url, seen = {}, result = [])
  if seen[repo_url] then return
  seen[repo_url] = true

  data = await rew::net::fetch "https:" + repo_url
           .then .text()
           .catch -> null

  if not data
    pimmy::logger::error "Failed to fetch repo: #{repo_url}"
    return

  repo = rew::yaml::parse data

  # Recursively import other YAMLs
  for imported of repo.imports ?? []
    imported_url = if imported.startsWith('./') or imported.startsWith('../') then path::resolve repo_url, imported else imported
    await _parseRepo name, imported_url, seen, result

  # Resolve packages
  for pkgname, value in repo.packages
    if typeof value == 'string' and value.startsWith "github:"
      pkg = await _resolveGithub pkgname, value
      if pkg then pkg.repo = name
      if pkg then result.push pkg
    else
      if value.readme then value.readme = await _fetchFile value.readme
      result.push { name: pkgname, repo: name, ...value }

  return result

function repo::sync_all(repo_name)
  repos = conf::readYAML "repo/main.yaml"

  index = 0
  
  pimmy::loader::start "Downloading"
  for name, url in repos
    if typeof repo_name == "string" and name !== repo_name then continue; 
    data = await _parseRepo name, url
    if data
      path = "cache/repo-cache/db_#{index}.bin"
      rew::conf::writeAuto path, data
      index += 1
  pimmy::loader::stop()

public function repo::_check_init()
  try
    config = rew::conf::readAuto "init.yaml"
    return config
  catch
    return false

function repo::add(repo, url)
  repos = conf::readYAML 'repo/main.yaml'
  conf::writeYAML 'repo/main.yaml', {
    ...repos
    [repo]: url
  }

function repo::remove(repo)
  repos = conf::readYAML 'repo/main.yaml'
  delete repos[repo]
  conf::writeYAML 'repo/main.yaml', repos

highlightMarkdown = (text) ->
  colors =
    reset:    "\x1b[0m"
    bold:     "\x1b[1m"
    italic:   "\x1b[3m"
    code:     "\x1b[38;5;208m"
    header:   "\x1b[38;5;39m"
    list:     "\x1b[38;5;70m"
    linkText: "\x1b[4;34m"
    linkUrl:  "\x1b[2;37m"

  lines = text.split("\n")
  output = []
  inCodeBlock = false

  for let line of lines
    if line.match(/^```|^~~~/)
      inCodeBlock = not inCodeBlock
      output.push "#{colors.code}#{line}#{colors.reset}"
      continue

    if inCodeBlock
      output.push "#{colors.code}#{line}#{colors.reset}"
      continue

    # Headers
    if line.match(/^#{1,6} /)
      output.push "#{colors.header}#{colors.bold}#{line}#{colors.reset}"
      continue

    # List items
    line = line.replace(/^([-*]) /, "#{colors.list}$1#{colors.reset} ")

    # Links: [text](url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) ->
      "#{colors.linkText}[#{text}]#{colors.reset}#{colors.linkUrl}(#{url})#{colors.reset}"
    )

    # Inline `code`
    line = line.replace(/`([^`]+)`/g, "#{colors.code}`$1`#{colors.reset}")

    # Bold **text**
    line = line.replace(/\*\*(.*?)\*\*/g, "#{colors.bold}$1#{colors.reset}")

    # Italic *text* (only if not already bold)
    line = line.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, "$1#{colors.italic}$2#{colors.reset}")

    output.push line

  output.join("\n")

function repo::readme(app_name)
  app = repo::lookup app_name
  if app
    temp_file = path::join rew::env::get("REW_TEMP_DIR"), "readme-pimmy-#{genUid()}.md"
    write temp_file, highlightMarkdown app.readme
    cmd = if rew::os::slug is "windows" then "more #{temp_file}" else "less -R #{temp_file}"
    p = shell::spawn cmd, stdin: 'piped', stdout: 'inherit'
    await p.status()
    await rm temp_file
  else
    logger::warn "App #{app_name} not found."

function repo::init()
  init_file = repo::_check_init()
  if init_file?._repo then return
  pimmy_data_path = conf::path()
  mkdir path::join pimmy_data_path, 'cache'
  mkdir path::join pimmy_data_path, 'cache/app-cache'
  mkdir path::join pimmy_data_path, 'cache/repo-cache'
  mkdir path::join pimmy_data_path, 'repo'

  conf::writeYAML 'repo/main.yaml', {
    rewpkgs: "//raw.githubusercontent.com/kevinJ045/rewpkgs/main/main.yaml"
  }

  rew::conf::writeAuto 'init.yaml', { _init: init_file._init ?? false, _repo: true }

