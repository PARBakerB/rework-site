var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

// Create connection to database
var config = {
  server: 'localhost',
  authentication: {
      type: 'default',
      options: {
          userName: 'bakerb', // update me
          password: 'password' // update me
      }
  },
  options: {
	  instanceName: 'SQLEXPRESS',
      database: 'rework',
	  trustServerCertificate: true
  }
}
var connection = new Connection(config);

function Start(callback) {
	console.log('Starting...');
	callback(null, 'M9100-11', '8GB', '128GB', '2x20');
}

function Insert(model_pn, ram_pn, storage_pn, vfd_pn, callback) {
	console.log("Inserting '"+model_pn+"' into Table...");
	request = new Request(
		'INSERT INTO phase.models (model_pn, ram_pn, storage_pn, vfd_pn) VALUES (@model_pn, @ram_pn, @storage_pn, @vfd_pn);',
		function (err, rowCount, rows) {
			if (err) {
				callback(err);
			} else {
				console.log(rowCount + ' row(s) inserted');
				callback(null, 'M9100-11');
			}
		}
	);
	request.addParameter('model_pn', TYPES.VarChar, model_pn);
    request.addParameter('ram_pn', TYPES.VarChar, ram_pn);
	request.addParameter('storage_pn', TYPES.VarChar, storage_pn);
    request.addParameter('vfd_pn', TYPES.VarChar, vfd_pn);
	connection.execSql(request);
}

function Delete(model_pn, callback) {
    console.log("Deleting '" + model_pn + "' from Table...");

    // Delete the employee record requested
    request = new Request(
        'DELETE FROM phase.models WHERE model_pn=@model_pn;',
        function(err, rowCount, rows) {
        if (err) {
            callback(err);
        } else {
            console.log(rowCount + ' row(s) deleted');
            callback(null);
        }
        });
    request.addParameter('model_pn', TYPES.VarChar, model_pn);

    // Execute SQL statement
    connection.execSql(request);
}

function Read(callback) {
    console.log('Reading rows from the Table...');

    // Read all rows from table
    request = new Request(
    'SELECT model_pn, ram_pn, storage_pn, vfd_pn FROM phase.models;',
    function(err, rowCount, rows) {
    if (err) {
        callback(err);
    } else {
        console.log(rowCount + ' row(s) returned');
        callback(null)
    }
    });

    // Print the rows read
    var result = "";
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                result += column.value + " ";
            }
        });
        console.log(result);
        result = "";
    });

    // Execute SQL statement
    connection.execSql(request);
}

function Complete(err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log("Done!");
	}
}

function makeConnection () {
	// Attempt to connect and execute queries if connection goes through
	connection.on('connect', function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Connected');
			async.waterfall([
				Start,
				Insert,
				Delete,
				Read
			], Complete)
		}
	});
	return connection;
}

function standalone () {
	connection.on('connect', function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Connected');
			async.waterfall([
				Start,
				Insert,
				Delete,
				Read
			], Complete)
		}
	});
	connection.connect();
}
//uncommenct when running as standalone
//standalone();

