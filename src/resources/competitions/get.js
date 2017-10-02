import {CompetitionRepository} from "../../repositories/competition.repository";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();

const getCompetitionResources = (id) => {
  const repo = new CompetitionRepository(docClient);

  return Promise.all([
    repo.find(id),
    repo.findEntries(id),
    repo.findRounds(id),
    repo.findRoundEntries(id),
    repo.findHoles(id),
  ]).then(results => {
    const [competition, entries, rounds, roundEntries, holes] = results;
    return {
      competition, entries, rounds, roundEntries, holes
    }
  });
};

const makeResponseJson = (resources) => {
  const {competition, entries, rounds, roundEntries, holes} = resources;

  return {
    ...competition,
    entries: entries.map(p => ({
      id: `${competition.id}.${p.entry_number}`,
      player_name: p.player_name,
      retired: p.retired,
    })),
    rounds: rounds.map(r => ({
      id: `${competition.id}.${r.play_order}`,
      play_order: r.play_order,
      title: r.title,
    })),
    round_entries: roundEntries.map(re => {
      const [playOrder, entryNum] = re.round_entry_number.split('.');

      return {
        id: `${competition.id}.${re.round_entry_number}`,
        round_id: `${competition.id}.${playOrder}`,
        entry_id: `${competition.id}.${entryNum}`,
        sort_order: re.sort_order,
        strokes: re.strokes,
      }
    }),
    holes: holes.map(h => ({
      hole_num: h.hole_num,
      par: h.par,
      yard: h.yard,
    }))
  }
};

module.exports.handler = async (event, context, callback) => {
  const resources = await getCompetitionResources(event.pathParameters.id);
  const json = makeResponseJson(resources);

  callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(json),
  });
};
