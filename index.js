var argo = require('argo');
var querystring = require('querystring');
var lcd = require('request');

var lcdOptions = { 
  method: 'POST',
  url: 'http://zetta-cloud-2.herokuapp.com/servers/Detroit/devices/0d919602-8755-4727-9832-970efc17c63d',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: { action: 'change' }
};

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
      lcdOptions.form.message = '"' + env.request.body.text + '" -@' + env.request.body.user_name;
      lcd(lcdOptions, function (error, response, body) {
        if (error) throw new Error(error);
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