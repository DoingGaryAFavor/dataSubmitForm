/**
 * Login With GitHub
 *
 * An example web application implementing OAuth2 in Cloud Code
 *
 * There will be four routes:
 * / - The main route will show a page with a Login with GitHub link
 *       JavaScript will detect if it's logged in and navigate to /main
 * /authorize - This url will start the OAuth process and redirect to GitHub
 * /oauthCallback - Sent back from GitHub, this will validate the authorization
 *                    and create/update a Parse User before using 'become' to
 *                    set the user on the client side and redirecting to /main
 * /main - The application queries and displays some of the users GitHub data
 *
 * @author Fosco Marotto (Facebook) <fjm@fb.com>
 */

/**
 * Load needed modules.
 */
var express = require('express');
var querystring = require('querystring');
var _ = require('underscore');
var Buffer = require('buffer').Buffer;

/**
 * Create an express application instance
 */
var app = express();

/**
* GitHub specific details, including application id and secret
*/
var githubClientId = '184f505d6bd27c4c52c9';
var githubClientSecret = '45052c86e58d22e7fbcf90d39d443cb98a514461';

var githubRedirectEndpoint = 'https://github.com/login/oauth/authorize?';
var githubValidateEndpoint = 'https://github.com/login/oauth/access_token';
var githubUserEndpoint = 'https://api.github.com/user';

/**
 * In the Data Browser, set the Class Permissions for these 2 classes to
 *   disallow public access for Get/Find/Create/Update/Delete operations.
 * Only the master key should be able to query or write to these classes.
 */
var TokenRequest = Parse.Object.extend("TokenRequest");
var TokenStorage = Parse.Object.extend("TokenStorage");

/**
 * Create a Parse ACL which prohibits public access.  This will be used
 *   in several places throughout the application, to explicitly protect
 *   Parse User, TokenRequest, and TokenStorage objects.
 */
var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

/**
 * Global app configuration section
 */

app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

/**
 * Main route.
 *
 * When called, render the login.ejs view
 */
app.get('/', function(req, res) {
  res.render('login', {});
});

/**
 * Login with GitHub route.
 *
 * When called, generate a request token and redirect the browser to GitHub.
 */
app.get('/authorize', function(req, res) {

  var tokenRequest = new TokenRequest();
  // Secure the object against public access.
  tokenRequest.setACL(restrictedAcl);
  /**
   * Save this request in a Parse Object for validation when GitHub responds
   * Use the master key because this class is protected
   */
  tokenRequest.save(null, { useMasterKey: true }).then(function(obj) {
    /**
     * Redirect the browser to GitHub for authorization.
     * This uses the objectId of the new TokenRequest as the 'state'
     *   variable in the GitHub redirect.
     */
    res.redirect(
      githubRedirectEndpoint + querystring.stringify({
        client_id: githubClientId,
        state: obj.id
      })
    );
  }, function(error) {
    // If there's an error storing the request, render the error page.
    res.render('error', { errorMessage: 'Failed to save auth request.'});
  });

});

/**
 * OAuth Callback route.
 *
 * This is intended to be accessed via redirect from GitHub.  The request
 *   will be validated against a previously stored TokenRequest and against
 *   another GitHub endpoint, and if valid, a User will be created and/or
 *   updated with details from GitHub.  A page will be rendered which will
 *   'become' the user on the client-side and redirect to the /main page.
 */
app.get('/oauthCallback', function(req, res) {
  var data = req.query;
  var token;
  /**
   * Validate that code and state have been passed in as query parameters.
   * Render an error page if this is invalid.
   */
  if (!(data && data.code && data.state)) {
    res.render('error', { errorMessage: 'Invalid auth response received.'});
    return;
  }
  var query = new Parse.Query(TokenRequest);
  /**
   * Check if the provided state object exists as a TokenRequest
   * Use the master key as operations on TokenRequest are protected
   */
  Parse.Cloud.useMasterKey();
  Parse.Promise.as().then(function() {
    return query.get(data.state);
  }).then(function(obj) {
    // Destroy the TokenRequest before continuing.
    return obj.destroy();
  }).then(function() {
    // Validate & Exchange the code parameter for an access token from GitHub
    return getGitHubAccessToken(data.code);
  }).then(function(access) {
    /**
     * Process the response from GitHub, return either the getGitHubUserDetails
     *   promise, or reject the promise.
     */
    var githubData = access.data;
    if (githubData && githubData.access_token && githubData.token_type) {
      token = githubData.access_token;
      return getGitHubUserDetails(token);
    } else {
      return Parse.Promise.error("Invalid access request.");
    }
  }).then(function(userDataResponse) {
    /**
     * Process the users GitHub details, return either the upsertGitHubUser
     *   promise, or reject the promise.
     */
    var userData = userDataResponse.data;
    if (userData && userData.login && userData.id) {
      return upsertGitHubUser(token, userData);
    } else {
      return Parse.Promise.error("Unable to parse GitHub data");
    }
  }).then(function(user) {
    /**
     * Render a page which sets the current user on the client-side and then
     *   redirects to /main
     */
    res.render('store_auth', { sessionToken: user.getSessionToken() });
  }, function(error) {
    /**
     * If the error is an object error (e.g. from a Parse function) convert it
     *   to a string for display to the user.
     */
    if (error && error.code && error.error) {
      error = error.code + ' ' + error.error;
    }
    res.render('error', { errorMessage: JSON.stringify(error) });
  });

});

/**
 * Logged in route.
 *
 * JavaScript will validate login and call a Cloud function to get the users
 *   GitHub details using the stored access token.
 */
app.get('/main', function(req, res) {
  res.render('main', {});
});

/**
 * Attach the express app to Cloud Code to process the inbound request.
 */
app.listen();

/**
 * Cloud function which will load a user's accessToken from TokenStorage and
 * request their details from GitHub for display on the client side.
 */
Parse.Cloud.define('getGitHubData', function(request, response) {
  if (!request.user) {
    return response.error('Must be logged in.');
  }
  var query = new Parse.Query(TokenStorage);
  query.equalTo('user', request.user);
  query.ascending('createdAt');
  Parse.Promise.as().then(function() {
    return query.first({ useMasterKey: true });
  }).then(function(tokenData) {
    if (!tokenData) {
      return Parse.Promise.error('No GitHub data found.');
    }
    return getGitHubUserDetails(tokenData.get('accessToken'));
  }).then(function(userDataResponse) {
    var userData = userDataResponse.data;
    response.success(userData);
  }, function(error) {
    response.error(error);
  });
});

/**
 * This function is called when GitHub redirects the user back after
 *   authorization.  It calls back to GitHub to validate and exchange the code
 *   for an access token.
 */
var getGitHubAccessToken = function(code) {
  var body = querystring.stringify({
    client_id: githubClientId,
    client_secret: githubClientSecret,
    code: code
  });
  return Parse.Cloud.httpRequest({
    method: 'POST',
    url: githubValidateEndpoint,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Parse.com Cloud Code'
    },
    body: body
  });
}

/**
 * This function calls the githubUserEndpoint to get the user details for the
 * provided access token, returning the promise from the httpRequest.
 */
var getGitHubUserDetails = function(accessToken) {
  return Parse.Cloud.httpRequest({
    method: 'GET',
    url: githubUserEndpoint,
    params: { access_token: accessToken },
    headers: {
      'User-Agent': 'Parse.com Cloud Code'
    }
  });
}

/**
 * This function checks to see if this GitHub user has logged in before.
 * If the user is found, update the accessToken (if necessary) and return
 *   the users session token.  If not found, return the newGitHubUser promise.
 */
var upsertGitHubUser = function(accessToken, githubData) {
  var query = new Parse.Query(TokenStorage);
  query.equalTo('githubId', githubData.id);
  query.ascending('createdAt');
  // Check if this githubId has previously logged in, using the master key
  return query.first({ useMasterKey: true }).then(function(tokenData) {
    // If not, create a new user.
    if (!tokenData) {
      return newGitHubUser(accessToken, githubData);
    }
    // If found, fetch the user.
    var user = tokenData.get('user');
    return user.fetch({ useMasterKey: true }).then(function(user) {
      // Update the accessToken if it is different.
      if (accessToken !== tokenData.get('accessToken')) {
        tokenData.set('accessToken', accessToken);
      }
      /**
       * This save will not use an API request if the token was not changed.
       * e.g. when a new user is created and upsert is called again.
       */
      return tokenData.save(null, { useMasterKey: true });
    }).then(function(obj) {
      // Return the user object.
      return Parse.Promise.as(user);
    });
  });
}

/**
 * This function creates a Parse User with a random login and password, and
 *   associates it with an object in the TokenStorage class.
 * Once completed, this will return upsertGitHubUser.  This is done to protect
 *   against a race condition:  In the rare event where 2 new users are created
 *   at the same time, only the first one will actually get used.
 */
var newGitHubUser = function(accessToken, githubData) {
  var user = new Parse.User();
  // Generate a random username and password.
  var username = new Buffer(24);
  var password = new Buffer(24);
  _.times(24, function(i) {
    username.set(i, _.random(0, 255));
    password.set(i, _.random(0, 255));
  });
  user.set("username", username.toString('base64'));
  user.set("password", password.toString('base64'));
  // Sign up the new User
  return user.signUp().then(function(user) {
    // create a new TokenStorage object to store the user+GitHub association.
    var ts = new TokenStorage();
    ts.set('githubId', githubData.id);
    ts.set('githubLogin', githubData.login);
    ts.set('accessToken', accessToken);
    ts.set('user', user);
    ts.setACL(restrictedAcl);
    // Use the master key because TokenStorage objects should be protected.
    return ts.save(null, { useMasterKey: true });
  }).then(function(tokenStorage) {
    return upsertGitHubUser(accessToken, githubData);
  });
}

Parse.Cloud.define("upVote", function(request, response) {
  Parse.Cloud.useMasterKey();
  var deviceQuery = new Parse.Query(Parse.Object.extend("User"));
  deviceQuery.equalTo("deviceId", request.params.deviceId);
  deviceQuery.first({
    success: function (user) {
      if (typeof user == "undefined") {
        var userClass = Parse.Object.extend("User");
        var user = new userClass();
        user.save(
          {deviceId: request.params.deviceId, upVotes: [], downVotes: [],
            username: request.params.deviceId, password: ""},{
          success:function(user) {
            Parse.Cloud.run("upVote", request.params, {
              success: function(result) {
                response.success(result);
              }, error: function(error) {
                response.error(error);
              }
            });
          }, error:function(user, error) {
            response.error("Unable to create user" + error.message);
          }
        });
      } else if (user.get("upVotes").indexOf(request.params.objectId) == -1) {
        if (user.get("downVotes").indexOf(request.params.objectId) != -1) {
          undoDownVote(user, request.params.objectId, {
            success: function(result) {
              upVote(user, request.params.objectId, {
                success: function(result) {
                  response.success(result);
                }, error: function(error) {
                  response.error(error);
                }
              });
            }, error: function(error) {
              response.error(error);
            }
          });
        } else {
          upVote(user, request.params.objectId, {
            success: function(result) {
              response.success(result);
            }, error: function(error) {
              response.error(error);
            }
          });
        }
      } else {
        response.error("User has already up voted the deal: " + request.params.objectId);
      }
    }, error: function (error) {
      response.error("Failed to find device " + request.params.deviceId + error.code);
    }
  });
})

Parse.Cloud.define("downVote", function(request, response) {
  Parse.Cloud.useMasterKey();
  var deviceQuery = new Parse.Query(Parse.Object.extend("User"));
  deviceQuery.equalTo("deviceId", request.params.deviceId);
  deviceQuery.first({
    success: function (user) {
      if (typeof user == "undefined") {
        var userClass = Parse.Object.extend("User");
        var user = new userClass();
        user.save(
          {deviceId: request.params.deviceId, upVotes: [], downVotes: [],
            username: request.params.deviceId, password: ""},{
          success:function(user ) {
            Parse.Cloud.run("downVote", request.params, {
              success: function(result) {
                response.success(result);
              }, error: function(error) {
                response.error(error);
              }
            });
          }, error:function(user, error) {
            response.error("Unable to create user" + error.message);
          }
        });
      } else if (user.get("downVotes").indexOf(request.params.objectId) == -1) {
        if (user.get("upVotes").indexOf(request.params.objectId) != -1) {
          undoUpVote(user, request.params.objectId, {
            success: function(result) {
              downVote(user, request.params.objectId, {
                success: function(result) {
                  response.success(result);
                }, error: function(error) {
                  response.error(error);
                }
              });
            }, error: function(error) {
              response.error(error);
            }
          });
        } else {
          downVote(user, request.params.objectId, {
            success: function(result) {
              response.success(result);
            }, error: function(error) {
              response.error(error);
            }
          });
        }
      } else {
        response.error("User has already down voted the deal: " + request.params.objectId);
      }
    }, error: function (error) {
      response.error("Failed to find device " + request.params.deviceId + error.code);
    }
  });
})

Parse.Cloud.define("undoUpVote", function(request, response) {
  Parse.Cloud.useMasterKey();
  var deviceQuery = new Parse.Query(Parse.Object.extend("User"));
  deviceQuery.equalTo("deviceId", request.params.deviceId);
  deviceQuery.first({
    success: function (user) {
      undoUpVote(user, request.params.objectId, {
        success: function(result) {
          response.success("Successfully reverted up vote on deal " + request.params.objectId);
        }, error: function(error) {
          response.error(error);
        }
      });
    }, error: function (error) {
      response.error("Failed to revert up vote on deal " + deal.id + error.code);
    }
  });
})

Parse.Cloud.define("undoDownVote", function(request, response) {
  Parse.Cloud.useMasterKey();
  var deviceQuery = new Parse.Query(Parse.Object.extend("User"));
  deviceQuery.equalTo("deviceId", request.params.deviceId);
  deviceQuery.first({
    success: function (user) {
      undoDownVote(user, request.params.objectId, {
        success: function(result) {
          response.success("Successfully reverted down vote on deal " + request.params.objectId);
        }, error: function(error) {
          response.error(error);
        }
      });
    }, error: function (error) {
      response.error("Failed to revert down vote on deal " + deal.id + error.code);
    }
  });
})

function upVote (user, objectId, options) {
  user.add("upVotes", objectId);
  user.save();
  updateUpVote(objectId, 1, {
    success: function(result) {
      options.success(result);
    }, error: function(error) {
      options.error(error);
    }
  });
}

function undoUpVote (user, objectId, options) {
  user.remove("upVotes", objectId);
  user.save();
  updateUpVote(objectId, -1, {
    success: function(result) {
      options.success(result);
    }, error: function(error) {
      options.error(error);
    }
  });
}

function downVote (user, objectId, options) {
  user.add("downVotes", objectId);
  user.save();
  updateDownVote(objectId, 1, {
    success: function(result) {
      options.success(result);
    }, error: function(error) {
      options.error(error);
    }
  });
}

function undoDownVote (user, objectId, options) {
  user.remove("downVotes", objectId);
  user.save();
  updateDownVote(objectId, -1, {
    success: function(result) {
      options.success(result);
    }, error: function(error) {
      options.error(error);
    }
  });
}

function updateUpVote (objectId, value, options) {
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.equalTo("objectId", objectId);
  query.get().then(function(deal) {
    deal.increment("upVotes", value);
    var ratingCalculation = (100 * (deal.get("upVotes") / (deal.get("upVotes") + deal.get("downVotes"))));
    deal.set("rating", ratingCalculation);
    deal.save();
    options.success("Successfully updated up vote value of deal " + objectId + " by " + value);
  }, function(error) {
    options.error("Could not update up vote value of deal " + objectId);
  });
}

function updateDownVote (objectId, value, options) {
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.equalTo("objectId", objectId);
  query.get().then(function(deal) {
    deal.increment("downVotes", value);
    var ratingCalculation = (100 * (deal.get("upVotes") / (deal.get("upVotes") + deal.get("downVotes"))));
    deal.set("rating", ratingCalculation);
    deal.save();
    options.success("Successfully updated down vote value of deal " + objectId + " by " + value);
  }, function(error) {
    options.error("Could not update down vote value of deal " + objectId);
  });
}

Parse.Cloud.define("zeroUpVotes", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.greaterThan("upVotes", 0);
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        // console.log("Inside for loop");
        // console.log("Deal number " + i + " with " + deal[i].get("upVotes") + " up votes");
        deal[i].set("upVotes", 0);
        deal[i].save();
        // console.log("After deal save, deal up vote is now: " + deal[i].get("upVotes"));
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it.
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished.
          return result.save();
        });
      });
      return promise;
  }).then(function() {
    // Every deal was updated
    response.success("Finished setting all up vote values to zero");;
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});

Parse.Cloud.define("setUpVotes", function(request, response) {
  Parse.Cloud.useMasterKey();
  Parse.Config.get().then(function(config) {
    console.log("We got the config values");
    var ceiling = config.get("upVoteCeiling");
    var query = new Parse.Query(Parse.Object.extend("deals"));
    query.equalTo("upVotes", 0);
    query.find().then(function(deal) {
        for (var i = 0; i < deal.length; i++) {
          deal[i].set("upVotes", Math.floor((Math.random() * ceiling) + 1));
          deal[i].save(); 
        }
        // use promise to extend the time response.success is called
        var promise = Parse.Promise.as();
        _.each(deal, function(result) {
          // For each item, extend the promise with a function to save it
          promise = promise.then(function() {
            // Return a promise that will be resolved when the saves are finished
            return result.save();
          });
        });
        return promise;
    }).then(function() {
      // Every deal was updated
      response.success("Finished updating all up vote values");
    }, function(error) {
      response.error("Got an error " + error.code + " : " + error.message + ".");
    });
  });
});
  
Parse.Cloud.define("zeroDownVotes", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.greaterThan("downVotes", 0);
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        // console.log("Inside for loop");
        // console.log("Deal number " + i + " with " + deal[i].get("downVotes") + " down votes");
        deal[i].set("downVotes", 0);
        deal[i].save();
        // console.log("After deal save, deal down vote is now: " + deal[i].get("downVotes"));
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished
          return result.save();
        });
      });
      return promise;
  }).then(function() {
  // Every deal was updated
    response.success("Finished setting all down vote values to zero");
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});

Parse.Cloud.define("zeroRatings", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.greaterThan("rating", 0);
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        // console.log("Inside for loop");
        // console.log("Deal number " + i + " with " + deal[i].get("downVotes") + " down votes");
        deal[i].set("rating", 0);
        deal[i].save();
        // console.log("After deal save, deal down vote is now: " + deal[i].get("downVotes"));
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished
          return result.save();
        });
      });
      return promise;
  }).then(function() {
  // Every deal was updated
    response.success("Finished setting all down vote values to zero");
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});

Parse.Cloud.define("setDownVotes", function(request, response) {
  Parse.Cloud.useMasterKey();
  Parse.Config.get().then(function(config) {
    console.log("We got the config values");
    var ceiling = config.get("downVoteCeiling");
    var query = new Parse.Query(Parse.Object.extend("deals"));
    query.equalTo("downVotes", 0);
    query.find().then(function(deal) {
        for (var i = 0; i < deal.length; i++) {
          deal[i].set("downVotes", Math.floor((Math.random() * ceiling) + 1));
          deal[i].save(); 
        }
        // use promise to extend the time response.success is called
        var promise = Parse.Promise.as();
        _.each(deal, function(result) {
          // For each item, extend the promise with a function to save it
          promise = promise.then(function() {
            // Return a promise that will be resolved when the saves are finished
            return result.save();
          });
        });
        return promise;
    }).then(function() {
      // Every deal was updated
      response.success("Finished updating all down vote values");
    }, function(error) {
      response.error("Got an error " + error.code + " : " + error.message + ".");
    });
  });
});

Parse.Cloud.define("eraseDealTags", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.notEqualTo("tags", []);
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        // console.log("Inside if function");
        deal[i].set("tags", []);
        deal[i].save();
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished
          return result.save();
        });
      });
      return promise;
  }).then(function() {
    // Every deal was updated
    response.success("Finished deleting all deal tag values");
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});

Parse.Cloud.define("assignDealTags", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.greaterThan("upVotes", 300);
  query.notEqualTo("tags", "featured");
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        // console.log("Inside if function");
        deal[i].addUnique("tags", "featured");
        deal[i].save();
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished
          return result.save();
        });
      });
      return promise;
  }).then(function() {
    // Every deal was updated
    response.success("Finished assigning featured tags to deals");
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});

Parse.Cloud.define("updateRatings", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Object.extend("deals"));
  query.find().then(function(deal) {
      for (var i = 0; i < deal.length; i++) {
        var ratingCalculation = (100 * (deal[i].get("upVotes") / (deal[i].get("upVotes") + deal[i].get("downVotes"))));
        deal[i].set("rating", ratingCalculation);
        deal[i].save();
      }
      // use promise to extend the time response.success is called
      var promise = Parse.Promise.as();
      _.each(deal, function(result) {
        // For each item, extend the promise with a function to save it
        promise = promise.then(function() {
          // Return a promise that will be resolved when the saves are finished
          return result.save();
        });
      });
      return promise;
  }).then(function() {
    // Every deal was updated
    response.success("Finished updating ratings");
  }, function(error) {
    response.error("Got an error " + error.code + " : " + error.message + ".");
  });
});