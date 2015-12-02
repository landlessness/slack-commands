var argo = require('argo');
var querystring = require('querystring');

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
      // RESPONSE
      env.response.statusCode = 200;
      env.response.body = {
        response_type: 'in_channel',
        text: '@' + env.request.body.user_name + ' posted to /display.',
        attachments: [
          {
            text: 'view: https://video.nest.com/live/zettajs'
          }
        ]
      };
      next(env);
    });
  });
})
.listen(process.env.PORT || 5000)