var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region: 'us-east-1'});
var lambda = new AWS.Lambda({region: 'us-east-1'});
var sns = new AWS.SNS();
var https = require('https');
var ses = new AWS.SES({apiVersion: '2010-12-01'});
var myurl = 'https://api.yelp.com/v3/businesses/search';

var doc = require('dynamodb-doc');
var docClient = new doc.DynamoDB(); 
 
function receiveMessages(callback) {
  var params = {
    QueueUrl: 'xxxxxxx',    // url of the queue
    MaxNumberOfMessages: 10,
    WaitTimeSeconds:20, 
    VisibilityTimeout:30
  };
  
  sqs.receiveMessage(params, function(err, data) { 
    if (err) {
      console.error(err, err.stack);
      callback(err);
    } else {
      callback(null, data.Messages);
    }
  });
}


function handleSQSMessages(context, callback) {
  console.log("In Receive message\n");
  
  receiveMessages(function(err, messages) {
    if (messages && messages.length > 0) {
        console.log(messages.length);
        
        var invocations = [];
        messages.forEach(function(message) {
          var deleteParams = {
              QueueUrl: 'https://sqs.us-east-1.amazonaws.com/xxxxxxx',  // enter the url
              ReceiptHandle: message.ReceiptHandle 
          }
          var botRequestData = JSON.parse(message['Body']);
          console.log("Message Reciepent " + message.ReceiptHandle);
          
          //we have put this to handle empty objects
          if (Object.keys(botRequestData).length === 0)
          {
            sqs.deleteMessage(deleteParams, function(err, data2) {
              if (err) {
                console.log("Delete Error", err);
              } 
              else {
                console.log("Message Deleted", data2);
              }
            });
            
            return;
          }
            
            console.log(botRequestData["PhoneNumber"]);
            console.log(botRequestData["Location"]);
            console.log(botRequestData["Cuisine"]);
            console.log(botRequestData["Date"]);
          
            var dateObj = new Date(botRequestData["Date"] + ' ' + botRequestData['Time']);
            
            var timeStamp = dateObj.getTime()/1000;
            
            var cuisine = botRequestData["Cuisine"]
            
            if (cuisine === 'Indian'){
              cuisine = 'indpak';
            }
            
            var queryString = '/v3/businesses/search?limit=3&term=dinner&' + 'location=' + botRequestData["Location"].trim() + '&categories=' 
                              + cuisine.trim().toLowerCase() + '&open_at=' + timeStamp;
                              
            console.log(queryString);
          
            https.get({
              headers : {
                        'Authorization' : 'Bearer xxxxxxx'  // enter the authorization yelp key in md5 format
                    },
                      
                  host : 'api.yelp.com',
                  path : queryString,
                  method: 'GET'
              }, function(res){
                var resp = "";
                res.on("data", function(data){
                  resp += data;
                });
                              
                res.on("end", function(){
                      console.log(botRequestData['Time']);
                
                  var jsonResp = JSON.parse(resp);
                  
                  console.log('resp', resp);
                  console.log('jsonresp',jsonResp);
                  var msgData = "";
                  
                  if (jsonResp['total'] > 0)
                  {
                      var businesses = jsonResp['businesses'];
                      
                      var restoList = '';
                      businesses.forEach( (item, index) => {
                        
                        var num = index+1;
                        var temp = num.toString() + '. ' + item['name'] + ' at ' + item['location']['address1'] + ' ';
                      restoList += temp; //add restaurant name to the list
                    });
                      msgData = 'Hello! Here are my ' + botRequestData['Cuisine'] + ' restaurant suggestions for ' + botRequestData['HeadCount'] + 
                            ' people, for ' + botRequestData['Date'] + ' at '  + botRequestData['Time']  + ' are ' + restoList + ' Enjoy your meal!';
                  }
                  else
                  {
                    msgData = 'Hello! We are currently not able to find any ' + botRequestData['Cuisine'] +  ' restaurants at ' + botRequestData['Location'] + ' for ' +  
                              botRequestData['Date'];
                  }  
                  var data1 = {
                    Message : msgData,
                    MessageStructure: 'string',
                    PhoneNumber : '+1' + botRequestData["PhoneNumber"]
                  };
                  
                  
                  sns.publish(data1, function(err, data2) {
                    if (err) 
                      {
                        console.log(err, err.stack);
                        console.log("error "+ err);
                        console.log("stack "+ err.stack);
                      } // an error occurred
                    else   
                      {  console.log( "Msg Resp: " + data2);
                        
                        sqs.deleteMessage(deleteParams, function(err, data2) {
                            if (err) {
                              console.log("Delete Error", err);
                            } 
                            else {
                              var params = {
                                TableName : "yelpSuggestion",
                                Item : {
                                    "id" :String(data2['ResponseMetadata']['RequestId']),
                                    "data" : String(resp)
                                }
                              }
                              docClient.putItem(params, function(err, data2) {
                                if (err) {
                                  console.log("Error", err);
                                } else {
                                  console.log("Success", data2);
                                }
                              });
                              console.log("Message Deleted", data2);
                            }
                          });
                      }        // successful response
                  });
              });
            });
        });
           
                
    } 
    else {
      
      if (err)
      {
        console.log(err);
      }
      else
      {
        callback(null, 'DONE');
        
      }
    }
  });
}
exports.handler = function(event, context, callback) {
  handleSQSMessages(context, callback);
};