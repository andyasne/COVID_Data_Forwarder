const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const transform = require("node-json-transform").transform;

const options = {
  target: 'http://3.95.229.192:3000', // target host
  changeOrigin: true, // needed for virtual hosted sites
   ws: true, // proxy websockets
  pathRewrite: {
    '^/api': '/users', // rewrite path
    '^/api/remove/path': '/path', // remove base path
  },
  router: {
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    'dev.localhost:3000': 'http://3.95.229.192:3000',
  },
  onProxyReq: function onProxyReq(proxyReq, req, res) {
    if ( req.method == "POST" && req.body ) {

    var map = {
    item: {
      modifiednmame: "name"}
    };

    const resultObj = transform(req.body, map);
    const result = JSON.stringify(resultObj);
    console.log(result);


   // Update header
   proxyReq.setHeader( 'content-type', 'application/json' );
  proxyReq.setHeader( 'content-length', result.length );

   // Write out body changes to the proxyReq stream
   proxyReq.write(result );
   proxyReq.end();
    }

  }

};

// create the proxy (without context)
const covidProxy = createProxyMiddleware(options);


// mount `covidProxy` in web server
const app = express();
app.use(express.json());
app.use('/api', covidProxy);
app.listen(3000);