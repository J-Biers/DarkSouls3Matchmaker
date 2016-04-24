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

function addHost(nameStr, hostResponse, bonfireID)
{
	//Adds a host
	//Returns the hostID of the added host
	
	//Get an id
	var hostID = maxHostID;
	maxHostID++;
	
	//Insert into the host table
	dbConnection.query("INSERT INTO Hosts (HostID, Name) VALUES (" + hostID + ", '" + nameStr + "')");
	hostResponseList.push(hostResponse);
	
	//Insert into the bonfire table
	dbConnection.query("INSERT INTO HostBonfires (HostID, BonfireID) VALUES (" + hostID + ", " + bonfireID + ")");
	
	return hostID;
}

function removeHost(hostID)
{
	//Removes a host
	dbConnection.query("DELETE FROM Hosts WHERE HostID=" + hostID);
	dbConnection.query("DELETE FROM HostBonfires WHERE HostID=" + hostID);
}

function addPhantom(nameStr, phantomResponse, bonfireIDList)
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
		dbConnection.query("INSERT INTO PhantomBonfires (PhantomID, BonfireID) VALUES (" + phantomID + ", " + bonfireIDList[i] + ")");
	}
	
	//Return phantomID
	return phantomID;
}

function removePhantom(phantomID)
{
	//Removes a phantom
	
	//Remove phantom
	dbConnection.query("DELETE FROM Phantoms WHERE PhantomID=" + phantomID);
	dbConnection.query("DELETE FROM PhantomBonfires WHERE PhantomID=" + phantomID);
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
	dbConnection.query("")
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
	createTable("Hosts", "HostID int, Name varchar(255)");
	
	//Create the table of phantoms
	createTable("Phantoms", "PhantomID int, Name varchar(255)");
	
	//Create the table mapping hosts to bonfires
	createTable("HostBonfires", "HostID int, BonfireID int");
	
	//Create the table mapping phantoms to bonfires
	createTable("PhantomBonfires", "PhantomID int, BonfireID int");
	
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
	if (req.query.clientType === 'Host')
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
