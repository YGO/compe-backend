# YGO/compe-backend

## Setup

Install dependencies.
```bash
yarn install
```

Install DynamoDB Local 
```bash
sls dynamodb install
```

## Develop

Start DynamoDB Local
```bash
sls dynamodb start
```

Start Serverless Offline
```bash
sls offline --port 3001
curl "http://localhost:3001/competitions/pgateaching_201709"
```

## Deploy

Deploy to staging.
```bash
serverless deploy --stage staging
```

Deploy to production.
```bash
serverless deploy --stage production
```

