import {
  buildExpressionAttributeValues,
  buildUpdateExpression
} from "./query-helper";

const validFields = [
  'strokes',
  'sort_order',
];

export class RoundEntryRepository {
  constructor(docClient) {
    this.docClient = docClient
  }

  update(competitionId, roundEntryNumber, params) {
    return this.docClient.update({
      TableName: process.env.ROUND_ENTRIES_TABLE,
      Key: {
        competition_id: competitionId,
        round_entry_number: roundEntryNumber,
      },
      ExpressionAttributeValues: buildExpressionAttributeValues(params, validFields),
      UpdateExpression: buildUpdateExpression(params, validFields),
    }).promise()
  }
}