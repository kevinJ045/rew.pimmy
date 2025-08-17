package pimmy::builder::native;

function run_inline(args, io_mode = 'inherit')
  rew::shell::exec ["sh", "-c", args.trim()], stdout: io_mode, stdin: 'inherit', stderr: io_mode

PACKAGE_MANAGERS =
  apt:      "sudo apt-get install -y $"
  pacman:   "sudo pacman -S --noconfirm $"
  dnf:      "sudo dnf install -y $"
  zypper:   "sudo zypper install -y $"
  brew:     "brew install $"
  winget:   "winget install --id=$ -e --accept-source-agreements --accept-package-agreements"
  chocolatey: "choco install $ -y"
  nix:      "echo Nix is currently unsupported."

function installer(mgr, pkg)
  cmd = PACKAGE_MANAGERS[mgr]
  unless cmd?
    pimmy::logger::error "Unsupported package manager: #{mgr}"

  command_str = cmd.replace '$', pkg
  rew::shell::exec command_str, stdout: 'inherit', stdin: 'inherit', stderr: 'inherit'

function is_available_mgr(mgr)
  !!strBytes(rew::shell::exec("#{rew::os::clamp("where", "which")} #{mgr}", stdout: "piped").stdout).trim()

pimmy::builder::native::is_available_mgr = is_available_mgr

pimmy::builder::native::install_deps = (config, app_path, safe_mode, indent = 1) ->
  return unless config.native

  deps = config.native[rew::os::slug] or config.native[rew::os::family] or []
  for dep of deps
    {name, type, check, managers, 'preinstall': pre_install, 'postinstall': post_install, fallback, content, path} = dep

    pimmy::logger::log pimmy::logger::indent(indent), "Installing native dependency: #{name or '?'}"

    installed = false

    if check?
      try
        result = await run_inline check, "piped"
        if result.success
          pimmy::logger::log pimmy::logger::indent(indent), ":icon suc green", "Already installed"
          continue

    if pre_install?
      for cmd of pre_install
        if cmd.shell?
          await run_inline cmd.shell

    if type == 'shell'
      pimmy::logger::log pimmy::logger::indent(indent), "Running custom command for #{name or "?"}"
      await run_inline dep.content
      installed = true

    if type == 'script'
      pimmy::logger::log pimmy::logger::indent(indent), "Running script for #{name or "?"}"
      script_path = path::join app_path, fb.path
      await imp script_path
      installed = true

    else if type == 'installer'
      pimmy::logger::log pimmy::logger::indent(indent), "Running installer for #{name}"
      out_file = path::join pimmy::cache::path, genUid(14, "#{dep.url}-#{name}-installer")
      await pimmy::cache::download_file dep.url, out_file
      await run_inline out_file
      installed = true

    else if type == 'package'
      if managers?
        for mgr, pkg in managers
          if is_available_mgr mgr
            pimmy::logger::log pimmy::logger::indent(indent), "Installing #{name} using #{mgr}"
            await installer mgr, pkg
            installed = true
            break

      unless installed and fallback?
        if Array.isArray(fallback)
          for fb of fallback
            await handle_fallback(fb, name, app_path, safe_mode, indent)
          installed = true
        else if fallback?
          await handle_fallback(fallback, name, app_path, safe_mode, indent)
          installed = true

    if installed and post_install?
      for cmd of post_install
        if cmd.shell?
          await run_inline cmd.shell
    
    unless installed
      pimmy::logger::error pimmy::logger::indent(indent), "Failed to install native dependency: #{name}"
    else
      pimmy::logger::log pimmy::logger::indent(indent), ":icon suc green", "Installed"
      if check?
        try
          result = await run_inline check, "piped"
          if result.success
            pimmy::logger::log pimmy::logger::indent(indent), ":icon suc green", "Install check succeeded"
          else
            pimmy::logger::log pimmy::logger::indent(indent), ":icon err red", "Install check failed"
      

handle_fallback = (fb, name, app_path, safe_mode, indent = 1) ->
  switch fb.type
    when 'script'
      script_path = path::join app_path, fb.path
      pimmy::logger::log pimmy::logger::indent(indent), "Running script fallback for #{name} (#{script_path})"
      await imp script_path

    when 'shell'
      pimmy::logger::log pimmy::logger::indent(indent), "Running shell fallback for #{name}"
      await run_inline fb.content

    when 'installer'
      out_file = path::join pimmy::cache::path, genUid(14, "#{dep.url}-#{name}-installer")
      pimmy::logger::log pimmy::logger::indent(indent), "Downloading installer fallback for #{name}"
      await pimmy::cache::download_file fb.url, out_file
      await run_installer out_file

    else
      pimmy::logger::error pimmy::logger::indent(indent), "Unknown fallback type for #{name}: #{fb.type}"
