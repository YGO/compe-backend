var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();


var linkData = "http://livescore.golfnetwork.co.jp/pgateaching_201611/data";

console.log("Start import");


//Competition
console.log("* Create Competition *");
var competitionId = "pgateaching_201611";
var clubName = "登別カントリー倶楽部";
var clubURL = "http://www.noboribetsu-cc.com/";
var officialURL = "http://www.pgatour.jp/teaching/2016/";
var term = "2016年11月1日〜2日";
var title = "第１８回ＰＧＡティーチングプロ選手権大会";
var youtubeURL = "https://www.youtube.com/embed/cr0X-LO8Hto?autoplay=1";

var table = "livescore-competitions-dev";

var params = {
    TableName: table,
    Item:{
        "id": competitionId,
        "club_name": clubName,
        "club_url": clubURL,
        "official_url": officialURL,
        "term": term,
        "title": title,
        "youtube_url": youtubeURL,
    }
};
createNew(params)

//Rounds
console.log("* Create Rounds *");
table = "livescore-rounds-dev";
var rounds = [
      {
        competition_id: competitionId,
        play_order: 1,
        title:  "1日目",
      },
      {
        competition_id: competitionId,
        play_order: 2,
        title:  "2日目",
      }
    ];

createByArray(table, rounds)

//Holes -- link http://www.pgatour.jp/teaching/2016/game_information/hole_guide/
var holes = [{
    competition_id: competitionId,
    hole_num: 1,
    par: 4,
    yard: 417
  },{
    competition_id: competitionId,
    hole_num: 2,
    par: 4,
    yard: 362
  },{
    competition_id: competitionId,
    hole_num: 3,
    par: 4,
    yard: 390
  },{
    competition_id: competitionId,
    hole_num: 4,
    par: 3,
    yard: 155
  },{
    competition_id: competitionId,
    hole_num: 5,
    par: 4,
    yard: 367
  },{
    competition_id: competitionId,
    hole_num: 6,
    par: 5,
    yard: 548
  },{
    competition_id: competitionId,
    hole_num: 7,
    par: 4,
    yard: 394
  },{
    competition_id: competitionId,
    hole_num: 8,
    par: 3,
    yard: 158
  },{
    competition_id: competitionId,
    hole_num: 9,
    par: 5,
    yard: 467
  },{
    competition_id: competitionId,
    hole_num: 10,
    par: 5,
    yard: 491
  },{
    competition_id: competitionId,
    hole_num: 11,
    par: 4,
    yard: 395
  },{
    competition_id: competitionId,
    hole_num: 12,
    par: 3,
    yard: 174
  },{
    competition_id: competitionId,
    hole_num: 13,
    par: 4,
    yard: 428
  },{
    competition_id: competitionId,
    hole_num: 14,
    par: 4,
    yard: 533
  },{
    competition_id: competitionId,
    hole_num: 15,
    par: 3,
    yard: 160
  },{
    competition_id: competitionId,
    hole_num: 16,
    par: 4,
    yard: 355
  },{
    competition_id: competitionId,
    hole_num: 17,
    par: 4,
    yard: 397
  },{
    competition_id: competitionId,
    hole_num: 18,
    par: 4,
    yard: 392
  }
];

//Rounds
console.log("* Create Holes *");
table = "livescore-holes-dev";

createByArray(table, holes)

// Entries

const request = require('request');
var data = [];
var entriesParam = []
var roundEntriesParam = []
 
request(linkData, { json: true }, (err, res) => {
  if (err) { return console.log(err); }
  data = res.body

  for(var index in data){
      var entry = {
      competition_id: competitionId,
      entry_number: index,
      player_name: data[index].player.name,
      retired: false
    }
    entriesParam.push(entry)

    for (var day_index in data[index].days_scores){
      var strokes = []
      var score = data[index].days_scores[day_index]

      for(i = 1; i <= 18; i++){
        var stroke = score['sc' + i];
        var parByHole = holes[i - 1].par;
        if(stroke != "-"){
          parByHole = parByHole + parseInt(stroke);
        }
        if (stroke == ""){
          parByHole = 0
        }
        strokes.push(parByHole);
      }


      var roundEntry = {
        competition_id: competitionId,
        round_entry_number: rounds[day_index].play_order + "." + index,
        sort_order: score.seq,
        strokes: strokes
      }
      roundEntriesParam.push(roundEntry)
    }
  }
  console.log("* Create Entries *");
  createByArray("livescore-entries-dev", entriesParam)
  console.log("* Create Rounds Entries *");
  createByArray("livescore-round_entries-dev", roundEntriesParam)
});

function createByArray(tableName, params){
  for(var index in params){
    param = {
      TableName: tableName,
      Item: params[index]
    }
    createNew(param)
  }
}

function createNew(params){
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    }
  });
}