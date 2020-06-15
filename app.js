const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const { transform } = require("node-json-transform").transformAsync;
const transform = require("node-json-transform").transformAsync;

// proxy middleware options
const options = {
  target: 'http://localhost:8000', // target host
  changeOrigin: true, // needed for virtual hosted sites
   ws: true, // proxy websockets
  pathRewrite: {
    '^/api/old-path': '/api/new-path', // rewrite path
    '^/api/remove/path': '/path', // remove base path
  },
  router: {
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    'dev.localhost:3000': 'http://localhost:8000',
  },
  onProxyReq: function onProxyReq(proxyReq, req, res) {
    if ( req.method == "POST" && req.body ) {

    var map = {
    item: {
      modifiednmame: "name"}
    };

    const resultObj ="dd"
    transform(req.body, map).then(function(result){
      console.log(result);
    });
    const result = JSON.stringify(resultObj);
    console.log(result);


   // Update header
   proxyReq.setHeader( 'content-type', 'application/x-www-form-urlencoded' );
   proxyReq.setHeader( 'content-length', result.length );

   // Write out body changes to the proxyReq stream
   proxyReq.write( result );
   proxyReq.end();
    }
    // add custom header to request
    // proxyReq.setHeader('x-added', 'foobar');
    // or log the req
  1}

};

// create the proxy (without context)
const exampleProxy = createProxyMiddleware(options);


// exampleProxy.on('onProxyReq', function onProxyReq(proxyReq, req, res) {
//   // add custom header to request
//   proxyReq.setHeader('x-added', 'foobar');
//   // or log the req
// });

// mount `exampleProxy` in web server
const app = express();
app.use(express.json());
app.use('/api', exampleProxy);
app.listen(3000);