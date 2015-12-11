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
      console.log('incoming request body: %j', env.request.body);
      var displayMessage = '"' + env.request.body.text + '" -@' + env.request.body.user_name;
      console.log('querying for the LCD display...');
      zetta.observe(displayQuery, function(display) {
        console.log('got LCD display. sending message to LCD display...: ' +  displayMessage);
        display.call('change', displayMessage, function(err) {
          if (err) {
            console.log('failed to send message');
            console.error(err);
            // API RESPONSE
            env.response.statusCode = 400;
            next(env);
          } else {
            console.log('successfully sent message');
            // Slack WebHook Response
            var options = {
              uri: env.request.body.response_url,
              method: 'POST',
              json: {
                text: '@' + env.request.body.user_name + ' posted to /display.',
                attachments: [
                  {
                    text: 'view: https://video.nest.com/live/zettajs'
                  }
                ]
              }
            };
            console.log('sending inbound webhook to slack response_url: ' + env.request.body.response_url);
            request(options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('successfully sent webhook to slack');
                console.log(body)
              } else {
                console.log('failed to send webhook to slack');
                console.error('HTTP STATUS CODE: ' + response.statusCode);
                console.error(error);
              }
            });
            // API RESPONSE
            env.response.statusCode = 200;
            next(env);
          }
        });
      });
    });
  });
})
.listen(process.env.PORT || 5000)