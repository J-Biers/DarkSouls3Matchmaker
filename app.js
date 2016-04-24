/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

/*---Requires---*/

var express = require('express');	// This application uses express as its web server.  For more info, see: http://expressjs.com
var cfenv = require('cfenv'); 		// cfenv provides access to your Cloud Foundry environment. For more info, see: https://www.npmjs.com/package/cfenv

var mysql = require('mysql');


/*---Global vars---*/

var maxHostID = 0;
var maxPhantomID = 0;


var hostResponseList = [];
var phantomResponseList = [];

/*---Object Prototypes---*/


/*---Functions*---*/

function addHost(nameStr, platformID, hostResponse, bonfireID, addedTime)
{
	//Adds a host
	//Returns the hostID of the added host
	
	//Get an id
	var hostID = maxHostID;
	maxHostID++;
	
	//Insert into the host table
	dbConnection.query("INSERT INTO Hosts (HostID, Name) VALUES (" + hostID + ", '" + nameStr + "')");
	console.log("Inserted " + hostID + " into hosts table");
	hostResponseList.push(hostResponse);
	
	//Insert into the bonfire table
	dbConnection.query("INSERT INTO HostBonfires (HostID, BonfireID, Platform, AddedTime) VALUES (" + hostID + ", " + bonfireID + ", " + platformID + ", " + addedTime + ")");
	console.log ("Inserted " + hostID + " into hostbonfires");
	
	return hostID;
}

function removeHost(hostID)
{
	//Removes a host
	dbConnection.query("DELETE FROM Hosts WHERE HostID=" + hostID);
	dbConnection.query("DELETE FROM HostBonfires WHERE HostID=" + hostID);
}

function addPhantom(nameStr, platformID, phantomResponse, bonfireIDList, addedTime)
{
	//Adds a host
	//Returns the phantomID of the added host

	//Get an id
	var phantomID = maxPhantomID;
	maxPhantomID++;

	//Add to phantoms table
	dbConnection.query("INSERT INTO Phantoms(PhantomID, Name) VALUES (" + phantomID + ", '" + nameStr + "')");
	phantomResponseList.push(phantomResponse);
	
	//Insert all bonfires into the bonfire table
	for (i = 0; i < bonfireIDList.length; i++)
	{
		dbConnection.query("INSERT INTO PhantomBonfires (PhantomID, BonfireID, Platform) VALUES (" + phantomID + ", " + bonfireIDList[i] + ", " + platformID + ", " + addedTime + ")");
	}
	
	//Return phantomID
	return phantomID;
}

function removePhantom(phantomID)
{
	//Removes a phantom
	
	//Remove phantom
	dbConnection.query("DELETE FROM Phantoms WHERE PhantomID=" + phantomID);
	console.log("Deleted " + phantomID + " from phantoms table");
	
	dbConnection.query("DELETE FROM PhantomBonfires WHERE PhantomID=" + phantomID);
	console.log("Deleted " + phantomID + " from phantom bonfires table");
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

function createTable(tableNameStr, fieldsStr)
{
	dbConnection.query("CREATE TABLE IF NOT EXISTS " + tableNameStr + "(" + fieldsStr + ")");
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
	console.log("Using the correct database");
	
	//Create the table of hosts
	createTable("Hosts", "HostID int, Name varchar(255)");
	console.log("Created Hosts table");
	
	//Create the table of phantoms
	createTable("Phantoms", "PhantomID int, Name varchar(255)");
	console.log("Created phantoms table");
	
	//Create the table mapping hosts to bonfires
	createTable("HostBonfires", "HostID int, BonfireID int, Platform int, AddedTime int");
	console.log("Created hostbonfires table");
	
	//Create the table mapping phantoms to bonfires
	createTable("PhantomBonfires", "PhantomID int, BonfireID int, Platform int, AddedTime int");
	console.log("Created phatombonfires table");
	
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
	
	//Create the bonfire array
	var bonfireIDList = extractBonfireArray(req.query);
	
	//Add the client
	if (req.query.clientType === 'Host')
	{
		//Add the host
		addHost(req.query.name, req.query.platform, res, bonfireIDList[0], Date.now());
	}
	else
	{
		addPhantom(req.query.name, req.query.platform, res, bonfireIDList, Date.now());
	}
});

//start server on the specified port and binding host
var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  	console.log("server starting on " + appEnv.url);
});
