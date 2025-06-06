package pimmy::init;

import "#std!";
import "#std.fs";
import "#std.path";

pimmy::init::ROOT = rew::env::get('REW_ROOT');

pimmy::init::_check_init = ->
  try
    config = rew::conf::readAuto "init.yaml"
    return config._init
  catch
    return false

pimmy::init::_set_init = ->
  rew::conf::writeAuto 'init.yaml', { _init: true }

pimmy::init::_copy_apps = ->
  apps = rew::fs::readdir('./apps')
  for app of apps
    app_path = rew::path::normalize app.path
    dest = rew::path::join pimmy::init::ROOT, 'apps', app.name
    await rew::fs::copy app.path, dest

pimmy::init::start = ->
  if pimmy::init::_check_init() then return
  pimmy::init::_copy_apps()
  pimmy::init::_set_init()
  pimmy::repo::init()