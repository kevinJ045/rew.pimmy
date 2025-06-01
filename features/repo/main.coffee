package pimmy::repo;
using compiler::autoLet.disable
using compiler::autoVar
import "#std.net";

# c = rew::channel::new ->

function _fetchFile(url)
  await rew::net::fetch url
        .then .text()
        .catch -> null

function repo::lookup(pkgname)
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

    index += 1

  if results.length > 0
    return results[0]  
  else
    pimmy::logger::warn "Package not found: #{pkgname}"
    return null


function _resolveGithubURL(github_url)
  match = github_url.match /^github:([^\/]+)\/([^@#]+)(?:@([^#]+))?(?:#(.+))?$/
  unless match
    pimmy::logger::error "Invalid GitHub URL: #{github_url}"
    return null

  [, owner, repoName, branch, commit] = match
  branch = branch ?? "main"

  baseUrl = "https://raw.githubusercontent.com/#{owner}/#{repoName}/#{branch}/"
  {baseUrl, owner, repoName, branch, commit}


function _resolveGithub(name, github_url)
  { baseUrl } = _resolveGithubURL github_url

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
    await _parseRepo name, imported, seen, result

  # Resolve packages
  for pkgname, value in repo.packages
    if typeof value == 'string' and value.startsWith "github:"
      pkg = await _resolveGithub pkgname, value
      if pkg then result.push pkg
    else
      if value.readme then value.readme = await _fetchFile value.readme
      result.push { name: pkgname, ...value }

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

function repo::init()
  init_file = repo::_check_init()
  if init_file?._repo then return
  pimmy_data_path = conf::path()
  mkdir path::join pimmy_data_path, 'cache'
  mkdir path::join pimmy_data_path, 'cache/repo-cache'
  mkdir path::join pimmy_data_path, 'cache/repo-cache'
  mkdir path::join pimmy_data_path, 'repo'

  conf::writeYAML 'repo/main.yaml', {
    rewpkgs: "//raw.githubusercontent.com/kevinJ045/rewpkgs/main/main.yaml"
  }

  rew::conf::writeAuto 'init.yaml', { _init: init_file._init ?? false, _repo: true }
  pimmy::logger::action 'green', 'X', "Created rewpkgs repo"

