var proxy = require("./Proxy");
var clientRegistry = require("./ClientRegistry");
var express = require("express");
var app = express();
var server = require("http").createServer(app);


clientRegistry.reload();


proxy.init(function(IP, URL)
{
	return clientRegistry.getClient(IP).handleRequest(URL);
});


//clientRegistry.addAccessLevel(1, "Normal").addURL("apple.com");
//clientRegistry.addAccessLevel(2, "Pass");

app.get("/portal", function(req, res)
{
	output = "";
	level = clientRegistry.getClient(req.ip).getAccessLevel();
	if ( level == 0 )
		output += "You are not authenticated. <a href='/authenticate'>Click here to authenticate.</a>";
	else 
		output += "You are authenticated with access level "+level;
	res.send(output);
});

app.use("/admin", express.static("./admin"));
app.get("/admin/clientList", function(req,res)
{
	res.json(clientRegistry.getClientAPIData());
});
app.get("/admin/accessList", function(req,res)
{
	res.json(clientRegistry.getAccessLevels());
});

app.get("/admin/updatelevel", function(req,res)
{
	clientRegistry.getClient(req.param("ip")).changeAccessLevel(req.param("newlevel"));
	res.send("OK");
});

app.get("/admin/reloadAccessLevels", function (req,res)
{
	clientRegistry.reload();
	res.send("OK");
})

app.get("/accessLevel", function(req, res)
{
	level = clientRegistry.getClient(req.ip).getAccessLevel();
	res.send(level.toString());
});

app.get("/mysites", function(req, res)
{
	output = "Your access level allows you to access: <br>";
	sites = clientRegistry.getAccessLevel(clientRegistry.getClient(req.ip).getAccessLevel()).getAccessList();
	if ( sites.length == 0 )
		output += "NOTHING!";
	else
	{	
		for ( i = 0; i < sites.length; i++ )
			output += sites[i]+"<br>";
	}
	res.send(output);
});

app.get("/authenticate", function(req, res)
{
	clientRegistry.getClient(req.ip).changeAccessLevel(1);
	level = clientRegistry.getClient(req.ip).getAccessLevel();
	res.redirect("/portal");
});


server.listen(80);