import * as AWS from "aws-sdk";
import {EntryRepository} from "../../repositories/entry.repository";

const baseResponse = {
  headers: {
    "Access-Control-Allow-Origin" : "*"
  }
};

const docClient = new AWS.DynamoDB.DocumentClient();

const Ajv = require('ajv');
const ajv = new Ajv();
const validateEntry = ajv.compile({
  title: 'Entry',
  type: 'object',
  properties: {
    competition_id: {
      type: 'string',
    },
    entry_number: {
      type: 'string',
    },
    retired: {
      type: 'boolean',
    }
  },
  required: ['competition_id', 'entry_number']
});

const mapEventToEntry = event => {
  const id = event.pathParameters.id;
  const params = JSON.parse(event.body);
  const [competitionId, entryNumber] = id.split('.');

  return {
    competition_id: competitionId,
    entry_number: entryNumber,
    ...params,
  };
};

module.exports.handler = async (event, context, callback) => {
  const entry = mapEventToEntry(event);

  if(!validateEntry(entry)) {
    callback(null, {
      ...baseResponse,
      statusCode: 422,
      body: JSON.stringify(validateEntry.errors),
    });
    return
  }

  try {
    const repo = new EntryRepository(docClient);
    await repo.update(entry.competition_id, entry.entry_number, {
      retired: entry.retired,
    });
    callback(null, {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      }
    });
  } catch (e) {
    console.error(e);
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      }
    });
  }
};
