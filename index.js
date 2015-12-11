var argo = require('argo');
var querystring = require('querystring');
var request = require('request');

var zetta = require('zetta-client')()
  .connect('https://zetta-cloud-2.herokuapp.com');

var displayQuery = zetta
  .from('Detroit')
  .where({ type: 'display' });

argo()
.post('^/display$', function(handle) {
  handle('request', function(env, next) {
    env.request.getBody(function(err, body) {
      // REQUEST
      if (err) {
        env.response.statusCode = 400;
        next(env);
        return;
      }
      env.request.body = querystring.parse(body.toString());
      var displayMessage = '"' + env.request.body.text + '" -@' + env.request.body.user_name;
      zetta.observe(displayQuery, function(display) {
        display.call('change', displayMessage, function(err) {
          if (err) {
            console.error(err);
          } else {
            console.log('success');
          }
        });
      });
      // Into Slack WebHook Response
      var webhookResponse = {
        text: '@' + env.request.body.user_name + ' posted to /display.',
        attachments: [
          {
            text: 'view: https://video.nest.com/live/zettajs'
          }
        ]
      };
      console.log('sending inbound webhook...');
      request.post(
        env.request.body.response_url,
        webhookResponse,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
        }
      );
      // API RESPONSE
      env.response.statusCode = 200;
      next(env);
    });
  });
})
.listen(process.env.PORT || 5000)