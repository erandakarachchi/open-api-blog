import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { ApiDefinition, SpecRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { OpenAPIUtils } from "../src/openapi/openapi-utils";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface APIStackProps extends StackProps {
  iamRoleArn: string;
  getAllUsersLambdaArn: string;
  createUserLambdaArn: string;
  updateUserLambdaArn: string;
  deleteUserLambdaArn: string;
}

export class APIStack extends Stack {
  public readonly apiURL: string;

  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const openApiUtils = new OpenAPIUtils({
      iamRoleArn: props.iamRoleArn,
      region: this.region,
      getAllUsersLambdaArn: props.getAllUsersLambdaArn,
      createUserLambdaArn: props.createUserLambdaArn,
      updateUserLambdaArn: props.updateUserLambdaArn,
      deleteUserLambdaArn: props.deleteUserLambdaArn,
    });

    const openAPISpec = openApiUtils.getOpenAPISpecForAPIGateway();
    const openApiGateway = new SpecRestApi(this, "OpenAPIGateway", {
      apiDefinition: ApiDefinition.fromInline(openAPISpec),
    });

    openApiGateway.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const responseHeadersPolicy = new ResponseHeadersPolicy(this, "APIResponseHeadersPolicy", {
      responseHeadersPolicyName: "APIResponseHeadersPolicy",
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ["*"],
        accessControlAllowMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
        accessControlAllowOrigins: ["*.cloudfront.net"],
        originOverride: true,
      },
    });

    const distribution = new Distribution(this, "OpenAPICloudFrontDistribution", {
      defaultBehavior: {
        origin: new HttpOrigin(`${openApiGateway.restApiId}.execute-api.${this.region}.amazonaws.com`, {
          originPath: `/${openApiGateway.deploymentStage.stageName}`,
          protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        }),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        responseHeadersPolicy: responseHeadersPolicy,
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
    });

    const url = distribution.distributionDomainName;

    this.apiURL = url;

    new CfnOutput(this, "OpenApiUrl", {
      value: url,
      description: "The URL of the OpenAPI Gateway",
    });

    new StringParameter(this, "OpenApiUrlSSM", {
      parameterName: "/openapi/url",
      stringValue: url,
    });
  }
}
