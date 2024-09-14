import * as path from "path";
import { OpenAPIV3_1 } from "openapi-types";
import * as fs from "fs";

interface OpenAPIUtilsProps {
  region: string;
  iamRoleArn: string;
  getAllUsersLambdaArn: string;
  createUserLambdaArn: string;
  updateUserLambdaArn: string;
  deleteUserLambdaArn: string;
}

export class OpenAPIUtils {
  private readonly region: string;
  private readonly iamRoleArn: string;
  private readonly endPointARNMap = {
    "/users": {
      get: "",
      post: "",
    },
    "/users/{userId}": {
      get: "",
      put: "",
      delete: "",
    },
  };

  constructor(props: OpenAPIUtilsProps) {
    this.region = props.region;
    this.iamRoleArn = props.iamRoleArn;
    this.endPointARNMap["/users"]["get"] = props.getAllUsersLambdaArn;
    this.endPointARNMap["/users"]["post"] = props.createUserLambdaArn;
    this.endPointARNMap["/users/{userId}"]["put"] = props.updateUserLambdaArn;
    this.endPointARNMap["/users/{userId}"]["delete"] = props.deleteUserLambdaArn;
  }

  private getFunctionArn = (arn: string) => {
    return `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${arn}/invocations`;
  };

  public getOpenAPISpecForAPIGateway(): object {
    const apiFile = OpenAPIUtils.getOpenAPIFile();
    const apiJson: OpenAPIV3_1.Document = JSON.parse(apiFile);

    if (apiJson && apiJson.paths) {
      for (const [endpoint, methods] of Object.entries(this.endPointARNMap)) {
        for (const [method, arn] of Object.entries(methods)) {
          if (apiJson.paths[endpoint] && (apiJson.paths[endpoint] as any)[method]) {
          }
          const pathItem = apiJson.paths[endpoint];
          if (pathItem && typeof pathItem === "object" && method in pathItem) {
            if (pathItem[method as keyof typeof pathItem]) {
              (pathItem[method as keyof typeof pathItem] as any)["x-amazon-apigateway-integration"] = {
                httpMethod: "POST",
                type: "aws_proxy",
                uri: this.getFunctionArn(arn),
                credentials: this.iamRoleArn,
              };
            }
          }
        }
      }
    }

    return apiJson;
  }

  public static getOpenAPIFilePath(): string {
    return path.resolve(__dirname, "./openapi-spec.json");
  }

  public static getOpenAPIFile(): string {
    return fs.readFileSync(OpenAPIUtils.getOpenAPIFilePath(), "utf8");
  }

  public static getOpenAPIFileWithServerUrl(url:string):  object  {
    const apiFile = OpenAPIUtils.getOpenAPIFile();
    const apiJson: OpenAPIV3_1.Document = JSON.parse(apiFile);
    apiJson.servers = [{url}];
    return apiJson;
  }
}
