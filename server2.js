var net = require('net');
var moment = require('moment-timezone');
//var mysql = require('mysql');

/*
============================================
GLOBAL SETTINGS
============================================
*/ 
// var host = '127.0.0.1';
// var port = 3000;
var host = '172.16.48.166';
var port = 9966;
var zone = "Africa/Lagos";
var servertime = new Date();
var time = moment.tz(servertime, zone);
// var connect = mysql.createConnection({
//   host: "localhost",
//   user: "netspring",
//   password: "empcog123",
//   database: "solarbase"
// });


// Keep track of connected devices
var clients = [];

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort; 
  console.log('A New Device ' + socket.remoteAddress +':'+ socket.remotePort + ' just connected') ;
 
  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  //socket.write("Welcome " + socket.name + "\n");
  //broadcast(socket.name + " joined the chat\n", socket);



  // Handle incoming messages from clients.
  socket.on('data', function (data) {

        console.log('DATA ' + socket.remoteAddress + ': ' + data);
        var info = data.toString(); 
        var res = info.split("/");

      //Turn on Device
      // document.getElementById('startBtn').addEventListener('click', function(){

      //   socket.write('ArnergyTcp/101');

      // });


      // //Turn off Device
      // document.getElementById('stopBtn').addEventListener('click', function(){

      //   socket.write('ArnergyTcp/102');

      // });


      // //Reset Device
      // document.getElementById('resetBtn').addEventListener('click', function(){

      //   socket.write('ArnergyTcp/103');

      // });







       // console.log(res.length);
        /*
        ========================================================================
        check whether the information is valid for this server
        ========================================================================
        */   
        if(res.length < 2)
        {
            socket.write('05');
        }
        else
        {   
            var setupcheck = res[1].substring(0,5);
            var timecheck = res[1].substring(0,4);
            //console.log(setupcheck);
            if(setupcheck=="setup")
            {
               
                // connect.query('SELECT * FROM serverids ORDER BY ID DESC LIMIT 1', function(err,result){
                //    if(err)
                //    {
                //         throw err;
                //    }
                //    else
                //    {
                //         console.log(result);
                //    }
                // });

                 socket.write('51245678901234');

            }

            else if(timecheck=="time")
            {
                //fetch system time
                var thetime = time.format('YYYYMMDD/HHmmss');
                socket.write(thetime);
            }
            else if(res[2]=="data")
            {
                var val1 = ('0' in res)? res[0] : "0";
                var val2 = ('1' in res)? res[1] : "0";
                var val3 = ('2' in res)? res[2] : "0";
                var val4 = ('3' in res)? res[3] : "0";
                var val5 = ('4' in res)? res[4] : "0";
                var val6 = ('5' in res)? res[5] : "0";
                var val7 = ('6' in res)? res[6] : "0";
                var val8 = ('7' in res)? res[7] : "0";
                var val9 = ('8' in res)? res[8] : "0";
                var val10 = ('9' in res)? res[9] : "0";
                var val11 = ('10' in res)? res[10] : "0";
                var val12 = ('11' in res)? res[11] : "0";
                var val13 = ('12' in res)? res[12] : "0";
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
                // var query = connect.query("INSERT INTO serverdatalogs set ?", contents, function(err, result)
                // {
                //     //console.log(query.log);
                //     if(err)
                //     {
                //         console.error(err);
                //         //return;
                //     }
                //     else
                //     {
                //         console.log("Server details added successfully");
                //     }
                // });


                if(checkl =="eof")
                {
                    socket.write('00');

                }
                else
                {
                    socket.write('01');
                }

            }

            else if(res[2]=="msg")
            {
                var val1 = ('0' in res)? res[0] : "0";
                var val2 = ('1' in res)? res[1] : "0";
                var val3 = ('2' in res)? res[2] : "0";
                var val4 = ('3' in res)? res[3] : "0";
                var val5 = ('4' in res) ? res[4] : "0";
                //console.log(val5);
                var checkl = val5.substring(0,3);

                //push fetched data to serverdatalogs
                var contents = {
                    DeviceID: val2,
                    MessageID: val4,
                    AddedOn: time.format('YYYY-MM-DD HH:mm:ss')
                }
                // var query = connect.query("INSERT INTO servermessagelogs set ?", contents, function(err, result)
                // {
                //     //console.log(query.log);
                //     if(err)
                //     {
                //         console.error(err);
                //         //return;
                //     }
                //     else
                //     {
                //         console.log("Server message added successfully");
                //     }
                // });

                if(checkl =="eof")
                {
                    socket.write('02');
                }
                else
                {
                    socket.write('03');
                }
            }
        }
        

        
    });
 //Handle error from clients
 socket.on("error", function(err)
 {
    console.log("Caught client error: ");
    //console.log(err.stack);
    console.log(err);
 });

 

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    console.log(socket.remoteAddress +':'+ socket.remotePort + ' has disconnected');
    //broadcast(socket.name + " left the chat.\n");
  });
  
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(process.env.PORT || port, function(){
  console.log('listening on ');
});


// http.listen(process.env.PORT || 3000, function(){
//   console.log('listening on', http.address().port);
// });

// Put a friendly message on the terminal of the server.
console.log('Server listening on ' + host +':'+ port);

