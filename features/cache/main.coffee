package pimmy::cache;

pimmy::cache::parse_name = (key) ->
  key

pimmy::cache::resolve = (key) ->
  app_path = path::resolveFrom rew::process::cwd, key
  if exists app_path
    key
  pimmy::cache::parse_name key
    





