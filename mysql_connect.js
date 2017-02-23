  mysql = require('mysql');
  express = require('express');

  /*
  ===========================================================
  run a trip to solarbase to fetch an ID for this system
  ===========================================================
  */
  var pool = mysql.createPool({
    connectionLimit: 100 //important
    host: "localhost",
    user: "netspring",
    password: "empcog123",
    database: "solarbase",
    debug:true
  });

  var app = express();

  /*
  ===========================================================
  Connect to DB
  ===========================================================
  */
  con.connect(function(err){
    if(err){
      console.log('Database connection could not be established because ' + err);
      return;
    }
    //console.log('Connection established successfully');
  });


  /*
  ===========================================================
  Fetch Query
  ===========================================================
  */

  app.get("/",function(req,res)
  {
      con.query('SELECT * from serverids', function(err, rows, fields) {
      con.end();
      if (!err)
        console.log('The solution is: ', rows);
      else
        console.log('Error while performing Query.');
      });
  });

  app.listen(3000);



  //terminate connection
  // con.end(function(err){
  //     //terminate connection gracefully
  //     //console.log('Connection closed successfully');
  // })