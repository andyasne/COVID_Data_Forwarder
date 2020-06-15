const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

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
   // Remove body-parser body object from the request
   if ( req.body ) delete req.body;

   // Make any needed POST parameter changes
   let body = new Object();

   body.filename = 'reports/statistics/summary_2016.pdf';
   body.routeid = 's003b012d002';
   body.authid = 'bac02c1d-258a-4177-9da6-862580154960';

   // URI encode JSON object
   body = Object.keys( body ).map(function( key ) {
       return encodeURIComponent( key ) + '=' + encodeURIComponent( body[ key ])
   }).join('&');

   // Update header
   proxyReq.setHeader( 'content-type', 'application/x-www-form-urlencoded' );
   proxyReq.setHeader( 'content-length', body.length );

   // Write out body changes to the proxyReq stream
   proxyReq.write( body );
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