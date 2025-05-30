package pimmy::builder::cargo;


cargo::build_crates_for = (app_path, app_config, safe_mode) ->
  pimmy::logger::subtitle '', '', "Building app crates for", app_config.manifest.package;
  
  for crate of app_config.crates
    crate_path = path::normalize path::join app_path, crate.path
    pimmy::logger::action 'green', '-', 'Building crate', crate.name
    result = shell::exec "cargo build --release", cwd: crate_path, stdout: 'piped'
    unless crate.build then continue;
    unless result.success
      pimmy::loader::stop()
      pimmy::logger::error 'Failed to build cargo'
      print rew::encoding::bytesToString result.stderr
      pimmy::logger::error 'Cargo build failed'
      return 0
    printf '\x1b[1A\\r'
    pimmy::logger::action 'green', 'X', 'Built Crate', crate.name
    if crate.files
      for file of crate.files
        copy path::join(app_path, file.input), path::join(app_path, file.output)
        if file.cleanup then rm path::join(app_path, file.cleanup), true
  
    if crate.cleanup and !safe_mode
      pimmy::logger::action 'green', '-', 'Clean Up', crate.name
      rm path::join(app_path, crate.cleanup), true
    return 1



