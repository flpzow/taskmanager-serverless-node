import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidV4 } from "uuid";

import { document } from "../utils/dynamodbClient";

interface ICreateTodo {
  title: string;
  deadline: string;
}

interface ITemplate {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  deadline: Date;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;
  const { user_id } = event.pathParameters;

  const todo: ITemplate = {
    id: uuidV4(),
    user_id,
    title,
    done: false, 
    deadline: new Date(deadline)
  }

  await document.put({
    TableName: "usersTodo",
    Item: todo,
  }).promise();

  if(todo) {
    const getTodo = async (user_id: string) => {

      const response = await document.query({
        TableName: "usersTodo",
        KeyConditionExpression: "user_id = :id",
        ExpressionAttributeValues: {
          ":id": user_id,
        }
      }).promise();

      return response.Items[0] as ICreateTodo;
    }

    const Todo = await getTodo(user_id);

    if(Todo) {
      await document.update({
        TableName: "usersTodo",
        Key: {
          user_id: user_id
        },
        UpdateExpression: "set done = :true",
        ExpressionAttributeValues: {
          ":true": true,
        },
        ReturnValues: "UPDATE_NEW"
      }).promise();

      const updateTodo = await getTodo(user_id);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Todo criado com sucesso",
          todo: updateTodo,
        })
      }
    }
  }
}