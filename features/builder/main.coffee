package pimmy::builder;
import "./cargo.coffee";
import "./brew.coffee";
using namespace pimmy::builder::cargo;

pimmy::builder::build = (app_path_relative, safe_mode) ->
  app_path = if path::isAbsolute app_path_relative then app_path_relative else rew::path::normalize rew::path::join rew::process::cwd, app_path_relative
  app_conf_path = rew::path::join app_path, 'app.yaml'

  unless rew::fs::exists app_conf_path then throw new Error('App not found');
  
  config = pimmy::utils::readYaml app_conf_path
  pimmy::logger::title 'Building App', config.manifest.package
  
  unless config.crates or config.build or config.prefetch then throw new Error('no build candidates found');

  if config.cakes
    pimmy::logger::log 'Found Cakes '
    for cakefile of config.cakes
      try
        cake = await imp rew::path::join app_path, cakefile
        if cake?.builders
          for key in cake.builders
            pimmy::builder::[key] = cake.builders[key]
        else
          pimmy::logger::warn 'Cake did not export any builders'
      catch(e)
        pimmy::logger::log 'Failed to load cake'

  if config.prefetch
    for prefetch of config.prefetch
      bare_url = prefetch.url
      unarchiver = sha = null
      unless bare_url.startsWith 'https://'
        {
          url,
          unarchiver,
          sha
        } = pimmy::cache::parse_url_pattern bare_url
        bare_url = url
        if unarchiver == '.' then unarchiver = null
      output = path::join app_path, prefetch.output

      if exists output
        if sha
          if rew::fs::sha(output) != sha
            await pimmy::cache::download_file bare_url, output
      else await pimmy::cache::download_file bare_url, output

      if sha
        file_sha = rew::fs::sha(output)

        if file_sha != sha
          throw new Error("SHA unmatched.\nExpected: #{sha}\nFound: #{file_sha}\n")

      if unarchiver and prefetch.extract
        pimmy::cache::unarchive unarchiver, output, path::join app_path, prefetch.extract
        if prefetch.build
          pimmy::builder::build path::join(app_path, prefetch.extract), safe_mode

  triggers = [];

  errors = 0

  if config.crates
    unless cargo::build_crates_for app_path, config, safe_mode, triggers
      errors += 1
  
  if config.build
    for file of config.build
      if file.using 
        build_fn = pimmy::builder::[file.using]
        unless build_fn
          pimmy::logger::error "Builder #{file.using} does not exist"
          errors++
          break
        input_path = rew::path::normalize rew::path::join app_path, file.input
        output_path = rew::path::normalize rew::path::join app_path, file.output
        unless exists input_path
          pimmy::logger::error "Input file #{input_path} not found"
          errors++
          break
        await build_fn(app_path, config, file, input_path, output_path)
      if file.id then triggers.filter .id == file.id
        .forEach .build()
      if file.cleanup and !safe_mode

        if Array.isArray(file.cleanup)
          for cleanup of file.cleanup
            rm path::join(app_path, cleanup), true
        else rm path::join(app_path, file.cleanup), true
        pimmy::logger::info 'File Cleanup'
    
  pimmy::logger::closeTitle "Finished build with #{errors} errors."













