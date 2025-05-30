rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/apps/rew.demo/_build.cake", {
"/home/makano/workspace/pimmy/apps/rew.demo/_build.cake"(globalThis){
with (globalThis) {
  let builders = {}

builders.demo_builder = function(app_path, config, input, output) {
  return rew.prototype.io.prototype.out.print(app_path, config, input, output)
}

module.exports =  { builders }
}
return globalThis.module.exports;
}          
}, ["app://rew.demo/_build"]);