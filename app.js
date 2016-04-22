/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

/*---Requires---*/

var express = require('express');	// This application uses express as its web server.  For more info, see: http://expressjs.com
var cfenv = require('cfenv'); 		// cfenv provides access to your Cloud Foundry environment. For more info, see: https://www.npmjs.com/package/cfenv

var mysql = require('mysql');


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
	
	//Create the table of hosts
	dbConnection.query
	("
		CREATE TABLE Hosts
		(
			HostID int,
			Name varchar(255)
		)
	");
	
	//Create the table of phantoms
	dbConnection.query
	("
		CREATE TABLE Phantoms
		(
			PhantomID int,
			Name varchar(255)
		)
	");
	
	//Create the table mapping hosts to bonfires
	dbConnection.query
	("
		CREATE TABLE HostBonfires
		(
			HostID int,
			BonfireID int
		)
	");
	
	//Create the table mapping phantoms to bonfires
	dbConnection.query
	("
		CREATE TABLE PhantomBonfires
		(
			PhantomID int,
			BonfireID int
		)
	");
	
	//Create the table of matches
	dbConnection.query
	("
		CREATE TABLE Matches
		(
			HostID int,
			PhantomID int,
			Password varchar(16),
			
			HostClaimed int,
			PhantomClaimed int
		)
	");
	
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
	res.send('Hello world!');
});

//start server on the specified port and binding host
var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  	console.log("server starting on " + appEnv.url);
});
