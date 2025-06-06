package pimmy::builder::cargo;

function build_crate(crate, app_path, safe_mode)
  crate_path = path::normalize path::join app_path, crate.path
  pimmy::logger::action 'green', '-', 'Building crate', crate.name
  result = shell::exec "cargo build --release", cwd: crate_path, stdout: 'piped'
  unless crate.build then return 1;
  unless result.success
    pimmy::loader::stop()
    pimmy::logger::error 'Failed to build cargo'
    print rew::encoding::bytesToString result.stderr
    pimmy::logger::error 'Cargo build failed'
    return 0
  printf '\x1b[1A\r'
  pimmy::logger::action 'green', 'X', 'Built Crate', crate.name
  if crate.files
    for file of crate.files
      copy path::join(app_path, file.input), path::join(app_path, file.output)
      if file.cleanup then rm path::join(app_path, file.cleanup), true

  if crate.cleanup and !safe_mode
    pimmy::logger::action 'green', '-', 'Clean Up', crate.name
    rm path::join(app_path, crate.cleanup), true
  return 1

cargo::build_crates_for = (app_path, app_config, safe_mode, triggers) ->
  pimmy::logger::subtitle '', '', "Building app crates for", app_config.manifest.package;
  
  for crate of app_config.crates
    if crate.trigger
      triggers.push({ id: crate.trigger, build: => build_crate(crate, app_path, safe_mode) })
    else if not build_crate(crate, app_path, safe_mode)
      return 0
  return 1



