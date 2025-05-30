package pimmy::loader;

loader::frames = ['|', '/', '-', '\\\\']
loader::interval = null
loader::i = 0
loader::text = 'Loading'

loader::start = (text) ->
  if text then loader::text = text
  return if loader::interval?  # avoid duplicate intervals

  @interval = setInterval =>
    frame = loader::frames[loader::i % loader::frames.length]
    printf "\\r#{frame} #{loader::text}"
    loader::i++
  , 100

loader::say = (newText) ->
  loader::text = newText

loader::stop = ->
  return unless loader::interval?
  clearInterval loader::interval
  loader::interval = null
  printf "\r"