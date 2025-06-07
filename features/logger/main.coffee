package pimmy::logger;


@black     = (t) => "\x1b[30m#{t}\x1b[0m"
@red       = (t) => "\x1b[31m#{t}\x1b[0m"
@green     = (t) => "\x1b[32m#{t}\x1b[0m"
@yellow    = (t) => "\x1b[33m#{t}\x1b[0m"
@blue      = (t) => "\x1b[34m#{t}\x1b[0m"
@magenta   = (t) => "\x1b[35m#{t}\x1b[0m"
@cyan      = (t) => "\x1b[36m#{t}\x1b[0m"
@white     = (t) => "\x1b[37m#{t}\x1b[0m"
@gray      = (t) => "\x1b[90m#{t}\x1b[0m"

@bgRed     = (t) => "\x1b[41m#{t}\x1b[0m"
@bgGreen   = (t) => "\x1b[42m#{t}\x1b[0m"
@bgYellow  = (t) => "\x1b[43m#{t}\x1b[0m"
@bgBlue    = (t) => "\x1b[44m#{t}\x1b[0m"
@bgMagenta = (t) => "\x1b[45m#{t}\x1b[0m"
@bgCyan    = (t) => "\x1b[46m#{t}\x1b[0m"
@bgWhite   = (t) => "\x1b[47m#{t}\x1b[0m"
@bgGray    = (t) => "\x1b[100m#{t}\x1b[0m"

@bold      = (t) => "\x1b[1m#{t}\x1b[22m"
@dim       = (t) => "\x1b[2m#{t}\x1b[22m"
@italic    = (t) => "\x1b[3m#{t}\x1b[23m"
@underline = (t) => "\x1b[4m#{t}\x1b[24m"
@inverse   = (t) => "\x1b[7m#{t}\x1b[27m"
@hidden    = (t) => "\x1b[8m#{t}\x1b[28m"
@strike    = (t) => "\x1b[9m#{t}\x1b[29m"

@normal    = (t) => "\x1b[0m#{t}\x1b[0m"

symbols = 
  info: "",
  warn: "",
  err: "",
  suc: "",
  question: "",
  "package": "",
  git: "󰊢",
  github: "",
  download: "",
  build: "",
  terminal: ""

startPrefix      = '╭'
separator        = '│'
middlePrefix     = '├'
endPrefix        = '╰'

pimmy::logger::LOG = false;
printnorm = (logs) ->
  print gray(separator)
  print gray(middlePrefix) + " " + logs

parse_log = (log) =>
  if log.startsWith '!'
    log.slice(1, -1)
  else if log.startsWith ':icon'
    symbols[log.split(' ')[1]]
  else if log.startsWith '@'
    names = log.slice(1, -1).split('(')[0].split(',')
    all = log.split('(')[1].split(')')[0]
    
    for name of names
      all = @[name] all
    all
  else
    log

resolve_logs = (logs) ->
  logs.map(parse_log).join(' ')

pimmy::logger::title = (...logs) =>
  print()
  print gray(startPrefix) + " " + resolve_logs(logs)

pimmy::logger::closeTitle = (...logs) =>
  print gray(separator)
  print gray(endPrefix) + " " + resolve_logs(logs)

pimmy::logger::subtitle = (...logs) =>
  print gray(separator) + " " + resolve_logs(logs)

pimmy::logger::verbose = (...logs) =>
  if pimmy::logger::LOG
    printnorm bold(gray(symbols.terminal)) + " " + resolve_logs(logs)

pimmy::logger::log = (...logs) =>
  printnorm resolve_logs(logs)

pimmy::logger::info = (...logs) =>
  printnorm blue(symbols.info) + ' ' + resolve_logs(logs)

pimmy::logger::error = (...logs) =>
  printnorm bgRed(' ' + black(symbols.err + ' ERROR ')) + ' ' + red(resolve_logs(logs))

pimmy::logger::warn = (...logs) =>
  printnorm bgYellow(' ' + black(symbols.warn + ' WARN ')) + ' ' + yellow(resolve_logs(logs))

pimmy::logger::input = (icon, ...logs) =>
  unless logs.length
    logs = [icon]
    icon = blue(symbols.question)
  print gray(separator)
  after_prefix =  " " + icon + " " + resolve_logs(logs) + " ";
  result = input gray(endPrefix) + after_prefix
  print "\x1b[1A\r" + gray(middlePrefix) + after_prefix
  return result


loader_frames = [
  '⠋'
  '⠙'
  '⠸'
  '⠴'
  '⠦'
  '⠇'
]
loader_interval = null
loader_i = 0
loader_text = 'Loading'

_loader_frames = =>
  frame = loader_frames[loader_i % loader_frames.length]
  printf "\r#{gray(endPrefix)} #{pickRandom(cyan, red, blue, yellow, magenta)(frame)} #{loader_text}"
  loader_i++

loader_start = (text) ->
  print gray(separator)
  if text then loader_text = text
  return if loader_interval?

  loader_interval = setInterval _loader_frames, 100

loader_say = (newText) ->
  loader_text = newText

loader_stop = () ->
  return unless loader_interval?
  clearInterval loader_interval
  loader_interval = null
  printf "\x1b[1A\r"

pimmy::logger::loading = loader_start 
pimmy::logger::setLoadeg = loader_say
pimmy::logger::stopLoading = loader_stop

pimmy::logger::indent = (x = 1) -> "\r#{gray(middlePrefix+'─'.repeat(x))}"