
pimmy::builder::brew = (app_path, config, file) ->
  shell::exec "rew brew #{file.input} #{file.output}", cwd: app_path

pimmy::builder::qrew = (app_path, config, file) ->
  shell::exec "#{path::resolve("./.artifacts/rew-qrew")} #{file.input} #{file.output}", cwd: app_path
  
