Steps:

Go to API Gateway
Create a New API by Importing from the Swagger File (Link in first Assignment)
Lets say your API name is chatbot
Connect your API to your Lambda function in Integration Request
Go to chatbot -> POST -> Method Request -> Authorization
Set it to AWS_IAM
Enable CORS
OPTIONS Method will be created
Go to chatbot -> OPTIONS -> Method Response -> Add Response -> 200
Enable CORS
Deploy the API
After Deploying:
Go to Stages->SDK Generation->Javascript
You will get a zip file which now has your API Gateway configuration and also methods to invoke it
Extract the zip and rename the extracted folder which contains lib and apigClient.js to 'gateway'
Make a folder called assets which has the following files:
amazon-cognito-identity.min.js
aws-cognito-sdk.min.js
aws-sdk.min.js
Copy gateway folder inside assets folder
We will be making use of all these files for authentication purpose
Attached sample code demonstrates how to import all the files and how to perform the authentication

https://mychat.auth.us-east-1.amazoncognito.com/login?redirect_uri=https://s3.amazonaws.com/chatbotccloud/chatbot.html&response_type=code&client_id=220uvbrttfuvmv68vik41sbi3q