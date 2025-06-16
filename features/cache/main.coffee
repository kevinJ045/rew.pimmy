package pimmy::cache;

_cache_path = path::join conf::path(), 'cache/app-cache'
_repo_cache_path = path::join conf::path(), 'cache/repo-cache'
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

pimmy::cache::parse_url_pattern = parse_url_pattern;

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

  unless unarchivers then unarchivers = ffi::open rew::path::join(module.app.path, ".artifacts/libarchiveman.so"), symbolMap

  await unarchivers[unarchiver + '_unarchive'] rew::ptr::of(
    rew::encoding::stringToBytes input
  ), rew::ptr::of(
    rew::encoding::stringToBytes output
  )

pimmy::cache::unarchive = unarchive;

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

pimmy::cache::download_file = download_file

pimmy::cache::install = (cache_path, update, silent) ->
  unless silent then pimmy::logger::title "Installing from cache entry"
  app_yaml = path::join cache_path, 'app.yaml'
  config = pimmy::utils::readYaml app_yaml
  app_name = config.manifest.package

  if config.install?.preinstall
    for script of config.install.preinstall
      try
        await imp rew::path::join cache_path, script
      catch(e)
        pimmy::logger::log 'Failed to load preinstall script'


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

  if config.dependencies
    if silent
      for dep of config.dependencies
        cached = await pimmy::cache::resolve dep, true, true, true
        await pimmy::cache::install cached, true, true, true
    else
      pimmy::logger::info "Dependencies found"
      for dep of config.dependencies
        pimmy::logger::info pimmy::logger::indent(2), " #{dep}"
      response = pimmy::logger::input "Allow install dependencies? (y/n)"
      if response.toLowerCase().startsWith 'y'
        for dep of config.dependencies
          cached = await pimmy::cache::resolve dep, true, true, true
          await pimmy::cache::install cached, true, true

  if update and exists dest
    await rm dest, true
  await copy cache_path, dest


  if config.install?.bin
    pimmy::logger::info "App has binaries to register, remember to add #{path::join pimmy::init::ROOT, 'bin'} to your PATH"
    for bin, file in config.install?.bin
      bin_path = path::join pimmy::init::ROOT, 'bin', bin
      realpath = path::join dest, file
      pimmy::logger::info "Registering #{bin}"
      if rew::os::slug == "windows"
        await write bin_path+".cmd", "rew run #{config.manifest.package} -e #{bin} -- %*"
      else
        shell::exec "ln -s #{realpath} #{bin_path}"

  if config.install?.postinstall
    for script of config.install.postinstall
      try
        await imp rew::path::join cache_path, script
      catch(e)
        pimmy::logger::log 'Failed to load postinstall script'

  unless silent then pimmy::logger::closeTitle "App installed"

function pimmy::cache::remove_app(app_name, force)
  app_path = path::join pimmy::init::ROOT, 'apps', app_name
  unless exists app_path then return
  pimmy::logger::title "Remove app"
  pimmy::logger::info "Removing app #{app_name}"
  response = if force then 'y' else pimmy::logger::input "Proceed? (y/n)"
  if response.toLowerCase().startsWith 'y'
    app_yaml = path::join cache_path, 'app.yaml'
    config = pimmy::utils::readYaml app_yaml
    if config.install?.uninstall
      for script in config.install?.uninstall
        await imp rew::path::join app_path, script
    await rm app_path, true
    pimmy::logger::info "Removed app #{app_name}"
  pimmy::logger::closeTitle()


function pimmy::cache::remove(entry, force)
  if typeis(entry, str)
    cacheid = entry
    caches = readdir(_cache_path)
    found = caches.find .name == cacheid
    unless found
      found = caches[cacheid]
    unless found then return
    response = if force then 'y' else pimmy::logger::input "Remove cache entry? (y/n)"
    if response.toLowerCase().startsWith 'y'
      await rm found.path, true
  else
    response_all = if force then 'y' else pimmy::logger::input "Remove all cache entries? (y/n)"
    if response_all.toLowerCase().startsWith 'y'
      await rm path::join(
        conf::path(),
        'cache/app-cache'
      ), true
      mkdir path::join conf::path(), 'cache/app-cache'
    
    response = if force then 'y' else pimmy::logger::input "Remove all repo cache? (y/n)"
    if response.toLowerCase().startsWith 'y'
      await rm path::join(
        conf::path(),
        'cache/repo-cache'
      ), true
      mkdir path::join conf::path(), 'cache/repo-cache'
  

function pimmy::cache::list_installed()
  apps = readdir(path::join pimmy::init::ROOT, 'apps').map .name
  pimmy::logger::title "Installed apps"
  for item of apps
    pimmy::logger::info pimmy::logger::indent(1), ":icon package yellow bold", "@green(#{item})"
  pimmy::logger::closeTitle()
  

function pimmy::cache::list(cacheid)
  pimmy::logger::title "Cache entries"
  if cacheid
    cachepath = cacheid.match('/') ? (cacheid+'/').split('/').slice(1, -1).join('/') : ''
    cacheid = cacheid.match('/') ? cacheid.split('/').shift() : cacheid
    caches = readdir(_cache_path)
    found = caches.find .name == cacheid
    unless found
      found = caches[cacheid]
    unless found then return
    foundpath = path::join found.path, cachepath
    dir = readdir(foundpath)
    for item of dir
      pimmy::logger::info pimmy::logger::indent(1), item.is_file ? ":icon file blue" : ":icon folder yellow bold", "@green(#{item.name})"
  else
    dir = readdir(_cache_path).map .name
    for key, item in dir
      pimmy::logger::info pimmy::logger::indent(1), "@yellow(#{key})", "@green(#{item})"
  pimmy::logger::closeTitle()



pimmy::cache::resolve = (key, update, isRecursed, silent) ->
  unless isRecursed then pimmy::logger::title "Resolve cache entry #{key}"
  app_path = rew::path::normalize path::join rew::process::cwd, key
  if exists app_path
    cache_path = path::join _cache_path, generate_id_for_existing(app_path)
    if exists cache_path then rm cache_path, true
    await copy app_path, cache_path
    app_yaml = path::join cache_path, 'app.yaml'
    unless exists app_yaml
      unless silent then pimmy::logger::error "Not a compatible rew app, seed file app.yaml could not be found. A bare minimum of a manifest with a package name is required for a rew app to be cached and processed"
      unless silent then pimmy::logger::closeTitle()
      return null
    config = pimmy::utils::readYaml app_yaml
    # if config.install?.build then await build_path(cache_path)
    unless silent then pimmy::logger::closeTitle()
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
    unless silent then pimmy::logger::info "Found URL entry"
    unless silent then pimmy::logger::verbose "Downloading URL entry #{url} as cache entry #{uid}"
    
    mkdir cache_path, true

    cache_file = path::join cache_path, "entry.#{unarchiver.replaceAll("_", ".")}"

    if !update and exists cache_file
      if sha
        if rew::fs::sha(cache_file) != sha
          await download_file url, cache_file
        else
          unless silent then pimmy::logger::verbose "Found Cache skipping Download"
      else
        unless silent then pimmy::logger::verbose "Found Cache skipping Download"
    else await download_file url, cache_file

    if sha
      file_sha = rew::fs::sha(cache_file)

      if file_sha != sha
        throw new Error("SHA unmatched.\nExpected: #{sha}\nFound: #{file_sha}\n")
    
    unarachive_path = path::join cache_path, "_out"
    
    built_path = path::join cache_path, "_out/.built"
    if exists built_path
      unless silent then pimmy::logger::closeTitle("Cache resolved")
      return unarachive_path
    else mkdir unarachive_path, true

    await unarchive(unarchiver, cache_file, unarachive_path)
    app_yaml = path::join unarachive_path, 'app.yaml'
    unless exists app_yaml
      unless silent then pimmy::logger::error "Not a compatible rew app, seed file app.yaml could not be found. A bare minimum of a manifest with a package name is required for a rew app to be cached and processed"
      unless silent then pimmy::logger::closeTitle()
      return null
    config = pimmy::utils::readYaml app_yaml
    if config.install?.build then await build_path(unarachive_path)
    if config.install?.cleanup
      for item of config.install.cleanup
        item_path = path::join unarachive_path, item
        if exists item_path then rm item_path, true
    await write built_path, ''
    unless silent then pimmy::logger::closeTitle()
    return unarachive_path
  else if key.startsWith('github:')
    uid = genUid(
      24,
      key
    )
    cache_path = path::join _cache_path, uid
    {homeUrl, branch, commit} = pimmy::utils::resolveGithubURL key

    unless silent then pimmy::logger::info "Found GIT entry"
    unless silent then pimmy::logger::log "Cloning repo #{homeUrl} as cache entry #{uid}"
    
    await shell::exec 'git clone ' + homeUrl + " " + cache_path, stdout: "piped"
    if branch then await shell::exec "git checkout #{branch}", cwd: cache_path, stdout: "piped"
    if commit then await shell::exec "git reset --hard #{commit}", cwd: cache_path, stdout: "piped"
    unless silent then pimmy::logger::closeTitle()
    return cache_path
  else
    isInRepo = pimmy::repo::lookup key
    if isInRepo
      return await pimmy::cache::resolve isInRepo.url, update, true, silent
    else
      unless silent then pimmy::logger::error "Couldn't resolve to cache entry #{key}"
      unless silent then pimmy::logger::closeTitle()
      return null
  
    





