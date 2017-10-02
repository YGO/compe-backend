import * as AWS from "aws-sdk";
import {CompetitionRepository} from "./competition.repository";
import {EntryRepository} from "./entry.repository";
import {RoundEntryRepository} from "./round_entry.repository";

let docClient;

if (process.env.APP_STAGE === 'dev') {
  docClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  docClient = new AWS.DynamoDB.DocumentClient();
}

export const competitionRepository = new CompetitionRepository(docClient);
export const entryRepository = new EntryRepository(docClient);
export const roundEntryRepository = new RoundEntryRepository(docClient);
