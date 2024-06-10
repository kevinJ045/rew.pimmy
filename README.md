# Pimmy
Pimmy is a simple package manager built on top of rew for rew apps. 
It focuses more on simplicity and helps by download all repo packages locally instead of searching for them, minimalizing search time.

## Install
To install `pimmy`, just run this
```bash
rew install github:kevinj045/rew.pimmy
```
Or if you have `rewpkgs` repo, then
```bash
rew install @rewpkgs/rew.pimmy
```

## Usage
Once installed, You can start by downloading all package information into a local database
```bash
pimmy -SR
```
For more help use
```bash
pimmy --help
```
