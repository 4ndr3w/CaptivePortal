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
accessLevels.push(new AccessLevel(0, "Unauthenticated"));

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
		expire = 600000; // 10 min
		
		
	thisPtr = this;
	this.expireTimeout = setTimeout(function()
	{
		thisPtr.changeAccessLevel(0);
	}, expire);
	
	this.changeAccessLevel = function(level)
	{
		this.myAccessLevel = getAccessLevel(level);
		console.log("Access level of "+this.getIP()+" is now at "+level);
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

exports.getClient = getClient;
exports.addAccessLevel = addAccessLevel;
exports.getAccessLevel = getAccessLevel;
exports.getClientAPIData = getClientAPIData;
exports.getAccessLevels = getAccessLevels;
