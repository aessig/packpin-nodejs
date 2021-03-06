Install
=========

```
npm install packpin

```

Test
=========

- Paste your API key in ```test/tests.js```
- If you desire, update test tracking numbers in ```test/local.js```

To test, run

```
npm test


```

In case there is any fail tests, please make sure to delete the testing tracking numbers from your packpin account before a new test.


Use
=========

Reference the PackPin library:

```
var packpin = require('packpin')('API_KEY');

```

Carriers
-

#### Get carriers:

Gets a list of available carriers. Returns the total number of carriers along with an array of available carriers.

Callback:

```
err: the error message
result: the carriers object

```

Example:

```
packpin.getCarriers(function(err, result) {
  console.log('Carriers: ' + result.body);
});

```

#### Detect carriers:

Returns a list of carriers that match the tracking code

Callback:

```
err: the error message
result: the carriers object

```

Example:

```
packpin.detectCarriers(code, function(err, result) {
  console.log('Carriers: ' + result.body);
});

```


Trackings
-

#### Create a new tracking number:

You must first create a new tracking number before getting the tracking result.

Accepts:

```
tracking_number: The tracking number to track
options: An object with options to set

https://www.packpin.com/docs/api/4/tracking/post-trackings

```

Callback:

```
function(err, result)

```

Example:

```
packpin.createTracking('1Z21E98F0314447088', 'ups', {description: "My Super Parcel", track_postal_code: "XXX", track_ship_date: "2015-12-25", track_destination_country : "Switzerland" }, function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log('Created the tracking: ' + result);
  }
});

```


#### Get all trackings number in the acccount

Returns all available trackings from your account. Accepts:

Accepts:

```
options: An object with options to limit results
fields: Array of fields to return
```

callback:

```
function(err, results)

```

Example get all trackings with courier: ups

```
packpin.getTrackings({page: 1, limit: 25}, function(err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log('Total Trackings in query: ' + results.count);
    console.log(results);
  }
});

```

#### Get a specific tracking number in the account

Gets information for a specific tracking number.

Accepts:

```
slug: The slug for the tracking number, e.g., 'ups'
tracking_number: The tracking number to retrieve.
fields: Array of fields to return

```

callback:

```

function(err, result)

```

Example:

```

packpin.tracking('ups', '1Z21E98F0314447088', ['tracking_number','slug','checkpoints'], function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(result);
  }
});

```

#### Update a tracking number information

Updates tracking information for an existing tracking number.

Accepts:

```
slug: The slug for the tracking number, e.g., 'ups'
tracking_number: The tracking number to retrieve.
options: Object of fields to update

https://www.packpin.com/docs/api/4/tracking/put-trackings-slug-tracking_number

```

callback:

```
function(err, result)

```


Example:

```
packpin.updateTracking('1Z21E98F0314447088', 'ups', {title: 'My Shipment'},
  function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

```


#### Delete a tracking number

Remove a tracking code

Accepts:

```

```

callback:

```
function(err, result)

```


Example:

```
packpin.deleteTracking('1Z21E98F0314447088', 'ups',
  function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

```


License
=========

GNU v2
