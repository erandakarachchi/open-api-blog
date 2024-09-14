import { Stack, StackProps } from "aws-cdk-lib";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class IAMStack extends Stack {
  
  public readonly apiGatewayRole: Role;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const apiGatewayRole = new Role(this, "APIGatewayRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    apiGatewayRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    this.apiGatewayRole = apiGatewayRole;
  }
}
