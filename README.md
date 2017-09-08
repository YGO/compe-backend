
title: AWS Serverless 
description: Setup Web Service to get list and update players. DynamoDB is used to store the data. 
layout: Doc

## Setup

```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
Serverless: Stack update finished…

Service Information
service: players
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  GET - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
  PUT - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
functions:
  list: players-dev-list
  update: players-dev-update
```

## Usage

You can retrieve, update player with the following commands:


### List all Players

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
```

Example output:
```bash
[{"scores_day2":[1,2,3,4,5,6,7,26],"scores_day1":[1,2,3,4,5,1,4,26],"id":"0dd775b0-93b4-11e7-a5d0-ed9001309ef9","name":"Test player","retired":false}]%
```


### Update a Player

```bash
# Replace the <id> part with a real id from your todos table
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id> --data '{ "day":1,"scores_day":[1,2,3,4,5,1,4,26] }'
```

Example Result:
```bash
{"scores_day2":[1,2,3,4,5,6,7,26],"scores_day1":[1,2,3,4,5,1,4,26],"id":"0dd775b0-93b4-11e7-a5d0-ed9001309ef9","name":"Learn Serverless","retired":false}%
```

