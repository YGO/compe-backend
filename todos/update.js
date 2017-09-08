'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
 
  const data = JSON.parse(event.body);  
  var cmd = '';
  // validation
  if(typeof data.retired === 'boolean'){
    cmd = 'SET retired = :retired';
  }else if(data.day !== 'undefined' && Array.isArray(data.scores_day)){
    if(data.day == 1){
      cmd = 'SET scores_day1 = :scores_day';
    }if(data.day == 2){
       cmd = 'SET scores_day2 = :scores_day';
    }
  }else{
      console.error('Validation Failed');
      callback(new Error('Couldn\'t update the player.'));
      return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ':scores_day': data.scores_day,
      ':retired': data.retired
    },
    UpdateExpression: cmd,
    ReturnValues: 'ALL_NEW',
  };

  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t update the player.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
