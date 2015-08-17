// Generated by CoffeeScript 1.9.3
(function() {
  var helloTest;

  module.exports = {
    echoBackHello: function(name, successCallback, errorCallback) {
      return cordova.exec(successCallback, errorCallback, 'PhotoAssets', 'echoBackHello', [name]);
    }
  };

  helloTest = function() {
    return PhotoAssets.echoBackHello('Cordova World', function(message) {
      return alert(message);
    }, function() {
      return alert('Error calling Hello Plugin');
    });
  };

  document.addEventListener('deviceready', helloTest, false);

}).call(this);
