package pimmy::repo;

import "#std.net";

# c = rew::channel::new ->

function _resolveGithub(name, github_url)
  match = github_url.match /^github:([^\/]+)\/([^@#]+)(?:@([^#]+))?(?:#(.+))?$/
  unless match
    pimmy::logger::error "Invalid GitHub URL: #{github_url}"
    return null

  [, owner, repoName, branch, commit] = match
  branch = branch ?? "main"

  baseUrl = "https://raw.githubusercontent.com/#{owner}/#{repoName}/#{branch}/"

  pkg = {
    name: name,
    github: github_url,
    url: baseUrl,
    branch,
    commit: commit ?? null
  }

  files = ['app.yaml', 'README.md']

  for file of files
    content = await rew::net::fetch baseUrl + file
                .then .text()
                .catch -> null
    if content
      pkg[file] = content

      if file == 'app.yaml'
        app = rew::yaml::parse content
        if app?.assets?.icon
          icon_path = app.assets.icon
          icon_content = await rew::net::fetch baseUrl + icon_path
                           .then .text()
                           .catch -> null
          if icon_content
            pkg[icon_path] = icon_content

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
      result.push { name: pkgname, ...value }

  return result

function repo::sync_all()
  repos = conf::readYAML "repo/main.yaml"

  index = 0
  
  pimmy::loader::start "Downloading"
  for name, url in repos
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

