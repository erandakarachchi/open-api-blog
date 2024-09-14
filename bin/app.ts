#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { IAMStack } from "../lib/iam-stack";
import { APIStack } from "../lib/api-stack";
import { LambdaStack } from "../lib/lambda-stack";
import { DocumentStack } from "../lib/document-stack";

const app = new cdk.App();

const iamStack = new IAMStack(app, "IAMStack", {});
const lambdaStack = new LambdaStack(app, "LambdaStack", {});
const apiStack = new APIStack(app, "APIStack", {
  iamRoleArn: iamStack.apiGatewayRole.roleArn,
  getAllUsersLambdaArn: lambdaStack.getAllUsersLambda.functionArn,
  createUserLambdaArn: lambdaStack.createUserLambda.functionArn,
  updateUserLambdaArn: lambdaStack.updateUserLambda.functionArn,
  deleteUserLambdaArn: lambdaStack.deleteUserLambda.functionArn,
});
const documentStack = new DocumentStack(app, "DocumentStack", {});

documentStack.addDependency(apiStack);
