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

var charList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";


/*---Object Prototypes---*/

function Match(bonfireID, hostName, phantomName)
{
	this.bonfireID = bonfireID;
	this.hostName = hostName;
	this.phantomName = phantomName;
	
	//Generate a password
	this.password = randomPassword();
}


/*---SQL Functions---*/

function createTable(tableNameStr, fieldsStr)
{
	dbConnection.query("CREATE TABLE IF NOT EXISTS " + tableNameStr + "(" + fieldsStr + ")");
}

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
		dbConnection.query("INSERT INTO PhantomBonfires (PhantomID, BonfireID, Platform, AddedTime) VALUES (" + phantomID + ", " + bonfireIDList[i] + ", " + platformID + ", " + addedTime + ")");
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

function findMatchHost(hostID, hostName, platformID, bonfireID)
{
	//Attempts to match the host with a phantom, then sends the match
	//If no matches were found, wait for one to happen.
	
	//Get all phantoms at the bonfire
	dbConnection.query("SELECT PhantomID FROM PhantomBonfires WHERE BonfireID = " + bonfireID + " AND Platform = " + platformID + " ORDER BY AddedTime DESC", function (error, results, fields)
	{
		console.log("Received response from phantom bonfire query");
		
		//If there are no matches, return.  We'll wait for a match to happen.
		if (Object.keys(results).length == 0)
		{
			return;
		}
		
		//Match with the first phantom found
		var phantomID = results[0].PhantomID;
		console.log("Got phantom ID: " + phantomID);
		
		//Get the phantom's name
		dbConnection.query("SELECT Name FROM Phantoms WHERE PhantomID=" + phantomID, function (error, results, fields)
		{
			console.log("Received response from phantom name query");
			
			var phantomName = results[0].Name;
			console.log("Extracted phantom name " + phantomName);
			
			//Send the match
			sendMatch(bonfireID, hostID, phantomID, hostName, phantomName);
		});
		console.log("Sent query for phantomName with ID " + phantomID);
		
	});
	console.log("Sent query to look for phantoms at bonfire " + bonfireID);
}

function findMatchPhantom(phantomID, phantomName, platformID, bonfireIDList)
{
	//Attempts to match the phantom with a host, then sends the match
	//If no matches were found, wait for one to happen.
	//TODO
	
	return;
}


/*---Misc functions---*/

function sendMatch(bonfireID, hostID, phantomID, hostName, phantomName)
{
	//Sends a match object to both phantom and host, then removes them from the DB
	
	//Create the match object
	var matchObj = new Match(bonfireID, hostName, phantomName);
	
	//Send the match object to both of them
	hostResponseList[hostID].json(matchObj);
	phantomResponseList[phantomID].json(matchObj);
	
	//Remove them both from the DB
	removePhantom(phantomID);
	removeHost(hostID);
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

function randomPassword()
{
	//Returns a randomly generated password
	
	var length = 5;
	var password = "";
	
	for (i = 0; i < length; i++)
	{
		//Choose a random letter
		var index = Math.floor(Math.random() * charList.length);
		password += charList.charAt(index);
	}
	
	return password;
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
	
	//Extract info from request
	var name = req.query.name;
	var platformID = req.query.platform;
	var bonfireIDList = extractBonfireArray(req.query);
	console.log("First bonfire in array is " + bonfireIDList[0]);
	
	//Add the client
	if (req.query.clientType === 'Host')
	{
		//Add the host
		var hostID = addHost(name, platformID, res, bonfireIDList[0], Date.now());
		
		//Find a match
		findMatchHost(hostID, name, platformID, bonfireIDList[0]);
	}
	else
	{
		//Add the phantom
		var phantomID = addPhantom(name, platformID, res, bonfireIDList, Date.now());
		
		//Find a match
		findMatchPhantom(phantomID, name, platformID, bonfireIDList);
	}
});

//start server on the specified port and binding host
var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  	console.log("server starting on " + appEnv.url);
});
