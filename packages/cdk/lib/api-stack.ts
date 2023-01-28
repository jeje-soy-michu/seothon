import { Stack, StackProps } from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as glue from '@aws-cdk/aws-glue-alpha'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'path'

export class ApiStack extends Stack {

  private _bucket: s3.Bucket
  private _restApi: apigateway.RestApi

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this._bucket = new s3.Bucket(this, 'ApiBucket')
    this._restApi = new apigateway.RestApi(this, 'RestApi')
    
    this._setupCombinations()
  }

  private _setupCombinations() {
    const combinationsHandler = new lambda.Function(this, 'Combinations', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../python/lambda/combinations')),
      environment: {
        BUCKET_NAME: this._bucket.bucketName,
      }
    })

    // TODO: Restrict access to the bucket
    this._bucket.grantWrite(combinationsHandler)

    const combinationsIntegration = new apigateway.LambdaIntegration(combinationsHandler)
    
    const resource = this._restApi.root.addResource('process_text', {
      defaultIntegration: combinationsIntegration,
    })

    resource.addMethod('POST')
  }
}
