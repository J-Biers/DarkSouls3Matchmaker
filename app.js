/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

/*---Requires---*/

var express = require('express');	// This application uses express as its web server.  For more info, see: http://expressjs.com
var cfenv = require('cfenv'); 		// cfenv provides access to your Cloud Foundry environment. For more info, see: https://www.npmjs.com/package/cfenv

var mysql = require('mysql');


/*---Global vars---*/

var maxHostIDInt = 0;
var maxPhantomIDInt = 0;

var bonfireList = [];
var hostList = [];
var phantomList = [];

/*---Object Prototypes---*/


/*---Functions*---*/

function addHost(nameStr, hostResponse, bonfireID)
{
	//Adds a host
	//Returns the hostID of the added host
	
	//Add the host
	//TODO: Add host
}

function removeHost(hostID)
{
	//Removes a host
	
	//TODO: Remove host
}

function addPhantom(nameStr, phantomResponse, bonfireIDList)
{
	//Adds a host
	//Returns the phantomID of the added host

	//TODO: Add phantom
}

function removePhantom(phantomID)
{
	//Removes a phantom
	
	//TODO: Remove phantom
}

function extractBonfireArray(queryObj)
{
	//Returns an array of bonfire IDs from the query string
	var bonfireIDs = [];
	
	//loop through the JSON object
	for (var key in queryObj)
	{
		//Add the key to the list if it is a number
		var bonfireInt = parseInt(key);
		if (!isNaN(bonfireInt))
		{
			console.log("Extracted bonfire " + key);
			bonfireIDs.push(parseInt(key));
		}
	}
	
	//Return the bonfire array
	return bonfireIDs;
}

/*---code---*/

//Connect to mysql
var dbConnection = mysql.createConnection(
{
	host     : 'us-cdbr-iron-east-03.cleardb.net',
	user     : 'b40e8494d3bfb7',
	password : '91e02fa1',
});
dbConnection.connect(function(err)
{
	console.log("Connected to cleardb");
	
	//Use the database
	dbConnection.query("USE ad_967b35b36ba55e1");
	
	//Create the table of hosts
	dbConnection.query("CREATE TABLE Hosts(HostID int, Name varchar(255))");
	
	//Create the table of phantoms
	dbConnection.query("CREATE TABLE Phantoms(PhantomID int, Name varchar(255)) ");
	
	//Create the table mapping hosts to bonfires
	dbConnection.query("CREATE TABLE HostBonfires(HostID int, BonfireID int) ");
	
	//Create the table mapping phantoms to bonfires
	dbConnection.query("CREATE TABLE PhantomBonfires(PhantomID int, BonfireID int) ");
	
	//Create the table of matches
	dbConnection.query("CREATE TABLE Matches(HostID int, PhantomID int, Password varchar(16), HostClaimed int, PhantomClaimed int)");
	
	//TODO: Set up events for SQL
});

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


//Respond to addClient request
app.get('/addClient', function (req, res)
{
	console.log('received addClient request');
	console.log('path = ' + req.path);
	
	//Create the bonfire array
	var bonfireIDList = extractBonfireArray(req.query);
	
	//Add the client
	if (req.query.clientType == 'Host')
	{
		//Add the host
		addHost(req.query.name, res, bonfireIDList[0]);
	}
	else
	{
		addPhantom(req.query.name, res, bonfireIDList);
	}
});

//start server on the specified port and binding host
var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  	console.log("server starting on " + appEnv.url);
});
