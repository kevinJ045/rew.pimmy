package pimmy::cli;
using namespace pimmy::logger;
using namespace rew::ns
OPTIONS = []
EXAMPLES = []
DESCRIPTION = ""

pimmy::cli::option = (...args) -> Usage::create ->
  OPTIONS.push(args)

pimmy::cli::example = (...args) -> Usage::create ->
  EXAMPLES.push(args)

pimmy::cli::description = (a) -> Usage::create ->
  DESCRIPTION = a

pimmy::cli::parse = (args) -> Usage::create (ctx) ->
  parser = pimmy::cli::parser::new();
  for option of OPTIONS
    parser.option ...option
  for example of EXAMPLES
    parser.example ...example
  parser.description = DESCRIPTION
  ctx.cli_options = parser.parse args
  ctx.print_help = -> parser.help()

pimmy::cli::parser = class CliParser
  options: any
  aliases: any
  parsed: any
  examples: any
  description: any
  constructor()
    @description = ""
    @options = {}
    @aliases = {}
    @parsed = {}
    @examples = []
    @

  new()
    new CliParser()

  option(name, config: any = {})
    @options[name] = config
    if config.alias?
      @aliases[config.alias] = name
    this

  description(description = "")
    @description = description
    this

  example(usage, description = "")
    @examples.push { usage, description }
    this

  help()
    logger::title "@cyan,bold,underline(Pimmy)", "@blue(v#{module.app.config.manifest.version})"
    logger::log logger::indent(2), "@underline(#{@description})"
    logger::log logger::indent(2), "@yellow,underline(Options)", "--"
    for name, config in @options
      line = ["@green(--#{name}"]
      if config.alias?
        line[0] += ", -#{config.alias})"
      else line[0] += ")"
      if config.description?
        line.push "  -", "@blue(#{config.description})"
      logger::log logger::indent(3), ...line

    if @examples.length > 0
      logger::log logger::indent(2), "@yellow,underline(Examples)", "--"
      for ex of @examples
        logger::log logger::indent(3), "@green(#{ex.usage})", "@gray(#)", "@underline,blue(#{ex.description})"

    logger::closeTitle()

  parse(args: any)
    i = 0
    while i < args.length
      arg = args[i]

      if arg.startsWith('--')
        key = arg[2..]
        name = @aliases[key] or key
        config = @options[name] or {}
        if config.type is 'boolean'
          @parsed[name] = true
        else
          val = args[i+1]
          if not val? or val.startsWith('-')
            @parsed[name] = true
          else
            @parsed[name] = val
            i += 1
      else if arg.startsWith('-')
        shortFlags = arg[1..]
        for ch of shortFlags
          name = @aliases[ch] or ch
          config = @options[name] or {}
          if config.type is 'boolean'
            @parsed[name] = true
          else
            val = args[i+1]
            if not val? or val.startsWith('-')
              @parsed[name] = true
            else
              @parsed[name] = val
              i += 1
      else
        if not @parsed._?
          @parsed._ = []
        @parsed._.push arg
      i += 1

    @parsed