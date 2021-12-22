const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const EUFY_SECURITY_USER_TABLE = 'eufy-security-users'

var documentClient = new AWS.DynamoDB.DocumentClient();;

/* EXAMPLE USER:
 {
    "created": "2007-11-06T16:34:41.000Z",
    "email": "ethan.bowen@gmail.com",
    "active": true,
    "updated": "2007-11-06T16:34:41.000Z"
  }
 */

exports.handler = async function userEndpoints(event, context, callback) {
  console.log(event);

  const body = JSON.parse(event.body);
  var responseBody = {};
  switch (event.requestContext.httpMethod) {
    case "GET":
      responseBody = await get(); break;
    case "POST":
      await post(body.email).then(data => responseBody = data);
      //send email in here?
      break;
    case "PUT":
      await put(body).then(data => responseBody = data);
      break;
    case "DELETE":
      await del(event.queryStringParameters.email)
      break;
    default: throw Error("Unsupported HTTP Method", event.httpMethod)
  }

  // Enable CORS - This Lambda uses Lambda Proxy Integration with API Gateway
  // So this is the only way to enable CORS.
  let response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(responseBody)
  };
  console.log("response: " + JSON.stringify(response))
  return response;
};

//COPIED FROM INTERNET - SCANS BASED ON PARAMS TILL ALL KEYS ARE EVALUATED
const scanAll = async (params) => {
  let lastEvaluatedKey = 'dummy'; // string must not be empty
  const itemsAll = [];
  while (lastEvaluatedKey) {
    const data = await documentClient.scan(params).promise();
    itemsAll.push(...data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  return itemsAll;
}

/**
 * Returns all users
 * @returns 
 */
async function get() {
  var params = {
    TableName: EUFY_SECURITY_USER_TABLE,
  }

  return await scanAll(params)
}


/**
 * Create User in DynamoDB
 * @param {*} email
 * @returns 
 */
async function post(email) {
  var params = {
    TableName: EUFY_SECURITY_USER_TABLE,
    Item: {
      "email": email,
      "updated": `${new Date().toISOString()}`,
      "created": `${new Date().toISOString()}`,
      "active": true  //default value
    }
  }

  return await documentClient.put(params).promise();
}

/**
 * Update user
 * @param {} user 
 * @returns 
 */
async function put(user) {
  var params = {
    TableName: EUFY_SECURITY_USER_TABLE,
    Key: { "email": user.email },
    UpdateExpression: "set updated=:u, ",
    ExpressionAttributeValues: {
      ":u": `${new Date().toISOString()}`,
    },
    ReturnValues: "UPDATED_NEW"
  }

  if (user.active != undefined) {
    params['UpdateExpression'] += "active = :a"
    params['ExpressionAttributeValues'][':a'] = user.active
  }

  console.log("PUT PARAMS", params)
  return await documentClient.update(params).promise();
}

async function del(email) {
  var params = {
    TableName: EUFY_SECURITY_USER_TABLE,
    Key: {
      "email": email
    }
  };

  return await documentClient.delete(params).promise();
}