package pimmy::builder;
import "./cargo.coffee";
import "./brew.coffee";
using namespace pimmy::builder::cargo;

pimmy::builder::build = (app_path_relative, safe_mode) ->
  app_path = rew::path::normalize rew::path::join rew::process::cwd, app_path_relative
  app_conf_path = rew::path::join app_path, 'app.yaml'

  unless rew::fs::exists app_conf_path then throw new Error('App not found');
  
  config = pimmy::utils::readYaml app_conf_path
  pimmy::logger::title '', '*', 'Building App', config.manifest.package
  
  unless config.crates or config.build then throw new Error('no build candidates found');
  
  if config.cakes
    for cakefile of config.cakes
      cake = await imp rew::path::join app_path, cakefile
      if cake?.builders
        for key in cake.builders
          pimmy::builder::[key] = cake.builders[key]

  if config.crates
    cargo::build_crates_for app_path, config, safe_mode 
  
  if config.build
    for file of config.build
      if file.using 
        build_fn = pimmy::builder::[file.using]
        unless build_fn then throw new ReferenceError("Builder #{file.using} does not exist")
        input_path = rew::path::normalize rew::path::join app_path, file.input
        output_path = rew::path::normalize rew::path::join app_path, file.output
        unless exists input_path then throw new Error("Input file #{input_path} not found")
        await build_fn(app_path, config, file, input_path, output_path)
      if file.cleanup and !safe_mode
        rm path::join(app_path, file.cleanup), true
        pimmy::logger::action 'green', '-', 'File Cleanup'













