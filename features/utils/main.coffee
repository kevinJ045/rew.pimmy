package pimmy::utils;
import "#std.fs";
import "#std.yaml";

pimmy::utils::readYaml = (path) ->
  rew::yaml::parse read path

pimmy::utils::resolveGithubURL = (github_url) ->
  match = github_url.match /^github:([^\/]+)\/([^@#]+)(?:@([^#]+))?(?:#(.+))?$/
  unless match
    pimmy::logger::error "Invalid GitHub URL: #{github_url}"
    return null

  [, owner, repoName, branch, commit] = match
  branch = branch ?? "main"

  baseUrl = "https://raw.githubusercontent.com/#{owner}/#{repoName}/#{branch}/"
  homeUrl = "https://github.com/#{owner}/#{repoName}"
  {baseUrl, homeUrl, owner, repoName, branch, commit}
