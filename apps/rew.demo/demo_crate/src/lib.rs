use std::os::unix::net::UnixDatagram;
use std::sync::Mutex;
use std::path::Path;
use std::fs;
use std::ffi::CStr;
use std::os::raw::{c_char, c_int, c_uchar};
use lazy_static::lazy_static;

lazy_static! {
    static ref SOCKET: Mutex<Option<UnixDatagram>> = Mutex::new(None);
}

#[unsafe(no_mangle)]
pub extern "C" fn init_socket() -> c_int {
    let path = "/tmp/mysock";

    // Clean up old socket file
    if Path::new(path).exists() {
        let _ = fs::remove_file(path);
    }

    match UnixDatagram::bind(path) {
        Ok(sock) => {
            sock.set_nonblocking(true).unwrap();
            *SOCKET.lock().unwrap() = Some(sock);
            1
        },
        Err(_) => 0
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn recv_message(buf: *mut c_uchar, max_len: usize) -> c_int {
    let mut guard = SOCKET.lock().unwrap();
    if let Some(sock) = &*guard {
        let mut tmp = vec![0u8; max_len];
        match sock.recv(&mut tmp) {
            Ok(size) => {
                unsafe {
                    std::ptr::copy_nonoverlapping(tmp.as_ptr(), buf, size);
                }
                size as c_int
            },
            Err(_) => 0
        }
    } else {
        -1
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn send_message(cstr: *const c_char) -> c_int {
    let guard = SOCKET.lock().unwrap();
    if let Some(sock) = &*guard {
        let cstr = unsafe { CStr::from_ptr(cstr) };
        match sock.send_to(cstr.to_bytes(), "/tmp/mysock") {
            Ok(sent) => sent as c_int,
            Err(_) => -1
        }
    } else {
        -1
    }
}
