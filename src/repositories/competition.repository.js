export class CompetitionRepository {
  constructor(docClient) {
    this.docClient = docClient
  }

  find(id) {
    return this.docClient.get({
      TableName: process.env.COMPETITIONS_TABLE,
      Key: {
        id: id
      }
    }).promise()
      .then(res => res.Item)
      .catch(error => console.error(JSON.stringify(error, null, 2)));
  }

  findEntries(competitionId) {
    return this._findRelatedItems(competitionId, process.env.ENTRIES_TABLE)
  }

  findRounds(competitionId) {
    return this._findRelatedItems(competitionId, process.env.ROUNDS_TABLE)
  }

  findHoles(competitionId) {
    return this._findRelatedItems(competitionId, process.env.HOLES_TABLE)
  }

  findRoundEntries(competitionId) {
    return this._findRelatedItems(competitionId, process.env.ROUND_ENTRIES_TABLE)
  }

  _findRelatedItems(competitionId, resourceName) {
    return this.docClient.query({
      TableName: resourceName,
      KeyConditionExpression: "competition_id = :competition_id",
      ExpressionAttributeValues: {
        ":competition_id": competitionId
      }
    }).promise()
      .then(res => res.Items)
      .catch(error => console.error(JSON.stringify(error, null, 2)));
  }
}