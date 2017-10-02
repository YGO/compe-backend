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
      // TODO support other fields
      ExpressionAttributeValues: {
        ':strokes': params.strokes,
      },
      UpdateExpression: 'SET strokes = :strokes',
    }).promise()
  }
}