'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const Validator = require('jsonschema').Validator;
const v = new Validator();
const schema = {
              "title": "Entries",
              "type": "object",
              "properties": {
                "strokes": {
                  "retired": "boolean"
                }
              },
              "required": ["retired"]
            };


const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body);
  if(!v.validate(data, schema).valid) {
    console.error('Validation Failed'); 
    callback(null, {
      statusCode: 422,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      }
    });
    return; 
  }

  const params = {
    TableName: process.env.ENTRIES_TABLE,
    Key: {
      competition_id: event.pathParameters.id,
      player_id: event.pathParameters.playerid,
    },
    ExpressionAttributeValues: {
      ':retired': data.retired,

    },
    UpdateExpression: 'SET retired = :retired',
    ReturnValues: 'ALL_NEW',
  };

  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin" : "*"
        }
      });
      return;
    }

    // create a response
    callback(null, {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      }
    });
  });
};
