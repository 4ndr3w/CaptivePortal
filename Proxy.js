var http = require('http');
var myIP = "127.0.0.1";

function init(approvalCallback)
{
	http.createServer(function(request, response) {
	  
	  if ( request.url.search(myIP) != -1 || approvalCallback(request.connection.remoteAddress, request.url) )
	  {
		  var options = {
			  host: request.headers['host'],
			  port: 80,
			  method: request.method,
			  path: request.url,
			  headers: request.headers,  
		  };
		  var proxyReq = http.request(options, function(res)
		  {
			  response.writeHead(res.statusCode, res.headers);
			  
			  res.on("data", function (chunk)
			  {
				  response.write(chunk, 'binary');
			  });
			  
			  res.on("end", function()
			  {
				  response.end();
			  });
			  
			  res.on("error",function(){
				  console.log("Request failed");
			  });
			  request.on("data", function(chunk)
			  {
				  proxyReq.write(chunk, 'binary');
			  });
		  
			  request.on("end", function(chunk)
			  {
			  		proxyReq.end();
			  });
	  	  });
		  proxyReq.end();
		  
		  
	  }
	  else
	  {
		  response.writeHead(302, {
		    'Location': 'http://'+myIP+'/portal'
		  });
		  response.end();
	  }
	}).listen(8080);
}

exports.init = init;