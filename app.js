var awsIot = require('aws-iot-device-sdk');
var mysql = require('mysql');
var moment = require('moment-timezone');
var firebase = require("firebase");

 //setup a connection to mysql database
var connect = mysql.createConnection({
    host: "localhost",
    user: "netspring",
    password: "empcog123",
    database: "solarbase"
});



/*
=======================================================
setup a connection firebase
========================================================
*/

var config = {
  apiKey: "AIzaSyDJgRbtyDdV06ttkCp_E4pCpKQ_5HS1b8E",
  authDomain: "arnergyrealtime.firebaseapp.com",
  databaseURL: "https://arnergyrealtime.firebaseio.com",
  storageBucket: "arnergyrealtime.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();







connect.connect(function(err)
{
    if(err)
    {
        console.log('Database connection could not be established ' + err);
    }
});

//set timezone

var zone = "Africa/Lagos";

var servertime = new Date();
var time = moment.tz(servertime, zone);


//AWS IOT Connection Settings
var device = awsIot.device({

   keyPath: 'C:/Users/Administrator/Desktop/anjixnode/8f1d605b71-private.pem.key',
  certPath: 'C:/Users/Administrator/Desktop/anjixnode/8f1d605b71-certificate.pem.crt',
    caPath: 'C:/Users/Administrator/Desktop/anjixnode/RootCA.pem',
  clientId: 'TheServerTester',
    region: 'us-west-2' 
});

//
// Device subscription and topics
//
device
  .on('connect', function() {
      //success message upon successful connection to server
      console.log('Connected to AWS server');


      device.subscribe('1234567/data/specification');
      device.subscribe('1234567/data/parameters');
      device.subscribe('1234567/data/warning');
      device.subscribe('1234567/data/mode');


    });

device
  .on('message', function(topic, payload) {

      switch (topic) 
      {
        case '1234567/data/specification':
          return handleSpecification(topic, payload);

        case '1234567/data/parameters':
          return handleParameters(topic, payload);

        case '1234567/data/warning':
          return handleWarning(topic, payload);

        case '1234567/data/mode':
          return handleMode(topic, payload);
      }
  });


device
  .on('error', function(error) {
    console.log(error);
     
  });



    /* 
    ===========================================================
    UTILITY FUNTIONS 
    ===========================================================
    */
  //device specification
  function handleSpecification(topic, message) 
  {  

    console.log("Specification Message: " + "\n" + message);

    var deviceid = topic.toString();
    deviceid = deviceid.split("/");
    deviceid = deviceid[0];

    var info = message.toString(); 
    var res = info.split(" ");
     //push fetched data to specification logs
        var contents = {
            DeviceID: deviceid,
            GridVoltage: res[0],
            GridCurrent: res[1], 
            ACOutputVoltage: res[2],
            ACOutputFrequency: res[3],
            ACOutputCurrent: res[4],
            ACOutputApparentPower: res[5],
            ACOutputActivePower: res[6],
            BatteryVoltage: res[7],
            BatteryRechargeVoltage: res[8],
            BatteryUnderVoltage: res[9],
            BatteryBulkVoltage: res[10],
            BatteryFloatVoltage: res[11],
            BatteryType: res[12],
            MaxACChargingCurrent: res[13],
            MaxChargingCurrent: res[14],
            InputVoltage: res[15],
            OutputSourcePriority: res[16],
            ChargerSourcePriority: res[17],
            ParallelMaxNum: res[18],
            MachineType: res[19],
            Topology: res[20],
            OutputMode: res[21],
            BatteryRedischargeVoltage: res[22],
            PVCondition: res[23],
            PVPowerBalance: res[24],
            AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
        }
        var query = connect.query("INSERT INTO realtime_device_specification set ?", contents, function(err, result)
        {
            //console.log(query.log);
            if(err)
            {
                console.error(err);
                return;
            }
            else
            {
                console.log("Specification Data added successfully");
            }
        });
  
  }

  //realtime date
  function handleParameters(topic, message) 
  {  

    console.log("Realtime Parameters Message: " + "\n" + message);
    
    var deviceid = topic.toString();
    deviceid = deviceid.split("/");
    deviceid = deviceid[0];

    var info = message.toString(); 
    var res = info.split(" ");
     //push fetched data to specification logs
        var contents = {
            DeviceID: deviceid,
            GridVoltage: res[0],
            GridFrequency: res[1], 
            ACOutputVoltage: res[2],
            ACOutputFrequency: res[3],
            ACOutputApparentPower: res[4],
            ACOutputActivePower: res[5],
            OutputLoadPercentage: res[6],
            BusVoltage: res[7],
            BatteryVoltage: res[8],
            BatteryChargingCurrent: res[9],
            BatteryCapacity: res[10],
            InverterSinkTemperature: res[11],
            PVInputCurrent: res[12],
            PVInputVoltage: res[13],
            BatteryVoltageSCC: res[14],
            BatteryDischargeCurrrent: res[15],
            DeviceStatus: res[16],
            AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
        }



        //insert to firebase=>
        function writeUserData(contents) {
          firebase.database().ref('devices/' + contents.DeviceID).set(
            contents
          );
        }


        var query = connect.query("INSERT INTO realtime_device_parameters set ?", contents, function(err, result)
        {
            //console.log(query.log);
            if(err)
            {
                console.error(err);
                return;
            }
            else
            {
                console.log("Parameters Data added successfully");
            }
        });


       //fireup to firebase
       writeUserData(contents); 
  
  }


   //realtime warning
  function handleWarning(topic, message) 
  {  

    console.log("Warning Parameters Message: " + "\n" + message);
    
    var deviceid = topic.toString();
    deviceid = deviceid.split("/");
    deviceid = deviceid[0];

    // var info = message.toString(); 
    // var res = info.split(" ");
     //push fetched data to specification logs
        var contents = {
            DeviceID: deviceid,
            DeviceWarning: message,
            AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
        }
        var query = connect.query("INSERT INTO realtime_device_warning set ?", contents, function(err, result)
        {
            //console.log(query.log);
            if(err)
            {
                console.error(err);
                return;
            }
            else
            {
                console.log("Warning details added successfully");
            }
        });
  
  }



   //realtime mode
  function handleMode(topic, message) 
  {  

    console.log("Mode Message: " + "\n" + message);
    
    var deviceid = topic.toString();
    deviceid = deviceid.split("/");
    deviceid = deviceid[0];

    // var info = message.toString(); 
    // var res = info.split(" ");
     //push fetched data to specification logs
        var contents = {
            DeviceID: deviceid,
            DeviceMode: message,
            AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
        }
        var query = connect.query("INSERT INTO realtime_device_mode set ?", contents, function(err, result)
        {
            //console.log(query.log);
            if(err)
            {
                console.error(err);
                return;
            }
            else
            {
                console.log("Mode details added successfully");
            }
        });
  
  }