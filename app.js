const express = require('express');
const express1 = require('express');
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const transform = require("node-json-transform").transform;
const request = require('request');
const winston = require('winston');
let prevToken;
let tokenExpDate;
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {
    service: 'user-service'
  },
  transports: [

    new winston.transports.File({
      filename: 'not transfered data.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    }),
    new winston.transports.File({
      filename: 'transfered data.log',
      level: 'verbose'
    }),
  ],
});
logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));
const options = {
  // target: 'http://localhost:4001', // target host
  target: 'https://covidtollfreereg.api.sandboxaddis.com/api/CommunityInspections', // target host

  changeOrigin: "true", // needed for virtual hosted sites
  // ws: "true", // proxy websockets
  pathRewrite: {
    '^/': '/', // rewrite path
    '^/api/remove/path': '/path', // remove base path
  },

  onProxyReq: function onProxyReq(proxyReq, req, res) {
    if (req.method == "POST" && req.body) {
      const resultObj = transformJSON(req);
      const result = JSON.stringify(resultObj);
      let token = 'Bearer ' + getToken();
      proxyReq.setHeader('authorization', token);
      Buffer.byteLength(result, 'utf8')
      let resultLength = Buffer.from(result).length
      proxyReq.setHeader('content-length', resultLength);
      proxyReq.write(result);
      proxyReq.end();
    }
  },
  onProxyRes: function onProxyRes(proxyRes, req, res) {
    logger.info("Response status Code" + proxyRes.statusCode);
    logger.info("Response status message" + proxyRes.statusMessage);
    if (proxyRes.statusCode === 200) {
      logger.verbose(req.body);
    } else {
      logger.error(req.body);
    }
  }
};


const testingServer = express1();
testingServer.use(express1.json());
testingServer.post('/', function (req, res) {
  res.send(req.body)

})
testingServer.get('/', function (req, res) {
  res.send('Hello World!')
})
testingServer.listen(4001, () => console.log(`Started Testing Server http://127.0.0.1:4001`));




// create the proxy (without context)
const covidProxy = createProxyMiddleware(options);
const app = express();
if (tokenExpDate === undefined) {
  logger.info("Get Token for the First Time")
  getToken()
}
app.use(express.json());
app.use(covidProxy);
logger.info("Started Listening at port 3000")
app.listen(4000);


function getToken() {
  //check if it expired
  const options = {
    url: 'https://covidtollfreereg.api.sandboxaddis.com/api/Auth',
    json: true,
    body: {
      UserName: "tfadmin",
      Password: "pass"
    }
  };
  let today = new Date();
  if (today >= tokenExpDate || tokenExpDate === undefined) {
    request.post(options, (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      tokenExpDate = new Date(body.expiration);
      prevToken = body.token;
      logger.info("Get New Token" + prevToken)
      return prevToken;
    });
  } else {
    return prevToken;
  }
}

function transformJSON(req) {
  var map = {
    item: {
      FirstName: "properties.FirstName",
      MiddleName: "properties.MiddleName",
      LastName: "properties.LastName",
      Nationality: "properties.Nationality",
      Email: "",
      Sex: "properties.Sex",
      Age: "properties.ageNumber",
      Region: "Addis Ababa", //TODO:- Add region to Community Inspection
      SubcityOrZone: "properties.subcity", //TODO:- Add subcity to Community Inspection
      Woreda: "properties.woreda", //TODO:- Add woreda to Community Inspection
      Kebele: "properties.Kebele",
      HouseNo: "properties.HouseNo",
      PhoneNo: "properties.PhoneNo",
      Area: "",
      Occupation: "",
      CallDate: "",
      CallerType: "",
      TravelerId: "",
      Fever: "properties.Fever",
      FeverStartDate: "properties.FeverStartDate",
      Cough: "properties.Cough",
      CoughStartDate: "properties.CoughStartDate",
      Headache: "properties.Headache",
      HeadacheStartDate: "properties.HeadacheStartDate",
      SoreThroat: "properties.SoreThroat",
      SoreThroatStartDate: "properties.SoreThroatStartDate",
      RunnyNose: " ", //TODO: Not defined on CI case
      RunnyNoseStartDate: "",
      UnwellnessFeeling: "properties.UnwellnessFeeling",
      UnwellnessFeelingStartDate: "properties.UnwellnessFeelingStartDate",
      BreathingDifficulty: "properties.BreathingDifficulty",
      BreathingDifficultyStartDate: "properties.BreathingDifficultyStartDate",
      BodyPain: "properties.BodyPain",
      BodyPainStartDate: "properties.BodyPainStartDate",
      TravleHx: "properties.TravleHx",
      HaveSex: "",
      AnimalMarket: "",
      HealthFacility: "true",
      ReceiverName: "",
      CheckedBy: "",
      Remark: "properties.remark",
      HouseToHouseID: "case_id",
      Region: "properties.region",
      Age: "properties.ageNumber",
      Source: "Toll Free",
      FormStatus: "Complete"
    },
    defaults: {
      Region: "Addis Ababa", //TODO:- Add region to Community Inspection
      Age: 25,
      RunnyNose: false,
      Source: "Toll Free",
      FormStatus: "Complete",
      BodyPain: false,
      Fever: false,
      Cough: false,
      Headache: false,
      SoreThroat: false,
      UnwellnessFeeling: false,
      BreathingDifficulty: false,
      BodyPain: false,

      HouseToHouseID: 0,
    },
    operate: [{
      run: function (val) {
        return Number(val)
      },
      on: "Age"
    }],
  };
  const resultObj = transform(req.body, map);
  return resultObj;
}