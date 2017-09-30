'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const findCompetition = (id) => {
    return dynamoDb.get({
      TableName: process.env.COMPETITIONS_TABLE,
      Key: {
        id: id
      }
    }).promise()
      .then(res => res.Item)
      .catch(error => console.error("Unable to findCompetition:", JSON.stringify(error, null, 2)));
  };

  const findRounds = (competitionId) => {
    return dynamoDb.query({
      TableName: process.env.ROUNDS_TABLE,
      KeyConditionExpression: "competition_id = :competition_id",
      ExpressionAttributeValues: {
        ":competition_id": competitionId
      }
    }).promise()
      .then(res => res.Items)
      .catch(error => console.error("Unable to findRounds:", JSON.stringify(error, null, 2)));
  };

  const findHoles = (competitionId) => {
    return dynamoDb.query({
      TableName: process.env.HOLES_TABLE,
      KeyConditionExpression: "competition_id = :competition_id",
      ExpressionAttributeValues: {
        ":competition_id": competitionId
      }
    }).promise()
      .then(res => res.Items)
      .catch(error => console.error("Unable to findHoles:", JSON.stringify(error, null, 2)));
  };

  const findEntries = (competitionId) => {
    return dynamoDb.query({
      TableName: process.env.ENTRIES_TABLE,
      KeyConditionExpression: "competition_id = :competition_id",
      ExpressionAttributeValues: {
        ":competition_id": competitionId
      }
    }).promise()
      .then(res => res.Items)
      .catch(error => console.error("Unable to findEntries:", JSON.stringify(error, null, 2)));
  };

  const findRoundEntries = (list) => {
    const keys = list.map(e => ({
      id: e.id
    }));

    const chunks = chunkKeys(keys, 100);
    const promises = chunks.map(c => {
      return dynamoDb.batchGet({
        RequestItems: {
          'livescore-round_entries-staging': {
            Keys: c
          }
        }
      }).promise()
        .then(res => res.Responses[process.env.ROUND_ENTRIES_TABLE])
        .catch(error => console.error("Unable to findPlayers:", JSON.stringify(error, null, 2)));
    });

    return Promise.all(promises).then(chunks => {
      return chunks.reduce((a, b) => a.concat(b))
    });
  };

  const findScores = (list) => {
    const keys = list.map(e => ({
      id: e.id
    }));

    const chunks = chunkKeys(keys, 100);
    const promises = chunks.map(c => {
      return dynamoDb.batchGet({
        RequestItems: {
          'livescore-scores-staging': {
            Keys: c
          }
        }
      }).promise()
        .then(res => res.Responses[process.env.SCORES_TABLE])
        .catch(error => console.error("Unable to findPlayers:", JSON.stringify(error, null, 2)));
    });

    return Promise.all(promises).then(chunks => {
      return chunks.reduce((a, b) => a.concat(b))
    });
  };

  const findPlayers = (entries) => {
    const keys = entries.map(e => ({
      id: e.player_id
    }));

    const chunks = chunkKeys(keys, 100);
    const promises = chunks.map(c => {
      return dynamoDb.batchGet({
        RequestItems: {
          'livescore-players-staging': {
            Keys: c
          }
        }
      }).promise()
        .then(res => res.Responses[process.env.PLAYERS_TABLE])
        .catch(error => console.error("Unable to findPlayers:", JSON.stringify(error, null, 2)));
    });

    return Promise.all(promises).then(chunks => {
      return chunks.reduce((a, b) => a.concat(b))
    });
  };

  const chunkKeys = (keys, size) => {
    const chunks = [];
    while (keys.length > 0)
      chunks.push(keys.splice(0, size));
    return chunks
  };

  const convertPlayers = (players, entries) => {
    var list = [];
    players.forEach((p) => {
      entries.forEach((e) => {
        if (e.player_id === p.id) {
          list.push({
            id: p.id,
            name: p.name,
            retired: e.retired
          });
        }
      });
    });
    return list;
  };

  const convertScores = (scores) => {
    var list = [];
    scores.forEach((s) => {
      var arr = s.id.split(".")
      list.push({
        id: s.id,
        strokes: s.strokes,
        player_id: arr[1],
        round_id: `${arr[0]}.${arr[2]}`
      });
    });
    return list;
  };

  const convertRoundEntries = (rounds_entries) => {
    var list = [];
    rounds_entries.forEach((re) => {
      var arr = re.id.split(".")
      list.push({
        round_id: `${arr[0]}.${arr[2]}`,
        player_id: arr[1],
        sort_order: arr[2]
      });
    });
    return list;
  };
  const convertRounds = (rounds) => {
    var list = [];
    rounds.forEach((r) => {
      list.push({
        id: `${r.competition_id}.${r.play_order}`,
        play_order: r.play_order,
        title: r.title
      });
    });
    return list;
  };
  const getAllCompetitionData = async (competitionId) => {
    const competition = await findCompetition(competitionId);
    const [holes, listRounds, entries] = await Promise.all([
      findHoles(competition.id),
      findRounds(competition.id),
      findEntries(competition.id),
    ]);

    var listId = [];
    entries.forEach((e) => {
      listRounds.forEach((r) => {
        if (e.competition_id === r.competition_id)
          listId.push({id: `${e.competition_id}.${e.player_id}.${r.play_order}`})
      });
    });

    const [listPlayers, listRoundEntries, listScores] = await Promise.all([
      findPlayers(entries),
      findRoundEntries(listId),
      findScores(listId),
    ]);

    var players = convertPlayers(listPlayers, entries);
    var scores = convertScores(listScores);
    var rounds = convertRounds(listRounds);
    var round_entries = convertRoundEntries(listRoundEntries);

    var data = {
      ...competition,
      holes, rounds, entries, round_entries, scores, players
    }
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data),
    };
    callback(null, response);
  };

  getAllCompetitionData(event.pathParameters.id);
};
