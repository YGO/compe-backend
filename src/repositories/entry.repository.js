export class EntryRepository {
  constructor(docClient) {
    this.docClient = docClient
  }

  update(competitionId, entryNumber, params) {
    this.docClient.update({
      TableName: process.env.ENTRIES_TABLE,
      Key: {
        competition_id: competitionId,
        entry_number: entryNumber,
      },
      // TODO support other fields
      ExpressionAttributeValues: {
        ':retired': params.retired,
      },
      UpdateExpression: 'SET retired = :retired',
    }).promise()
  }
}