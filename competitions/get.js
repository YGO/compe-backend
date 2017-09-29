'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  let result = {};
  let getCompetition = (id) => {
    return new Promise((resolve, reject) => {
      let paramCompetitions = {
        TableName: process.env.COMPETITIONS_TABLE,
          Key: { id: id }
        };

      dynamoDb.get(paramCompetitions, (error, competitionsResult) => {
        if (error) {
          console.error("Unable to competitionsResult:", JSON.stringify(error, null, 2));
          return;
        }
       
        if(competitionsResult===null){
          resolve();
        }
        result = competitionsResult.Item;
        result.round_entries = [];
        result.players = [];
        result.scores = [];
        getRound(competitionsResult.Item.id).then(() => {
          resolve();
        });
      });
    });
  };

  let getRound = (competitionId) => {
   
    return new Promise((resolve, reject) => {
      let paramRounds = {
        TableName: process.env.ROUNDS_TABLE,
        KeyConditionExpression: 'competition_id = :competition_id',
        IndexName: 'rounds-index',
        ExpressionAttributeValues: {
          ":competition_id": competitionId
        } 
      };

      dynamoDb.query(paramRounds, (error, roundsResult) => {
        if (error) {
          console.error("Unable to roundsResult:", JSON.stringify(error, null, 2));
          return;
        } 
       
        result.rounds = roundsResult.Items;
        let arr = [];
        for(var i=0;i<roundsResult.Items.length;i++){
          arr.push(getRoundEntry(roundsResult.Items[i].id));
        }

        Promise.all(arr).then(() => {
          resolve();
        });
      });
    });
  };

  let getRoundEntry = (roundId) => {
    return new Promise((resolve, reject) => {
      let paramRoundEntries = {
        TableName: process.env.ROUND_ENTRIES_TABLE,
        IndexName: 'round-entries-index',
        KeyConditionExpression: 'round_id = :round_id',
        ExpressionAttributeValues: { ':round_id': roundId}
      };

      dynamoDb.query(paramRoundEntries, (error, roundEntriesResult) => {
        if (error) {
          console.error("Unable to roundEntriesResult:", JSON.stringify(error, null, 2));
          return;
        } 
       
        result.round_entries.push(roundEntriesResult.Items);
        console.log('roundEntriesResult.Items',roundEntriesResult.Items)
        let arr1 = [];
        let arr2 = [];
        for(var y=0;y<roundEntriesResult.Items.length;y++){
          arr1.push(getEntry(roundEntriesResult.Items[y].entry_id));
          arr2.push(getScore(roundEntriesResult.Items[y].id));
        }
        let finish = 0;
        Promise.all(arr1).then((all) => {
          result.players.push(all);
          finish++;
          if (finish == 2) resolve();
        });
        Promise.all(arr2).then((all) => {
          result.scores.push(all);
          finish++;
          if (finish == 2) resolve();
        });
      });
    });
  };

  let getEntry = (entryId) => {
    return new Promise((resolve, reject) => {
      let paramEntries = {
        TableName: process.env.ENTRIES_TABLE,
          Key: {
            id: entryId
          },
        };
      dynamoDb.get(paramEntries, (error, entriesResult) => {
        if (error) {
            console.error("Unable to entriesResult:", JSON.stringify(error, null, 2));
            return;
        } 
        
        getPlayer(entriesResult.Item.player_id).then((p) => {
          resolve(p);
        });
      });
    });
  };


  let getScore = (roundEntryId) => {
    console.log('roundEntryId',roundEntryId)
    return new Promise((resolve, reject) => {
      let paramScores = {
        TableName : process.env.SCORES_TABLE,
        KeyConditionExpression: 'round_entry_id = :round_entry_id',
        IndexName: 'scores-index',
        ExpressionAttributeValues: {
          ":round_entry_id": roundEntryId
        }  
      }

      dynamoDb.query(paramScores, (error, scoresResult) => {
        if (error) {
            console.error("Unable to roundEntryId:", JSON.stringify(error, null, 2));
            return;
        } 
      
        if(scoresResult.Items!=='undefined')
          resolve(scoresResult.Items);
        else
          resolve();
      });
    });
  };

  let getPlayer = (playerId) => {
    console.log('playerId',playerId)
    return new Promise((resolve, reject) => {
      let paramPlayers = {
        TableName: process.env.PLAYERS_TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': playerId}
      };
      dynamoDb.query(paramPlayers, (error, playersResult) => {
        if (error) {
            console.error("Unable to getPlayer:", JSON.stringify(error, null, 2));
            return;
        } 
       
        if(playersResult.Items!=='undefined')
          resolve(playersResult.Items);
        else
          resolve();
      });
    });
  };

  getCompetition(event.pathParameters.id).then(() => {
    console.log(result);
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      },
      body: JSON.stringify(result),
    };
    callback(null, response);

  });
};
