export const buildExpressionAttributeValues = (params, validFields) => {
  return Object.keys(params).filter(k => validFields.includes(k)).reduce((acc, k) => {
    acc[`:${k}`] = params[k];
    return acc
  }, {})
};

export const buildUpdateExpression = (params, validFields) => {
  const ops = Object.keys(params)
    .filter(k => validFields.includes(k))
    .map(k => `${k} = :${k}`)
    .join(', ');

  return `SET ${ops}`
};