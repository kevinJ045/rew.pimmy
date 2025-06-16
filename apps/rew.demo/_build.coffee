builders = {}

builders.demo_builder = (app_path, config, input, output) ->
  rew::io::out.print app_path, config, input, output

export { builders }