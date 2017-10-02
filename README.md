# YGO/compe-backend

## Setup

```bash
yarn install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

## Migrate dynamodb database in local

Install DynamoDB Local 
```bash
sls dynamodb install
```

```bash
sls dynamodb start -p 8000  --migrate true
```

## Run serverless and dynamodb in local

Step1: Set region and endpoint for AWS like as:

```
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
});
```

Step2: Run command
```bash
sls offline
```

