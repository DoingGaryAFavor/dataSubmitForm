var express = require('express');

var app = express();

app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());

app.get('/', function(req, res) {
  res.render('main', {});
});

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
        /*if (user.get("downVotes").indexOf(request.params.objectId) != -1) {
          return false;
        } else {*/
          upVote(user, request.params.objectId, {
            success: function(result) {
              response.success(result);
            }, error: function(error) {
              response.error(error);
            }
          });
       // }
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
        /*if (user.get("upVotes").indexOf(request.params.objectId) != -1) {
          return;
        } else {*/
          downVote(user, request.params.objectId, {
            success: function(result) {
              response.success(result);
            }, error: function(error) {
              response.error(error);
            }
          });
        //}
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
    var ratingCalculation = 0;
    if (deal.get("upVotes") != 0) 
      ratingCalculation = (100 * (deal.get("upVotes") / (deal.get("upVotes") + deal.get("downVotes"))));
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
    var ratingCalculation = 0;
    if (deal.get("upVotes") != 0)
      ratingCalculation = (100 * (deal.get("downVotes") / (deal.get("upVotes") + deal.get("downVotes"))));
    deal.set("rating", ratingCalculation);
    deal.save();
    options.success("Successfully updated down vote value of deal " + objectId + " by " + value);
  }, function(error) {
    options.error("Could not update down vote value of deal " + objectId);
  });
}