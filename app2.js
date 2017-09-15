var awsIot = require('aws-iot-device-sdk');
var mysql = require('mysql');
var moment = require('moment-timezone');
var firebase = require("firebase");

/*
=================================================================
setup a connection to mysql database
=================================================================
*/
var connect = mysql.createConnection({
    host: "localhost",
    user: "netspring",
    password: "empcog123",
    database: "solarbase"
});



/*
=================================================================
setup a connection firebase
=================================================================
*/

var config = {
  apiKey: "AIzaSyDJgRbtyDdV06ttkCp_E4pCpKQ_5HS1b8E",
  authDomain: "arnergyrealtime.firebaseapp.com",
  databaseURL: "https://arnergyrealtime.firebaseio.com",
  storageBucket: "arnergyrealtime.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();


/*
==================================================================
Establish connection to AWS
==================================================================
*/
connect.connect(function(err)
{
    if(err)
    {
        console.log('AWS connection could not be established ' + err);
    }
});

//=>set timezone

var zone = "Africa/Lagos";

var servertime = new Date();
var time = moment.tz(servertime, zone);


//=>AWS IOT Connection Settings
var device = awsIot.device({

   keyPath: 'C:/Users/Administrator/Desktop/anjixnode/8f1d605b71-private.pem.key',
  certPath: 'C:/Users/Administrator/Desktop/anjixnode/8f1d605b71-certificate.pem.crt',
    caPath: 'C:/Users/Administrator/Desktop/anjixnode/RootCA.pem',
  clientId: 'TheServerTester',
    region: 'us-west-2' 
});

/*
==================================================================
Device Subscription & Topics
==================================================================
*/
device
  .on('connect', function() {
      //success message upon successful connection to server
      console.log('Connected to AWS server');

      //=>subscribe to
      device.subscribe('data/specification');
      device.subscribe('data/parameters');
      device.subscribe('data/warning');
      device.subscribe('data/mode');
      device.subscribe('data/parallel');
      device.subscribe('data/errorlogs');
      device.subscribe('data/parallelparameters');
      device.subscribe('data/defaultsettings');
      device.subscribe('data/expirydate');

      //=>publish to
      // device.publish('InverterID/command/SuscriptionStatus');
      // device.publish('InverterID/command/Power');
      // device.publish('InverterID/command/ParallelStatus');
      // device.publish('InverterID/command/RemainingTime');
      // device.publish('InverterID/command/InverterSettings');
      


    });

device
  .on('message', function(topic, payload) {

      switch (topic) 
      {
          case 'data/specification':
            return handleSpecification(topic, payload);

          case 'data/parameters':
            return handleParameters(topic, payload);

          case 'data/warning':
            return handleWarning(topic, payload);

          case 'data/mode':
            return handleMode(topic, payload);

          case 'data/parallel':
            return handleParallel(topic, payload);

          case 'data/errorlogs':
            return handleErrorLogs(topic, payload);

          case 'data/parallelparameters':
            return handleParallelParameters(topic, payload);

          case 'data/defaultsettings':
            return handleDefaultSettings(topic, payload);

          case 'data/expirydate':
            return handleExpiryDate(topic, payload);
      }
  });

/*
=======================================================================
HANDLE AWS DEVICE ERROR
=======================================================================
*/
device
  .on('error', function(error) {
    console.log(error);
     
  });

/*
=======================================================================
HANDLE AWS DEVICE ERROR
=======================================================================
*/
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack);
})

/* 
=======================================================================
UTILITY FUNTIONS 
=======================================================================
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
    
    // var deviceid = topic.toString();
    // deviceid = deviceid.split("/");
    // deviceid = deviceid[0];

    var info = message.toString(); 
    var res = info.split(" ");
    var deviceid = res[0];
    var timestring  = res[1];
    var tm = timestring.split("");
    var timestamp = tm[10]+tm[11]+tm[12]+tm[13]+"-"+tm[8]+tm[9]+"-"+tm[6]+tm[7]+ 
                    " " + tm[0]+tm[1]+":"+tm[2]+tm[3]+":"+tm[4]+tm[5];

    
     //push fetched data to specification logs
     var str = res[2];
     var grid = str.substr(1);
        var contents = {
            DeviceID: deviceid,
            GridVoltage: grid,
            GridFrequency: res[3], 
            ACOutputVoltage: res[4],
            ACOutputFrequency: res[5],
            ACOutputApparentPower: res[6],
            ACOutputActivePower: res[7],
            OutputLoadPercentage: res[8],
            BusVoltage: res[9],
            BatteryVoltage: res[10],
            BatteryChargingCurrent: res[11],
            BatteryCapacity: res[12],
            InverterSinkTemperature: res[13],
            PVInputCurrent: res[14],
            PVInputVoltage: res[15],
            BatteryVoltageSCC: res[16],
            BatteryDischargeCurrrent: res[17],
            DeviceStatus: res[18],
            AddedOn: time.format('YYYY-MM-DD HH:mm:ss'),
            DeviceTimeStamp: timestamp
        }



        //=>insert to firebase
        function writeUserData(contents) {
          


         //push data to dvices table on Firebase
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
       console.log(contents);
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


  function handleParallel(topic, message)
  {

  }

  function handleErrorLogs(topic, message)
  {
    
  }

  function handleParallelParameters(topic, message)
  {
    
  }

  function handleDefaultSettings(topic, message)
  {
    
  }

  function handleExpiryDate(topic, message)
  {
    
  }