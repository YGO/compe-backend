import {roundEntryRepository} from "../../repositories/index"

const baseResponse = {
  headers: {
    "Access-Control-Allow-Origin": "*"
  }
};

const Ajv = require('ajv');
const ajv = new Ajv();
const validateRoundEntry = ajv.compile({
  title: 'RoundEntry Update Parameter',
  type: 'object',
  properties: {
    competition_id: {
      type: 'string',
    },
    round_entry_number: {
      type: 'string',
    },
    strokes: {
      type: 'array',
      minItems: 18,
      maxItems: 18,
      items: {
        type: 'integer',
        minimum: 0,
      }
    },
    sort_order: {
      type: 'number',
    }
  },
  required: ['competition_id', 'round_entry_number']
});

const mapEventToRoundEntry = event => {
  const id = event.pathParameters.id;
  const [competitionId, playOrder, entryNumber] = id.split('.');

  return {
    competition_id: competitionId,
    round_entry_number: `${playOrder}.${entryNumber}`,
    ...JSON.parse(event.body),
  };
};

module.exports.handler = async (event, context, callback) => {
  const roundEntry = mapEventToRoundEntry(event);

  if (!validateRoundEntry(roundEntry)) {
    callback(null, {
      ...baseResponse,
      statusCode: 422,
      body: JSON.stringify(validateRoundEntry.errors),
    });
    return
  }

  try {
    const repo = roundEntryRepository();
    await repo.update(roundEntry.competition_id, roundEntry.round_entry_number, roundEntry);
    callback(null, {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    console.error(e);
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
