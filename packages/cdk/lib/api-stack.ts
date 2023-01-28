import { Stack, StackProps } from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as glue_alpha from '@aws-cdk/aws-glue-alpha'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
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
    this._setupGlueJobs()
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

  private _setupGlueJobs() {
    const embeddings_cache = new glue_alpha.Job(this, 'EmbeddingsCachePythonETLJob', {
      description: 'Python Etl Job to read new requests from S3 and filter cache misses',
      executable: glue_alpha.JobExecutable.pythonEtl({
        glueVersion: glue_alpha.GlueVersion.V4_0,
        pythonVersion: glue_alpha.PythonVersion.THREE,
        script: glue_alpha.Code.fromAsset(path.join(__dirname, '../python/glue/embeddings_cache.py')),
      }),
      workerCount: 2,
      workerType: glue_alpha.WorkerType.G_1X,
    })

    this._bucket.grantReadWrite(embeddings_cache)

    const orchestrationHandler = new lambda.Function(this, 'OrchestrationLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../python/lambda/glue_orchestration')),
      environment: {
        BUCKET_NAME: this._bucket.bucketName,
        EMBEDDINGS_CACHE_JOB_NAME: embeddings_cache.jobName,
      }
    })

    orchestrationHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['glue:StartJobRun'],
      resources: [ embeddings_cache.jobArn ],
    }))

    this._bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED, 
      new s3n.LambdaDestination(orchestrationHandler),
      {prefix: 'requests/', suffix: 'combinations.txt'},
    )
  }
}
