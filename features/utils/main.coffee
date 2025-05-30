package pimmy::utils;
import "#std.fs";
import "#std.yaml";

pimmy::utils::readYaml = (path) ->
  rew::yaml::parse read path