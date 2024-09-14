import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User deleted",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error occurred",
      }),
    };
  }
};
