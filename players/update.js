'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const Validator = require('jsonschema').Validator;
const v = new Validator();
const schema = {
              "title": "Player",
              "type": "object",
              "properties": {
                "name": {
                    "type": "string"
                },
                "scores_day1": {
                  "type": "array",
                  "items": {
                    "type": "integer"
                  },
                  "minItems": 18,
                  "maxItems": 18
                },
                "scores_day2": {
                  "type": "array",
                  "items": {
                    "type": "integer"
                  },
                  "minItems": 18,
                  "maxItems": 18
                },
                "retired": {
                    "type": "boolean"
                },
              },
              "required": ["name", "scores_day1", "scores_day2", "retired"]
            };

const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body);

  if(!v.validate(data, schema).valid) {
    console.error('Validation Failed'); 
    callback(null, {statusCode: 400});
    return; 
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames:{
      '#player_name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': data.name,
      ':retired': data.retired,
      ':scores_day1': data.scores_day1,
      ':scores_day2': data.scores_day2,

    },
    UpdateExpression: 'SET #player_name = :name, scores_day1 = :scores_day1, scores_day2 = :scores_day2, retired = :retired',
    ReturnValues: 'ALL_NEW',
  };

  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {statusCode: 400});
      return;
    }

    // create a response
    callback(null, {statusCode: 204});
  });
};
