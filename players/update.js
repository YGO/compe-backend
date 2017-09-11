'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const Validator = require('jsonschema').Validator;
const v = new Validator();
let schema = {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "retired": { "type": "boolean" },
      "scores_day1": { "type": "array" },
      "scores_day2": { "type": "array" }
    }
};

const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body);  
  let cmd = '';
  if(v.validate(data, schema).valid) { //valid with schema
    let title = '';
    var num = 1;
    for (var key in data) {
      title = key;
      if(title === 'name')
        title = '#player_name';

      if(num === 1){
          cmd = 'SET ' + title +' = :'+key;
        }else{
          cmd += ', '+ title +' = :'+key;
      }
      num ++;
    }
  }else{
    callback(null, {
        statusCode: 400,
        body: JSON.stringify({"message": "Some parameters are invalid."})
    });
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
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({"message": "Couldn\'t update the player."})
      });
      return;
    }

    // create a response
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    });
  });
};
