var proxy = require("./Proxy");
var clientRegistry = require("./ClientRegistry");
var express = require("express");


proxy.init(function(IP, URL)
{
	clientRegistry.getClient(IP).handleRequest(URL);
});
