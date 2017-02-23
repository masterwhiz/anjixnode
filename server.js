var net = require('net');
var moment = require('moment-timezone');
var mysql = require('mysql');

 //setup a connection to mysql database
var connect = mysql.createConnection({
  host: "localhost",
  user: "netspring",
  password: "empcog123",
  database: "solarbase"
});

connect.connect(function(err)
{
    if(err)
    {
        console.log('Database connection could not be established ' + err);
    }
});

/*
============================================
GLOBAL SETTINGS
============================================
*/ 
var host = '127.0.0.1';
var port = 8081;
var zone = "Africa/Lagos";

var servertime = new Date();
var time = moment.tz(servertime, zone);

/*
//ArnergyTcp/device_id/data/AC_in/AC_out/load/batt_v/batt_cap/pv_volt/pv_curr/pv_power/en_today/eof
//ArnergyTcp/1064732845/data/215/220/43/23.6/63/28/12.8/135/460.5/eof
//ArnergyTCp/device_id/msg/eof
//ArnergyTcp/1064732845/msg/cant_connect_to_inverter/eof

ArnergyTcp/setup
 
->respond with - ArnergyTcp/id/12345678901234

ArnergyTcp/Time

-> respond with ArnergyTcp/104/yyyymmdd

Response codes from TCP server
  00 = Complete Data Received
  01 = Incomplete Data Received
  02 = Complete Message Received
  03 = Incomplete Message Received
  05 = Unformated or wrong data
*/


// Create a server instance, and chain the listen function to it
net.createServer(function(sock) {
    
    /*
    ========================================================================
    We have a connection - write the ip and port of the client
    ========================================================================
    */ 
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    /*
    ========================================================================
    Add a 'data' event handler to this instance of socket
    ========================================================================
    */
    sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        var info = data.toString(); 
        var res = info.split("/");
        console.log(res);
        exit;
        /*
        ========================================================================
        check whether the information is valid for this server
        ========================================================================
        */   
        if(res.length < 1)
        {
            sock.write('05');
        }
        else
        {   
            var setupcheck = res[1].substring(0,5);
            var timecheck = res[1].substring(0,4);
            if(setupcheck=="setup")
            {
               
                var query = connect.query('SELECT * FROM serverids ORDER BY ID DESC LIMIT 1', function(err,result){
                   
                });

                 console.log(query);

            }

            else if(timecheck=="Time")
            {
                //fetch system time
                var thetime = time.format('YYYYMMDD/HHmmss');
                sock.write(thetime);
            }
            else if(res[2]=="data")
            {
                var val1 = (res[0]!="")? res[0] : "0";
                var val2 = (res[1]!="")? res[1] : "0";
                var val3 = (res[2]!="")? res[2] : "0";
                var val4 = (res[3]!="")? res[3] : "0";
                var val5 = (res[4]!="")? res[4] : "0";
                var val6 = (res[5]!="")? res[5] : "0";
                var val7 = (res[6]!="")? res[6] : "0";
                var val8 = (res[7]!="")? res[7] : "0";
                var val9 = (res[8]!="")? res[8] : "0";
                var val10 = (res[9]!="")? res[9] : "0";
                var val11 = (res[10]!="")? res[10] : "0";
                var val12 = (res[11]!="")? res[11] : "0";
                var val13 = (res[12]!="")? res[12] : "0";
                var checkl = val13.substring(0,3);

                //push fetched data to serverdatalogs
                var contents = {
                    DeviceID: val2,
                    AC_IN: val4,
                    AC_OUT: val5, 
                    LoadVal: val6,
                    BatteryVoltage: val7,
                    BatteryCapacity: val8,
                    PVVoltage: val9,
                    PVCurrent: val10,
                    PVPower: val11,
                    EnergyToday: val12,
                    AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
                }
                var query = connect.query("INSERT INTO serverdatalogs set ?", contents, function(err, result)
                {
                    //console.log(query.log);
                    if(err)
                    {
                        console.error(err);
                        return;
                    }
                    else
                    {
                        console.log("Server details added successfully");
                    }
                });


                if(checkl =="eof")
                {
                    sock.write('00');

                }
                else
                {
                    sock.write('01');
                }

            }

            else if(res[2]=="msg")
            {
                var val1 = (res[0]!="")? res[0] : "0";
                var val2 = (res[1]!="")? res[1] : "0";
                var val3 = (res[2]!="")? res[2] : "0";
                var val4 = (res[3]!="")? res[3] : "0";
                var val5 = (res[4]!="")? res[4] : "0";
                var checkl = val5.substring(0,3);
                if(checkl =="eof")
                {
                    sock.write('02');
                }
                else
                {
                    sock.write('03');
                }
            }
        }

        
    });
    
    /*
    ========================================================================
    Add a 'close' event handler to this instance of socket
    ========================================================================
    */ 
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(port, host);

console.log('Server listening on ' + host +':'+ port);