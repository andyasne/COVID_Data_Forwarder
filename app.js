const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const transform = require("node-json-transform").transform;

const options = {
  target: 'https://covidtollfreereg.api.sandboxaddis.com/api/CommunityInspections', // target host
  changeOrigin:"true", // needed for virtual hosted sites
   ws:"true", // proxy websockets
  pathRewrite: {
    '^/': '/', // rewrite path
    '^/api/remove/path': '/path', // remove base path
  },
  router: {
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    'localhost:3000': 'https://covidtollfreereg.api.sandboxaddis.com/api/CommunityInspections',
  },
  onProxyReq: function onProxyReq(proxyReq, req, res) {
    if ( req.method == "POST" && req.body ) {

    const resultObj = transformJSON(req);
    const result = JSON.stringify(resultObj);
    console.log(result);

 let token = 'Bearer '+'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIzMyIsIlVzZXJOYW1lIjoidGZBZG1pbiIsIkZ1bGxOYW1lIjoiVG9sbEZyZWVBZG1pbiIsIlJvbGUiOiJUb2xsRnJlZUFkbWluIiwiUmVnaW9uIjoiQWRkaXMgQWJhYmEiLCJIb3NwaXRhbCI6IiIsIkNhbGxDZW50ZXIiOiI4MzM1IiwiZXhwIjoxNTkyODQ2OTUzfQ.Kdap1_YhDG4ZzTRhXiilpH2M78ZhqBHHngaZ7KKwAAM';
   // Update header
  proxyReq.setHeader( 'content-type', 'application/json' );
  proxyReq.setHeader( 'authorization', token);
  proxyReq.setHeader( 'content-length', result.length );

   // Write out body changes to the proxyReq stream
   proxyReq.write(result );
   proxyReq.end();
    }

  },
  onProxyRes:function onProxyRes(proxyRes, req, res) {
    proxyRes.headers['x-added'] = 'foobar'; // add new header to response
    delete proxyRes.headers['x-removed']; // remove header from response
  }
};

// create the proxy (without context)
const covidProxy = createProxyMiddleware(options);


// mount `covidProxy` in web server
const app = express();
app.use(express.json());
app.use( covidProxy);
app.listen(3000);

function transformJSON(req) {
  var map = {
    item: {
        FirstName :   "properties.FirstName",
        MiddleName :   "properties.MiddleName",
        LastName :   "properties.LastName",
        Nationality :   "properties.Nationality",
        Email :   "",
        Sex :   "properties.Sex",
        SubcityOrZone :   "properties.subcity",//TODO:- Add subcity to Community Inspection
        Woreda :   "properties.woreda",//TODO:- Add woreda to Community Inspection
        Kebele :   "properties.Kebele",
        HouseNo :   "properties.HouseNo",
        PhoneNo :   "properties.PhoneNo",
        Area :   "",
        Occupation :   "",
        CallDate :   "",
        CallerType :   "",
        TravelerId :   "",
        Fever :   "properties.Fever",
        FeverStartDate :   "properties.FeverStartDate",
        Cough :   "properties.Cough",
        CoughStartDate :   "properties.CoughStartDate",
        Headache :  "properties.Headache",
        HeadacheStartDate :   "properties.HeadacheStartDate",
        SoreThroat :  "properties.SoreThroat",
        SoreThroatStartDate :   "properties.SoreThroatStartDate",
        RunnyNose :  " ",//TODO: Not defined on CI case
        RunnyNoseStartDate :   "",
        UnwellnessFeeling :  "properties.UnwellnessFeeling",
        UnwellnessFeelingStartDate :   "properties.UnwellnessFeelingStartDate",
        BreathingDifficulty :  "properties.BreathingDifficulty",
        BreathingDifficultyStartDate :   "properties.BreathingDifficultyStartDate",
        BodyPain :  "properties.BodyPain",
        BodyPainStartDate :   "properties.BodyPainStartDate",
        TravleHx :  "properties.TravleHx",
        HaveSex :  "",
        AnimalMarket :  "",
        HealthFacility :  "true",
        ReceiverName :   "",
        CheckedBy :   "",
        Remark :    "properties.remark",
        HouseToHouseID :   "properties.codeNumber",
        Region :   "properties.region",
        Age :  "properties.ageNumber",
        Source :   "Toll Free",
        FormStatus :   "Complete"


    } ,
     defaults: {
      Region :   "Addis Ababa", //TODO:- Add region to Community Inspection
      Age :  25,
      RunnyNose :  false,
      Source :   "Toll Free",
        FormStatus :   "Complete",
        HouseToHouseID :  0,
    },
    operate: [
      {
        run: function(val) { return Number(val)}, on: "Age"
      }],
  };

  const resultObj = transform(req.body, map);
  return resultObj;
}
