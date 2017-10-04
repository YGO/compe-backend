import {
  buildExpressionAttributeValues,
  buildUpdateExpression
} from "./query-helper";

const validFields = [
  'retired',
  'player_name',
];

export class EntryRepository {
  constructor(docClient) {
    this.docClient = docClient
  }

  update(competitionId, entryNumber, params) {
    return this.docClient.update({
      TableName: process.env.ENTRIES_TABLE,
      Key: {
        competition_id: competitionId,
        entry_number: entryNumber,
      },
      ExpressionAttributeValues: buildExpressionAttributeValues(params, validFields),
      UpdateExpression: buildUpdateExpression(params, validFields),
    }).promise()
  }
}