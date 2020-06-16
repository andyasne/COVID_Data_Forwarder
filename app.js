const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const transform = require("node-json-transform").transform;

const options = {
  target: 'http://3.95.229.192:3000', // target host
  changeOrigin:"properties.HouseNo", // needed for virtual hosted sites
   ws:"properties.HouseNo", // proxy websockets
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

    const resultObj = transformJSON(req);
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

function transformJSON(req) {
  var map = {
    item: {
        FirstName :   "properties.FirstName",
        MiddleName :   "properties.MiddleName",
        LastName :   "properties.LastName",
        Nationality :   "properties.Nationality",
        Email :   "",
        Sex :   "properties.Sex",
        Age :  "properties.ageNumber",
        Region :   "properties.region",
        SubcityOrZone :   "properties.subcity",
        Woreda :   "properties.woreda",
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
        RunnyNose :  " ",
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
        HouseToHouseID :   "",
        Source :   "properties.case_type",
        FormStatus :   ""

    }
  };

  const resultObj = transform(req.body, map);
  return resultObj;
}
