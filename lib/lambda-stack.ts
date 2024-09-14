import { Construct } from "constructs";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface LambdaStackProps extends StackProps {}

export class LambdaStack extends Stack {
  
  public readonly getAllUsersLambda: NodejsFunction;
  public readonly createUserLambda: NodejsFunction;
  public readonly updateUserLambda: NodejsFunction;
  public readonly deleteUserLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const lambdaConfig = {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      memorySize: 256,
      timeout: Duration.seconds(30),
      bundling: {
        minify: true,
        sourceMap: true,
      },
    };

    const getAllUsersLambda = new NodejsFunction(this, "GetAllUsersLambda", {
      entry: path.join(__dirname, "../src/lambdas/get-all-users.ts"),
      ...lambdaConfig,
    });

    const createUserLambda = new NodejsFunction(this, "CreateUserLambda", {
      entry: path.join(__dirname, "../src/lambdas/create-user.ts"),
      ...lambdaConfig,
    });

    const updateUserLambda = new NodejsFunction(this, "UpdateUserLambda", {
      entry: path.join(__dirname, "../src/lambdas/update-user.ts"),
      ...lambdaConfig,
    });

    const deleteUserLambda = new NodejsFunction(this, "DeleteUserLambda", {
      entry: path.join(__dirname, "../src/lambdas/delete-user.ts"),
      ...lambdaConfig,
    });

    this.getAllUsersLambda = getAllUsersLambda;
    this.createUserLambda = createUserLambda;
    this.updateUserLambda = updateUserLambda;
    this.deleteUserLambda = deleteUserLambda;
  }
}
