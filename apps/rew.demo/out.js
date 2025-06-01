rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/apps/rew.demo/main.coffee", {
"/home/makano/workspace/pimmy/apps/rew.demo/main.coffee"(globalThis){
with (globalThis) {
  
rew.prototype.mod.prototype.find(module, "#std.ffi!");
rew.prototype.mod.prototype.find(module, "#std.path");
rew.prototype.mod.prototype.find(module, "#std.encoding");
using(namespace(rew.prototype.ns))

let ins = instantiate(class {
  init_socket = rew.prototype.ffi.prototype.typed( function() { return 'i32' })
  recv_message = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, 'usize', function() { return 'i32' })
  send_message = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.pre('i32', Number))
})

let init_socket, recv_message, send_message;

({ init_socket, recv_message, send_message } = ffi.prototype.open(rew.prototype.path.prototype.resolve("./.artifacts/libdemo_crate.so"), ins))

init_socket()

let loopm = function() {
  let buf = new Uint8Array(40960)
  if (recv_message(rew.prototype.ptr.prototype.of(buf), 40960) > 0) {
    rew.prototype.io.prototype.out.print(rew.prototype.encoding.prototype.bytesToString(buf))
  }
  return setTimeout(loopm, 1)
}

loopm()

}
return globalThis.module.exports;
}          
}, ["app://rew.demo/main"]);