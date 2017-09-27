'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.COMPETITIONS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };
  console.log('event.pathParameters.id',event.pathParameters.id)
  console.log('process.env.COMPETITIONS_TABLE',process.env.COMPETITIONS_TABLE)

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }
    console.log('result',result)
    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};


var fillTwitterTpl = function(content, item) {
  return 'aaaa'
}
               


