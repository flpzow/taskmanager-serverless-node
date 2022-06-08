import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from "../utils/dynamodbClient";

interface ITodo {
  id: string;
  title: string;
}


export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;

  const response = await document.query({
    TableName: "usersTodo",
    KeyConditionExpression: "user_id = :id",
    ExpressionAttributeValues: {
      ":id": user_id
    }
  }).promise();

  const todoCreated = response.Items[0] as ITodo;

  if (todoCreated) {
    return {
      statusCode: 201,
      body: JSON.stringify({
        todo: response.Items
      })
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Todo não encontrado"
    })
  }
}