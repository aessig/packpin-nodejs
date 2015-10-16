if (!GLOBAL.apiKey) {
	console.log('No API Key Provided');
	process.exit(1);
}

var packpin = require('../main.js')(GLOBAL.apiKey);

exports.Couriers = {

	'OK': function(test) {
		packpin.getCouriers(function(err, result) {
			test.expect(2);

			test.equal(err, null);
			test.equal(typeof result, 'object');
			test.done();
		});
	},

	'Detect Courier': function(test) {
		packpin.detectCouriers('906587618687', function(err, result) {
			test.expect(2);

			test.equal(err, null);
			test.equal(result.total, 33);
			test.done();
		});
	},

	'Detect Courier strict': function(test) {
		packpin.detectCouriers('906587618687', {}, 'strict', function(err, result) {
			test.expect(2);

			test.equal(err, null);
			test.equal(result.total, 33);
			test.done();
		});
	},

	'Detect Courier strict with postal code': function(test) {
		packpin.detectCouriers('906587618687', {'tracking_postal_code': 'DA15BU'}, 'strict', function(err, result) {
			test.expect(2);

			test.equal(err, null);
			test.equal(result.total, 33);
			test.done();
		});
	}
};
