import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { OpenAPIUtils } from "../src/openapi/openapi-utils";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface DocumentStackProps extends StackProps {}

export class DocumentStack extends Stack {
  constructor(scope: Construct, id: string, props: DocumentStackProps) {
    super(scope, id);

    const documentBucket = new Bucket(this, "DocumentBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      accessControl: BucketAccessControl.PRIVATE,
      autoDeleteObjects: true,
    });

    const apiGatewayURL = StringParameter.valueForStringParameter(this, "/openapi/url");

    const urlWithPrefix = `https://${apiGatewayURL}`;

    const openApiJSON = OpenAPIUtils.getOpenAPIFileWithServerUrl(urlWithPrefix);

    new BucketDeployment(this, "DocumentBucketDeployment", {
      sources: [Source.jsonData("swagger.json", openApiJSON), Source.asset("swagger-ui")],
      destinationBucket: documentBucket,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, "DocumentOriginAccessIdentity");
    documentBucket.grantRead(originAccessIdentity);

    const documentDistribution = new Distribution(this, "DocumentCloudFrontDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(documentBucket, { originAccessIdentity: originAccessIdentity }),
      },
    });

    new CfnOutput(this, "DocumentURL", {
      value: documentDistribution.distributionDomainName,
      description: "The URL of the Document Bucket",
    });
  }
}
