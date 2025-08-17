use std::ffi::{CStr};
use std::fs;
use std::path::Path;
use std::os::raw::c_char;

use libc::c_int;

#[unsafe(no_mangle)]
pub extern "C" fn zip_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let mut archive = zip::ZipArchive::new(file)?;
        for i in 0..archive.len() {
            let mut file = archive.by_index(i)?;
            let outpath = out_path.join(file.name());

            if file.is_dir() {
                fs::create_dir_all(&outpath)?;
            } else {
                if let Some(p) = outpath.parent() {
                    fs::create_dir_all(p)?;
                }
                let mut outfile = std::fs::File::create(&outpath)?;
                std::io::copy(&mut file, &mut outfile)?;
            }
        }
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn tar_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let mut archive = tar::Archive::new(file);
        archive.unpack(out_path)?;
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn tar_gz_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let decompressor = flate2::read::GzDecoder::new(file);
        let mut archive = tar::Archive::new(decompressor);
        archive.unpack(out_path)?;
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn tar_xz_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let decompressor = xz2::read::XzDecoder::new(file);
        let mut archive = tar::Archive::new(decompressor);
        archive.unpack(out_path)?;
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn tar_bz2_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let decompressor = bzip2::read::BzDecoder::new(file);
        let mut archive = tar::Archive::new(decompressor);
        archive.unpack(out_path)?;
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn tar_zst_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let file = std::fs::File::open(&input_path)?;
        let decompressor = zstd::stream::read::Decoder::new(file)?;
        let mut archive = tar::Archive::new(decompressor);
        archive.unpack(out_path)?;
        Ok(())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn rar_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let status = std::process::Command::new("unrar")
            .args([
                "x",                            // extract
                "-o+",                          // overwrite all
                input_path.to_str().unwrap(),   // source archive
                out_path.to_str().unwrap(),     // output directory
            ])
            .status()?;

        if status.success() {
            Ok(())
        } else {
            Err("unrar failed".into())
        }
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn sevenz_unarchive(input_file: *const c_char, output_dir: *const c_char) -> c_int {
    ffi_unarchive(input_file, output_dir, |input_path, out_path| {
        let status = std::process::Command::new("7z")
            .args([
                "x",                            // extract with full paths
                input_path.to_str().unwrap(),   // source archive
                format!("-o{}", out_path.display()).as_str(), // output dir
                "-y",                           // assume Yes on all queries
            ])
            .status()?;

        if status.success() {
            Ok(())
        } else {
            Err("7z failed".into())
        }
    })
}

/// Shared wrapper for FFI unarchive functions.
fn ffi_unarchive<F>(input_file: *const c_char, output_dir: *const c_char, func: F) -> c_int
where
    F: FnOnce(&Path, &Path) -> Result<(), Box<dyn std::error::Error>>,
{
    let c_input = unsafe { CStr::from_ptr(input_file) };
    let c_output = unsafe { CStr::from_ptr(output_dir) };

    let input_path = Path::new(match c_input.to_str() {
        Ok(s) => s,
        Err(_) => return 2,
    });

    let out_path = Path::new(match c_output.to_str() {
        Ok(s) => s,
        Err(_) => return 2,
    });

    if !input_path.exists() {
        return 3;
    }

    if let Err(e) = fs::create_dir_all(&out_path) {
        eprintln!("Failed to create output directory: {e}");
        return 4;
    }

    match func(input_path, out_path) {
        Ok(_) => 0,
        Err(e) => {
            eprintln!("Unarchive error: {e}");
            5
        }
    }
}
