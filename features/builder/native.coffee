package pimmy::builder::native;

function run_inline(args)
  rew::shell::exec ["sh", "-c", args.trim()], stdout: 'inherit', stdin: 'inherit', stderr: "inherit"

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
  rew::shell::exec command_str, stdout: 'inherit', stdin: 'inherit'

function is_available_mgr(mgr)
  !!strBytes(rew::shell::exec("#{rew::os::clamp("where", "which")} #{mgr}", stdout: "piped").stdout).trim()

pimmy::builder::native::is_available_mgr = is_available_mgr

pimmy::builder::native::install_deps = (config, app_path, safe_mode) ->
  return unless config.native

  deps = config.native[rew::os::slug] or config.native[rew::os::family] or []
  for dep of deps
    {name, type, managers, 'preinstall': pre_install, 'postinstall': post_install, fallback, content, path} = dep

    pimmy::logger::log "Installing native dependency: #{name or '?'}"

    installed = false

    if pre_install?
      for cmd of pre_install
        if cmd.shell?
          await run_inline cmd.shell

    if type == 'shell'
      pimmy::logger::log "Running custom command for #{name or "?"}"
      await run_inline dep.content
      installed = true

    if type == 'script'
      pimmy::logger::log "Running script for #{name or "?"}"
      script_path = path::join app_path, fb.path
      await imp script_path
      installed = true

    else if type == 'installer'
      pimmy::logger::log "Running installer for #{name}"
      out_file = path::join pimmy::cache::path, genUid(14, "#{dep.url}-#{name}-installer")
      await pimmy::cache::download_file dep.url, out_file
      await run_inline out_file
      installed = true

    else if type == 'package'
      if managers?
        for mgr, pkg in managers
          if is_available_mgr mgr
            pimmy::logger::log "Installing #{name} using #{mgr}"
            await installer mgr, pkg
            installed = true
            break

      unless installed and fallback?
        if Array.isArray(fallback)
          for fb of fallback
            await handle_fallback(fb, name, app_path, safe_mode)
          installed = true
        else if fallback?
          await handle_fallback(fallback, name, app_path, safe_mode)
          installed = true

    # 5) Post-install hooks
    if installed and post_install?
      for cmd of post_install
        if cmd.shell?
          await run_inline cmd.shell
          
    unless installed
      pimmy::logger::error "Failed to install native dependency: #{name}"

handle_fallback = (fb, name, app_path, safe_mode) ->
  switch fb.type
    when 'script'
      script_path = path::join app_path, fb.path
      pimmy::logger::log "Running script fallback for #{name} (#{script_path})"
      await imp script_path

    when 'shell'
      pimmy::logger::log "Running shell fallback for #{name}"
      await run_inline fb.content

    when 'installer'
      out_file = path::join pimmy::cache::path, genUid(14, "#{dep.url}-#{name}-installer")
      pimmy::logger::log "Downloading installer fallback for #{name}"
      await pimmy::cache::download_file fb.url, out_file
      await run_installer out_file

    else
      pimmy::logger::error "Unknown fallback type for #{name}: #{fb.type}"
