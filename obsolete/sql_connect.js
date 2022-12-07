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
var output = [];

function Start(callback) {
	console.log('Starting...');
	callback(null);
}

function Read(args, callback) {
	output=[];
    // Read all rows from table
    request = new Request(
    'SELECT terminal_sn FROM phase.terminals;',
    function(err, rowCount, rows) {
		if (err) {
			callback(err);
		} else {
			callback(null, args);//callback(null);
		}
    });

    // Print the rows read
    var result = "";
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                //console.log('NULL');
            } else {
                result += column.value + " ";
            }
        });
		output.push(result);
        result = "";
    });

    // Execute SQL statement
    connection.execSql(request);
}
function Insert(args, callback) {
	args.forEach(SN => {
		if (!output.includes(SN)) {
			request = new Request(
				"INSERT INTO phase.terminals(terminal_sn, ram_sn, storage_sn, vfd_sn) VALUES(@args[0], @args[1], @args[2], @args[3])",
				function(err, rowCount, rows) {
					if (err) {
						callback(err);
					} else {
						callback(null, args);//callback(null);
					}
				}
			);
		}
	});
	request.addParameter('model_pn', TYPES.VarChar, model_pn);
	request.addParameter('terminal_sn', TYPES.VarChar, terminal_sn);
	request.addParameter('vfd_sn', TYPES.VarChar, vfd_sn);
	//"INSERT INTO phase.terminals(terminal_sn, ram_sn, storage_sn, vfd_sn) VALUES('M9100-11','8GB','128','2x20')"
}

function Complete(err, result) {
	if (err) {
		console.log(err);
	} else {
	}
	connection.close();
}

function makeConnection (req_type, arg_array) {
	connection = new Connection(config);
	// Attempt to connect and execute queries if connection goes through
	switch(req_type) {
		case "Read":
			connection.on('connect', function(err) {if (err) {console.log(err);} else {
				async.waterfall([
					(callback) => {callback(null, arg_array)},
					Read
				], Complete);
			}});
			break;
		case "Insert":
			connection.on('connect', function(err) {if (err) {console.log(err);} else {
				async.waterfall([
					(callback) => {callback(null, arg_array)},
					Insert
				], Complete);
			}});
			break;
		default:
			break;
	}
	return connection;
}

function connectionReport () {
	console.log(typeof output);
	console.log(output);
	return new Promise((resolve, reject) => {
		//while (Array.isArray(output) && output.length === 0) {}
		
		resolve(output);
	});
	//return output;
}

module.exports = {makeConnection, connectionReport};

//makeConnection("Read",[]).connect();