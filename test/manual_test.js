GLOBAL.apiKey = process.env.PACKPIN_NODEJS_SDK_API_KEY || ''; // please use your packpin api key

if (!GLOBAL.apiKey) {
	console.log('No API Key Provided');
	process.exit(1);
}

var packpin = require('../main.js')(GLOBAL.apiKey);
/*
packpin.getCarriers(function(err, result) {
  console.log("-- getCarriers --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.detectCarriers('058200005422993', function(err, result) {
  console.log("-- detectCarriers --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.createTracking('058200005422993', 'dpd', {description: "mylittleshipment"}, function(err, result) {
  console.log("-- createTracking --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.getTracking('058200005422993', 'dpd', function(err, result) {
  console.log("-- getTracking --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.getTrackings( function(err, result) {
  console.log("-- getTrackings --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.updateTracking('058200005422993', 'dpd', "myothership", function(err, result) {
  console.log("-- updateTracking --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});

packpin.deleteTracking('058200005422993', 'dpd', function(err, result) {
  console.log("-- deleteTracking --");
  console.log("ERR:");
  console.log(err);
  console.log("RESULT:");
  console.log(result);
});
