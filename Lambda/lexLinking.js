var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var lexruntime = new AWS.LexRuntime();

exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        var userInput = event.messages;
        var params = {
            botAlias: '$LATEST',
            botName: 'dining_bot',
            inputText: userInput, 
            userId: '1234',
            sessionAttributes: {
            someKey: 'STRING_VALUE',
        }
    };

    lexruntime.postText(params, function(err, data) {
        if (err) console.log(err); // an error occurred
        else callback(null, data.message);           
    });
    } catch (err) {
        console.log(err);
    }
};
