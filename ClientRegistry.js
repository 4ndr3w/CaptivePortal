var fs = require("fs");

clientList = new Array();
accessLevels = new Array();

function AccessLevel(level, friendlyName)
{
	this.accessList = new Array();
	this.allowUnknown = false;
	this.level = level;
	this.friendlyName = friendlyName;
	this.isAbleToAccess = function(url)
	{
		for ( i = 0; i < this.accessList.length; i++ )
		{
			if ( this.accessList[i].search(url) != -1 )
			{
				return !this.allowUnknown;
			}
		}
		return this.allowUnknown;
	}
	
	this.addURL = function(regex)
	{
		this.accessList.push(regex);
	}
	
	this.getAccessList = function()
	{
		return this.accessList;
	}
	
	this.setAllowUnknown = function(state)
	{
		this.allowUnknown = state;
	}
	
	this.getLevel = function()
	{
		return this.level;
	}
	
	this.getAPIData = function()
	{
		return {accessList:this.accessList, level:this.level, friendlyName:this.friendlyName};
	}
}

function getAccessLevel(level)
{
	for ( i = 0; i < accessLevels.length; i++ )
	{
		if ( accessLevels[i].getLevel() == level )
			return accessLevels[i];
	}
	return accessLevels[0];
}

function addAccessLevel(level, name)
{
	level = new AccessLevel(level, name);
	accessLevels.push(level);
	return level;
}

function getAccessLevels()
{
	return accessLevels;
}

function Client(IP, accessLevel, expire)
{
	console.log("New client! IP: "+IP);
	
	if ( accessLevel == undefined )
		accessLevel = 0;
	this.myAccessLevel = getAccessLevel(accessLevel);
	this.IP = IP;
	
	if ( expire == undefined )
		expire = 1800000; // 30 min
	this.expire = expire;	
		
	this.changeAccessLevel = function(level)
	{
		this.myAccessLevel = getAccessLevel(level);
		this.resetTimer();
		console.log("Access level of "+this.getIP()+" is now at "+level);
	}
	
	this.resetTimer = function()
	{
		if ( this.myAccesslevel != undefined )
			clearTimeout(this.myAccesslevel);
		thisPtr = this;
		this.expireTimeout = setTimeout(function()
		{
			thisPtr.changeAccessLevel(0);
		}, this.expire);
	}
	
	this.handleRequest = function(URL)
	{
		return this.myAccessLevel.isAbleToAccess(URL);
	}
	
	this.getAccessLevel = function()
	{
		return this.myAccessLevel.getLevel();
	}
	
	this.getIP = function()
	{
		return this.IP;
	}
	
	this.getAPIData = function()
	{
		return {ip:IP, accessLevel:this.myAccessLevel.getAPIData()};
	}
}

function getClient(IP)
{
	for ( i = 0; i < clientList.length; i++ )
	{
		if ( clientList[i].getIP() == IP )
			return clientList[i];
	}
	client = new Client(IP, 0);
	clientList.push(client);
	return client;
}

function getClientAPIData()
{
	output = [];
	for ( i = 0; i < clientList.length; i++ )
	{
		output.push(clientList[i].getAPIData());
	}
	return output;
}

function reload()
{
	accessLevels = new Array();
	accessLevels.push(new AccessLevel(0, "Unauthenticated"));
	fs.readdir("./accessLists", function(err, files)
	{
		for ( f = 0; f < files.length; f++ )
		{
			level = parseInt(files[f]);
			fs.readFile("./accessLists/"+files[f], function(err, data)
			{
				console.log("Loaded accessLevel "+level);
				data = data.toString().split("\n");
				
				newLevel = addAccessLevel(parseInt(level), data[0]);
				for ( i = 1; i < data.length; i++ )
				{
					console.log("Added URL "+data[i]+" to "+newLevel.level);
					newLevel.addURL(data[i].trim());
				}	
			});
		}
	});
}

exports.getClient = getClient;
exports.addAccessLevel = addAccessLevel;
exports.reload = reload;
exports.getAccessLevel = getAccessLevel;
exports.getClientAPIData = getClientAPIData;
exports.getAccessLevels = getAccessLevels;
