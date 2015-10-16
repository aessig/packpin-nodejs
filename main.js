/**
 * NodeJS interface for the PackPin API.
 * From docs here: https://packpin.com/docs/trackings/trackings-collection/
 *
 * @author Aurélien Essig (auressig@gmail.com)
 * @copyright Copyright (C) 2013
 * @license GNU General Public License, version 2 (see LICENSE.md)
 */


/**
 *
 * Error Type
 * 600, 'UnhandledError'
 * 601, 'ParseResponseError', 'Could not parse response.'
 * 602, 'MissingParameter', 'Missing Required Parameter: tracking number.'
 * 603, 'ResponseError', 'Invalid response body.'
 */

var _ = require('lodash');

/**
 * Hostname for PackPin API.
 * @type {string}
 * @private
 */
var request_hostname = process.env.PACKPIN_NODEJS_SDK_HOST || 'api.packpin.com';

/**
 * Port for PackPin API.
 * @type {number}
 * @private
 */
var request_post = process.env.PACKPIN_NODEJS_SDK_PORT || 443;

var protocol = ((request_post === 443) ? 'https' : 'http');

var request = require('request');

/**
 * Path for PackPin API.
 * @type {string}
 * @const
 * @private
 */
var API_PATH = '/v2';

/**
 * timeout of each request in milliseconds
 * @const
 * @type {number}
 */
var TIMEOUT = 30000;

/**
 * Initializes the PackPin plugin.
 * @param {string} api_key - PackPin api key
 * @param {?object=} options
 * @return {Object.<string,function>}
 */
module.exports = function(api_key, options) {
	'use strict';

	// Require API key
	if (!api_key) {
		return {};
	}

  // Set options
  options = options || {};
  if (!isNaN(options.timeout) && options.timeout > 0) TIMEOUT = parseInt(options.timeout);

	/**
	 * Return the error object for callback use
	 * @param code {!number} - meta.code
	 * @param type  {!string}- meta.type
	 * @param message {!string} - meta.message
	 * @returns {{code: *, type: *, message: *}}
	 * @private
	 */
	function _getError(code, type, message) {
		return {
			code: code,
			type: type,
			message: message
		};
	}

	/**
	 * serial object to url query string
	 * @param obj {Object} - hash
	 * @returns {string} - output serialized string
	 * @private
	 */
	function _serialize(obj) {
		var str = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				str.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
			}
		}
		return str.join('&');
	}

	/**
	 * Performs an API request.
	 * @param method {string} - method The HTTP method.
	 * @param path {string} - path The HTTP path to append to the PackPin default.
	 * @param post_body {Object} - post data body for POST requests.
	 * @param callback {function(Object, Object=)} - callback
	 * @private
	 */
	function _call(method, path, post_body, callback) {

		// Make sure path starts with a slash
		if (path.substr(0, 1) !== '/') {
			path = '/' + path;
		}

		post_body = JSON.stringify(post_body);


		var request_option = {
			url: protocol + '://' + request_hostname + ':' + request_post + API_PATH + path,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Packpin-Api-Key': api_key
			},
			timeout: TIMEOUT,
			body: post_body
		};

		request(request_option, function(err, response, body) {

			if (err) {
				callback(_getError(603, 'ResponseError', err));
			} else {
				var return_err = null;
				var return_body = null;

				//don't put callback inside try catch to prevent catching user's throw
				try {
					body = JSON.parse(body);

					if (!body || !body.meta) {
						return_err = _getError(601, 'ParseResponseError', 'Could not parse response.');
					} else {
						return_body = body;
					}
				} catch (e) {
					return_err = _getError(601, 'ParseResponseError', 'Could not parse response.');
				}

				callback(return_err, return_body);
			}

		});
	}

	return {


		/**
		 * Create a new tracking_number
		 * @param {string} tracking_number - The tracking number to track.
		 * @param {Object=} params - Additional options to attach.
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'createTracking': function(code, carrier, params, callback) {

			if (!callback) {
				callback = params;
				params = {};
			}

			if (!_.isString(code)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: tracking number.'));
			}

			if (!_.isString(carrier)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: carrier code.'));
			}

			params.code = code;
			params.carrier = carrier;

			_call('POST', '/trackings', {tracking: params}, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (!(body.meta.code === 201 || body.meta.code === 202)) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || !body.data.tracking || typeof body.data.tracking !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				// Return the tracking number and data
				callback(null, body.data);
			});
		},

		/**
		 * Get a tracking number with options
		 * @param {string} slug - slug of the tracking number
		 * @param {string} tracking_number    - number to get
		 * @param {Object|function(Object, Object=)} options hash
		 * https://www.packpin.com/docs/api/3.0/tracking/get-trackings-slug-tracking_number
		 *
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'getTracking': function(code, carrier, callback) {

			if (!callback) {
				callback = options;
				options = {};
			}

			if (!_.isString(code)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: tracking number.'));
			}

			if (!_.isString(carrier)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: carrier code.'));
			}

			_call('GET', '/trackings/' + carrier + '/' + code, {}, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (body.meta.code !== 200) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || !body.data.tracking || typeof body.data.tracking !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				// Return the time and checkpoints
				callback(null, body.data);
			});

			return null;
		},

		/**
		 * Gets all tracking numbers in account.
		 * @param {Object|function} options - Defined here:
		 * https://www.packpin.com/docs/api/3.0/tracking/get-trackings
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'getTrackings': function(options, callback) {
			if (!callback) {
				callback = options;
				options = {};
			}

			_call('GET', '/trackings' + '?' + _serialize(options), {}, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (body.meta.code !== 200) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || typeof body.data !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				// Return the time and checkpoints
				callback(null, body.data);
			});
		},


		/**
		 * Updates the tracking for an existing number
		 * @param {string} slug
		 * @param {string} tracking_number
		 * @param {Array} options Fields to update:
		 *  https://www.packpin.com/docs/api/3.0/tracking/put-trackings-slug-tracking_number
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'updateTracking': function(code, carrier, description, callback) {

			if (!_.isString(code)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: tracking number.'));
			}

			if (!_.isString(carrier)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: carrier code.'));
			}

			if (!_.isString(description)) {
				callback(_getError(602, 'MissingParameter', 'Missing Required Parameter: description.'));
			}

			_call('PUT', '/trackings/' + carrier + '/' + code, {description: description}, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code || body.meta.code !== 200) {
					callback(body.meta, null);
					return;
				}

				// Check for valid data contents
				if (!body.data || !body.data.tracking || typeof body.data.tracking !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				callback(null, body.data);
			});
		},

		/**
		 * Delete a specific tracking number.
		 * @param {string} slug
		 * @param {string} tracking_number
		 * @param {Object|function(Object, Object=)} required_fields - required fields object
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'deleteTracking': function(code, carrier, callback) {

			if (!callback) {
				callback = code;
			}

			_call('DELETE', '/trackings/' + carrier + '/' + code, {}, function(err, body) {

				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (body.meta.code !== 200) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || !body.data.tracking || typeof body.data.tracking !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				// Return the tracking number and slug
				callback(null, body.data);
			});
		},

		/**
		 * Gets all available couriers.
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'getCarriers': function(callback) {
			_call('GET', '/carriers', {}, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (body.meta.code !== 200) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || typeof body.data !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				callback(null, body.data);
			});
		},


		/**
		 * Detect the courier for given tracking number
		 * @param {string} tracking_number - tracking number to be detected
		 * @param {Object|function(Object, Object=)} required_fields - optional, hash of required fields
		 * possible values: {"tracking_account_number": "", "tracking_postal_code": "", "tracking_ship_date": ""}
		 * @param {string|function(Object, Object=)=} detect_mode - optional, accept "strict" or "tracking_number"
		 * @param {function(Object, Object=)} callback - callback function
		 */
		'detectCarriers': function(code, callback) {
			if (!callback) {
				callback = code;
			}

			var param = {	code: code	};

			_call('POST', '/carriers/detect/', param, function(err, body) {
				if (err) {
					callback(err, null);
					return;
				}

				// Check for valid meta code
				if (!body.meta || !body.meta.code) {
					callback(body.meta, null);
					return;
				}

				if (body.meta.code !== 200) {
					callback(body.meta, body.data);
					return;
				}

				// Check for valid data contents
				if (!body.data || !body.data.couriers || typeof body.data.couriers !== 'object') {
					callback(_getError(603, 'ResponseError', 'Invalid response body.'));
					return;
				}

				callback(null, body.data);
			});
		}

	};
};
