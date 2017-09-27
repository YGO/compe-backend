'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const Validator = require('jsonschema').Validator;
const v = new Validator();
const schema = {
              "title": "Scores",
              "type": "object",
              "properties": {
                "strokes": {
                  "type": "array",
                  "items": {
                    "type": "integer"
                  },
                  "minItems": 18,
                  "maxItems": 18
                }
              },
              "required": ["strokes"]
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
    TableName: process.env.SCORES_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  
    ExpressionAttributeValues: {
      ':strokes': data.strokes,
    },
    UpdateExpression: 'SET strokes = :strokes',
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
