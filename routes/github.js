/* jshint node:true */
"use strict";

var GitHubApi = require('github');
var Q = require('q');

function findAllRepos(accessToken) {
  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });

  // OAuth2
  github.authenticate({
      type: "oauth",
      token: accessToken
  });

  var reposGetAll = Q.nbind(github.repos.getAll, github.repos);
  var userGetOrgs = Q.nbind(github.user.getOrgs, github.user);
  var reposGetFromOrg = Q.nbind(github.repos.getFromOrg, github.repos);

  return Q.all([
      reposGetAll({ }),
      userGetOrgs({ per_page: 100 })
        .then(function(orgs) {
          return Q.all(orgs.map(function(org) {
            return reposGetFromOrg({ org: org.login, per_page: 100 });
          }));
        })
    ]).spread(function(userRepos, orgsWithRepos) {
      // Merge stuff together
      var orgRepos = orgsWithRepos.reduce(function(memo, org) { memo.push.apply(memo, org); return memo; }, []);
      userRepos.push.apply(userRepos, orgRepos);
      return userRepos;
    });
}

exports.list = function(req, res, next) {
  return findAllRepos(req.session.account.accessToken)
    .then(function(repos) {
      res.render('github', {
        endpoint: req.query.endpoint,
        repos: repos,
        events: [
          { id: "push",                        name: "Push",                        description: "Any git push to a Repository.",                                                                                                           selected: true },
          { id: "issues",                      name: "Issues",                      description: "Any time an Issue is opened or closed.",                                                                                                  selected: false },
          { id: "issue_comment",               name: "Issue Comment",               description: "Any time an Issue is commented on.",                                                                                                      selected: false },
          { id: "commit_comment",              name: "Commit Comment",              description: "Any time a Commit is commented on.",                                                                                                      selected: false },
          { id: "pull_request",                name: "Pull Request",                description: "Any time a Pull Request is opened, closed, or synchronized (updated due to a new push in the branch that the pull request is tracking).", selected: false },
          { id: "pull_request_review_comment", name: "Pull Request Review Comment", description: "Any time a Commit is commented on while inside a Pull Request review (the Files Changed tab).",                                           selected: false },
          { id: "gollum",                      name: "Wiki",                        description: "Any time a Wiki page is updated.",                                                                                                        selected: false },
          { id: "watch",                       name: "Watch",                       description: "Any time a User watches the Repository.",                                                                                                 selected: false },
          { id: "release",                     name: "Release",                     description: "Any time a Release is published in the Repository.",                                                                                      selected: false },
          { id: "fork",                        name: "Fork",                        description: "Any time a Repository is forked.",                                                                                                        selected: false },
          { id: "member",                      name: "Member",                      description: "Any time a User is added as a collaborator to a non-Organization Repository.",                                                            selected: false },
          { id: "public",                      name: "Public",                      description: "Any time a Repository changes from private to public.",                                                                                   selected: false },
          { id: "team_add",                    name: "Team Add",                    description: "Any time a team is added or modified on a Repository.",                                                                                   selected: false },
          { id: "status",                      name: "Status",                      description: "Any time a Repository has a status update from the API",                                                                                  selected: false },
        ]
      });
    })
    .fail(next);
};

exports.submit = function(req, res, next) {
  var endpoint = req.body.endpoint;

  var events = req.body.events;
  if(!Array.isArray(events)) events = [events];

  var repos = req.body.repos;
  if(!Array.isArray(repos)) repos = [repos];

  return Q.all(repos.map(function(repo) {
    // Set the repo up....
    }))
    .then(function() {
      // Redirect after post
      res.redirect('/github/submit');
    })
    .fail(next);

};

exports.complete = function(req, res, next) {
  res.render('complete', {});
};