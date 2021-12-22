const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const documentClient = new AWS.DynamoDB.DocumentClient();

const EUFY_SECURITY_USER_TABLE = 'eufy-security-users'
/**
 * When a user signs into Cognito EVERYTIME, this script runs.
 * This code verifies the user is active in and can sign in.
 * 
 * This script runs on the initial sign in AND before the user is authed every time.
 * 
 * Initial Sign in use case:  The user doesn't exist in Cognito and doesn't have access to the applicaiton, so 
 * we want to prevent from creating a Cognito user block them out early in the process.  
 * The Signup trigger only runs once when the user initially signs in and before we create the Cognito user.
 * 
 * Before Auth is confirmed use case: The user exists but is set to inactive, so do not allow to sign in.
 * 
 * Steps:
 * 1. Get email from event, lowercase it
 * 2. Get active status from user table in DynamoDB 
 * 3. State table based on user fields and outcomes
 * ------------------------------------------------------------------------------------------
 * active | expected-output
 * false  | Error.  No Cognito User created.  Redirected.
 * true   | Pass-through.  Cognito User created by COGNITO
 * ------------------------------------------------------------------------------------------
 * @param {*} event AWS Lambda Event, holds Cognito user attribute values
 * @param {*} context AWS Context, holds aws-oriented information
 * @param {*} callback AWS function callback for Cognito
 */
exports.handler = async function preSignupAndPreConfigurationTrigger(event, context, callback) {
  var email = event.request.userAttributes.email.toLowerCase();

  const user = await getUser(email);

  if (user === undefined) {
    var error = new Error("User not defined")

    // Return error to Amazon Cognito
    callback(error, event);
  }

  if (!user.active) {
    var error = new Error("User inactivated")

    // Return error to Amazon Cognito
    callback(error, event);
  }

  // Return to Amazon Cognito without error
  callback(null, event);
};

/**
 * Get User by email from user table
 * @param {*} email simple email, without federated prefix
 * @returns User associated with email
 */
async function getUser(email) {
  var params = getFormattedDBParams(email)
  var user = null;

  await documentClient.get(params)
    .promise()
    .then(data => {
      console.log("user data", data);
      user = data.Item;
    })

  return user;
}

/**
 * Format and structure parameters needed for DynamoDB
 * @param {*} email simple email, without federated prefix
 * @returns formatted DynamoDb compliant json structure
 */
function getFormattedDBParams(email) {
  return {
    Key: {
      'email': email.replace("@", "\@")
    },
    TableName: EUFY_SECURITY_USER_TABLE
  };
}