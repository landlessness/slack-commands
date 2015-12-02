var argo = require('argo');
var querystring = require('querystring');

var lcd = require('request');

var lcdOptions = { 
  method: 'POST',
  url: 'http://zetta-cloud-2.herokuapp.com/servers/Detroit/devices/0d919602-8755-4727-9832-970efc17c63d',
  headers: 
  { 'content-type': 'application/x-www-form-urlencoded',
  'cache-control': 'no-cache' },
  form: { action: 'change' } };

argo()
.post('^/display$', function(handle) {
  handle('request', function(env, next) {
    var fullBody = '';
    env.request.on('data', function(chunk) {
      fullBody += chunk.toString();
    });
    env.request.on('end', function() {
      var decodedBody = querystring.parse(fullBody);
      console.log(fullBody);
      console.log(decodedBody);
      var fullMessage = '"' + decodedBody.text + '" -@' + decodedBody.user_name;
      console.log('changing display to: ' + fullMessage);

      lcdOptions.form.message = fullMessage;

      lcd(lcdOptions, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
      });

      env.response.statusCode = 200;
      env.response.body = {
        response_type: 'in_channel',
        text: fullMessage,
        attachments: [
          {
            text:'View the display https://video.nest.com/live/zettajs'
          }
        ]
      };
      next(env);
    });
  });
})
.listen(1337);