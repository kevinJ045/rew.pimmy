
import "#std.ffi!";
import "#std.path";
import "#std.encoding";
using namespace rew::ns

ins = instantiate class
  ffi_type() init_socket = -> 'i32'
  ffi_type(ffi::ptr, 'usize') recv_message = -> 'i32'
  ffi_type(ffi::ptr) send_message = ffi::pre 'i32', Number

{ init_socket, recv_message, send_message } = ffi::open rew::path::resolve("./.artifacts/libdemo_crate.so"), ins

init_socket()

loopm = ->
  buf = new Uint8Array(40960)
  if recv_message(rew::ptr::of(buf), 40960) > 0
    rew::io::out.print rew::encoding::bytesToString(buf)
  setTimeout(loopm, 1)

loopm()
