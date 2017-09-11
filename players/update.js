'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body);  
  let cmd = '';

  if(typeof data.name === 'string'){
    cmd = 'SET #player_name = :name';
  }

  if(data.retired !== 'undefined' && typeof data.retired === 'boolean'){
    cmd = checkCommand(cmd,'retired');
  }


  if(data.scores_day1 !== 'undefined' && Array.isArray(data.scores_day1)){
    cmd = checkCommand(cmd,'scores_day1');
  }

  if(data.scores_day2 !== 'undefined' && Array.isArray(data.scores_day2)){
    cmd = checkCommand(cmd,'scores_day2');
  }

  if(cmd === ''){
      const response = {
        statusCode: 400,
        body: JSON.stringify({"message": "Some parameters are invalid."}),
      };
      callback(null, response);
      return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ':name': data.name,
      ':retired': data.retired,
      ':scores_day1': data.scores_day1,
      ':scores_day2': data.scores_day2,

    },
    UpdateExpression: cmd,
    ReturnValues: 'ALL_NEW',
  };

  if(typeof data.name === 'string'){
    params.ExpressionAttributeNames = {'#player_name': 'name'};
  }
  
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      const response = {
        statusCode: 400,
        body: JSON.stringify({"message": "Couldn\'t update the player."}),
      };
      callback(null, response);
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

function checkCommand(cmd, parameters) {
  if(cmd === ''){
    cmd = 'SET ' + parameters +' = :'+parameters;
  }else{
    cmd += ', '+ parameters +' = :'+parameters;
  }
  return cmd;
}
