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
  apps_path = rew::path::join(module.app.path, 'apps')
  unless exists apps_path
    return
  # Temporary fix for windows
  if rew::os::slug == 'windows'
    return
  try
    apps = rew::fs::readdir apps_path
    for app of apps
      app_path = app.path
      dest = rew::path::join pimmy::init::ROOT, 'apps', app.name
      await rew::fs::copy app.path, dest
  catch e
    print e

pimmy::init::start = ->
  if pimmy::init::_check_init() then return
  try
    pimmy::init::_copy_apps()
    pimmy::init::_set_init()
    pimmy::repo::init()
  catch e
    print e