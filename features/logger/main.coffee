package pimmy::logger;

pimmy::logger::LOG = false;

pimmy::logger::log = (color, prefix, icon, ...logs) =>
  if pimmy::logger::LOG
    text = '%c' + prefix + (if icon then '[' + icon + '] ' else '') + logs.join(' ')
    rew::io::out.print text, "color: #{color};font-weight:bold"

pimmy::logger::title = (color, icon, ...logs) =>
  pimmy::logger::log color || 'white', '', icon, ...logs

pimmy::logger::subtitle = (color, icon, ...logs) =>
  pimmy::logger::log color || 'white', '=> ', icon, ...logs

pimmy::logger::action = (color, icon, ...logs) =>
  pimmy::logger::log color || 'white', '===> ', icon, ...logs

pimmy::logger::error = (...logs) =>
  rew::io::out.print '%c[ERROR] ' + logs.join(' '), 'color: red;font-weight:bold' 

pimmy::logger::info = (...logs) =>
  rew::io::out.print '[LOG] ' + logs.join(' ')

pimmy::logger::warn = (...logs) =>
  rew::io::out.print '%c[WARN] ' + logs.join(' '), 'color: yellow;font-weight:bold' 
