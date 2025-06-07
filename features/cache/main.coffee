package pimmy::cache;

_cache_path = path::join conf::path(), 'cache/app-cache'
_url_pattern = /^file\+([a-zA-Z0-9.]+)(?:\+sha\(([a-fA-F0-9]+)\))?\+(.+)$/;

function renderProgress(downloaded: number, total: number) {
  const percent = total ? downloaded / total : 0;
  const barLength = 20;
  const filled = Math.round(barLength * percent);
  const bar = "=".repeat(filled) + "-".repeat(barLength - filled);
  const display = total
    ? "#{(percent * 100).toFixed(1)}%"
    : "#{(downloaded / 1024).toFixed(1)} KB";
  printf "\r Downloading [#{bar}] #{display}";
}

function generate_id_for_existing(app_path)
  yml = pimmy::utils::readYaml path::join app_path, 'app.yaml'
  genUid(
    14,
    yml.manifest.package + (yml.manifest.version || "")
  ) + yml.manifest.package

function parse_url_pattern(input)
  match = input.match(_url_pattern);
  unless match then throw new Error("Invalid input format");

  [, unarchiver, sha, url] = match;
  return {
    url,
    unarchiver,
    sha: sha || undefined,
  }

unarchivers = null
function unarchive(unarchiver, input, output)
  pimmy::logger::verbose "Preparing extractors(REW_FFI_LOAD)"
  symbolMap = instantiate class
    ffi_type(ffi::ptr, ffi::ptr) zip_unarchive       = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) tar_unarchive       = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) tar_gz_unarchive    = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) tar_xz_unarchive    = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) tar_bz2_unarchive   = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) tar_zst_unarchive   = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) rar_unarchive       = -> 'i32'
    ffi_type(ffi::ptr, ffi::ptr) sevenz_unarchive    = -> 'i32'

  unless unarchivers then unarchivers = ffi::open rew::path::resolve("../../.artifacts/libarchiveman.so"), symbolMap

  await unarchivers[unarchiver + '_unarchive'] rew::ptr::of(
    rew::encoding::stringToBytes input
  ), rew::ptr::of(
    rew::encoding::stringToBytes output
  )

function download_file(url, cache_file)
  res = await net::fetch url
  total := Number(res.headers.get("content-length")) || 0
  downloaded = 0


  file = await open cache_file,
    write: true,
    create: true,
    truncate: true
  
  reader = res.body.getReader()
  writer = file.writable.getWriter()

  while true
    { done, value } = await reader.read()
    if done then break
    await writer.write(value)
    downloaded = downloaded + value.length
    renderProgress(downloaded, total)
  
  printf "\r\n"
  file.close()

function build_path(path)
  await pimmy::builder::build path

pimmy::cache::install = (cache_path, update, silent) ->
  pimmy::logger::title "Installing from cache entry"
  app_yaml = path::join cache_path, 'app.yaml'
  config = pimmy::utils::readYaml app_yaml
  app_name = config.manifest.package

  unless silent
    pimmy::logger::log ":icon package", "Package Info for #{app_name}";
    pimmy::logger::log pimmy::logger::indent(), "@gray(version)", "#{config.manifest.version or "unknown"}";
    if config.manifest.github
      pimmy::logger::log pimmy::logger::indent(), ":icon github", "github", "#{config.manifest.github}";
    if config.manifest.description
      pimmy::logger::log pimmy::logger::indent(), ":icon info", "description", "#{config.manifest.description}";
    if config.manifest.tags
      pimmy::logger::log pimmy::logger::indent(), "tags:"
      pimmy::logger::log pimmy::logger::indent(2), "!#{config.manifest.tags.join(' ')}!";
    response = pimmy::logger::input "Proceed to install? (y/n)"
    unless response.toLowerCase().startsWith 'y'
      pimmy::logger::closeTitle "App installation cancelled"
      return

  pimmy::logger::log "Installing #{app_name}"
  dest = path::join pimmy::init::ROOT, 'apps', app_name

  # dependency resolution goes here

  if update and exists dest
    await rm dest, true
  await copy cache_path, dest
  pimmy::logger::closeTitle "App installed"


pimmy::cache::resolve = (key, update, isRecursed) ->
  unless isRecursed then pimmy::logger::title "Resolve cache entry #{key}"
  app_path = rew::path::normalize path::join rew::process::cwd, key
  if exists app_path
    cache_path = path::join _cache_path, generate_id_for_existing(app_path)
    if exists cache_path then rm cache_path, true
    await copy app_path, cache_path
    pimmy::logger::closeTitle()
    return cache_path
  else if _url_pattern.exec key
    {
      url,
      unarchiver,
      sha
    } = parse_url_pattern key
    uid = genUid(
      24,
      url
    )
    cache_path = path::join _cache_path, uid
    pimmy::logger::info "Found URL entry"
    pimmy::logger::verbose "Downloading URL entry #{url} as cache entry #{uid}"
    
    mkdir cache_path, true

    cache_file = path::join cache_path, "entry.#{unarchiver.replaceAll("_", ".")}"

    if !update and exists cache_file
      if sha
        if rew::fs::sha(cache_file) != sha
          await download_file url, cache_file
        else
          pimmy::logger::verbose "Found Cache skipping Download"
      else
        pimmy::logger::verbose "Found Cache skipping Download"
    else await download_file url, cache_file

    unarachive_path = path::join cache_path, "_out"
    built_path = path::join cache_path, "_out/.built"
    if exists built_path
      pimmy::logger::closeTitle("Cache resolved")
      return unarachive_path
    else mkdir unarachive_path, true

    await unarchive(unarchiver, cache_file, unarachive_path)
    app_yaml = path::join unarachive_path, 'app.yaml'
    unless exists app_yaml
      pimmy::logger::error "Not a compatible rew app, seed file app.yaml could not be found. A bare minimum of a manifest with a package name is required for a rew app to be cached and processed"
      pimmy::logger::closeTitle()
      return null
    config = pimmy::utils::readYaml app_yaml
    if config.install?.build then await build_path(unarachive_path)
    if config.install?.cleanup
      for item of config.install.cleanup
        item_path = path::join unarachive_path, item
        if exists item_path then rm item_path, true
    await write built_path, ''
    pimmy::logger::closeTitle()
    return unarachive_path
  else if key.startsWith('github:')
    uid = genUid(
      24,
      key
    )
    cache_path = path::join _cache_path, uid
    {homeUrl, branch, commit} = pimmy::utils::resolveGithubURL key

    pimmy::logger::info "Found GIT entry"
    pimmy::logger::log "Cloning repo #{homeUrl} as cache entry #{uid}"
    
    await shell::exec 'git clone ' + homeUrl + " " + cache_path
    if branch then await shell::exec "git checkout #{branch}", cwd: cache_path
    if commit then await shell::exec "git reset --hard #{commit}", cwd: cache_path
      pimmy::logger::closeTitle()
    return cache_path
  else
    isInRepo = pimmy::repo::lookup key
    if isInRepo
      return await pimmy::cache::resolve isInRepo.url, update, true
    else
      pimmy::logger::error "Couldn't resolve to cache entry #{key}"
      pimmy::logger::closeTitle()
      return null
  
    





