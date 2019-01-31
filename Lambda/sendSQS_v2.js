'use strict';
var QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/752827468543/bottest';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});
     
// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}
 
// --------------- Events -----------------------
function dispatch(intentRequest, callback) {
    console.log(`request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    const sessionAttributes = intentRequest.sessionAttributes;
    var sendmessage;
    const slots = intentRequest.currentIntent.slots;
    const locationusa = slots.Location;
    const cuisine = slots.Cuisine;
    const noOfPeople = slots.HeadCount;
    const date = slots.Date;
    const time = slots.Time;
    const customerPhoneNumber = slots.PhoneNumber;
    
    if(locationusa == null || cuisine == null || date == null || noOfPeople == null || time == null || customerPhoneNumber == null ){
        callback(close(sessionAttributes, 'Fulfilled',
        {
            'contentType': 'PlainText', 
            'content': `Please provide the correct input. Thank You!!`
        }));
    }
    
    callback(close(sessionAttributes, 'Fulfilled',
        {
            'contentType': 'PlainText', 
            'content': `You will get the Dining information available in ${locationusa} on ${date} at ${time} on your number ${customerPhoneNumber} shortly. Thank You!!`
        }
    ));
    
    sendmessage = {
      "Location" : locationusa,
      "Cuisine" : cuisine,
      "HeadCount" : noOfPeople,
      "Date" : date,
      "Time" : time,
      "PhoneNumber" : customerPhoneNumber
  };
  
  sqsdata(sendmessage)
}
function sqsdata(event) {
  var params = {
    MessageBody: JSON.stringify(event),
    QueueUrl: QUEUE_URL
  };
  sqs.sendMessage(params, function(err,data){
    if(err) {
      console.log('error:',"Fail Send Message" + err);
    }else{
      console.log('data:',data.MessageId);
    }
  });
}

exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};