package pimmy::project;
import civet_options from "./civet.txt";
import main_types from "./types.txt";
import gitignore from "./ignore.txt";
import tsc from "./tsc.txt";

function yesify(thing)
  if thing
  then "@cyan(yes)"
  else "@yellow(no)"

function isYes(input)
  return input.toLowerCase().startsWith 'y'

function optionify(
  logs,
  cli_options,
  key,
)
  if cli_options.ignore
    pimmy::logger::log ...logs, yesify(cli_options[key])
  else
    cli_options[key] = isYes pimmy::logger::input ...logs

function pimmy::project::new(cli_options)
  new_path = path::normalize path::join rew::process::cwd, typeof cli_options.new == "string" ? cli_options.new : ""
  if exists(new_path) and readdir(new_path).length
    pimmy::logger::error "Cannot overwrite a populated directory"
    return
  
  pimmy::logger::title ":icon package bold yellow", "Creating at #{cli_options.new === true ? "." : cli_options.new}"
  app_name = path::basename new_path
  pimmy::logger::log "@gray(package?)", "@bold,green(#{app_name})"

  optionify(
    [":icon git bold yellow", "@gray(git?)"],
    cli_options,
    "git"
  )
  
  optionify(
    [":icon types blue", "@gray(types?)"],
    cli_options,
    "types"
  )
  
  pimmy::logger::closeTitle "Options set"

  pimmy::logger::title "Creating files"

  mkdir new_path, true
  write path::join(new_path, "app.yaml"), rew::yaml::string manifest: {"package": app_name}, entries: {main: "main.coffee"}
  pimmy::logger::log ":icon file blue", "Created file", "@green(app.yaml)"
  
  write path::join(new_path, if cli_options.types then "main.civet" else "main.coffee"), 'print "hello"'
  pimmy::logger::log ":icon file blue", "Created file", "@green(main.coffee)"

  if cli_options.types
    mkdir path::join(new_path, "_types"), true
    write path::join(new_path, "index.d.ts"), main_types
    write path::join(new_path, "tsconfig.json"), tsc
    write path::join(new_path, "civet.config.json"), civet_options
    pimmy::logger::log ":icon file blue", "Created file", "@green(index.d.ts)"
    pimmy::logger::log ":icon file blue", "Created file", "@green(tsconfig.json)"
    pimmy::logger::log ":icon file blue", "Created file", "@green(civet.config.json)"

  if cli_options.git
    pimmy::logger::log ":icon git bold yellow", "git init"
    shell::exec "git init .", cwd: new_path, stdout: "piped"
    write path::join(new_path, ".gitignore"), gitignore
    pimmy::logger::log ":icon file blue", "Created file", "@green(.gitignore)"

  pimmy::logger::closeTitle "Files Created"