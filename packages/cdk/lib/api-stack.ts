import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as glue_alpha from '@aws-cdk/aws-glue-alpha'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as python from '@aws-cdk/aws-lambda-python-alpha'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
import { Construct } from 'constructs'
import * as path from 'path'

export class ApiStack extends Stack {

  private _bucket: s3.Bucket
  private _cohereApiKey: secretsmanager.Secret
  private _restApi: apigateway.RestApi

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this._cohereApiKey = new secretsmanager.Secret(this, 'CohereApiKey')
    this._bucket = new s3.Bucket(this, 'ApiBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    })
    this._restApi = new apigateway.RestApi(this, 'RestApi')
    
    this._setupCombinations()
    this._setupSEOKeywords()
    this._setupGlueJobs()
    this._setupEmbeddings()
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

  private _setupEmbeddings() {
    const vpc = new ec2.Vpc(this, 'EmbeddingsVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 0,
      subnetConfiguration: [{
        name: 'PublicSubnet',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    })

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'EmbeddingsCluster', {
      enableFargateCapacityProviders: true,
      vpc,
    })

    // Add capacity to it
    cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
    })

    // Create a task definition
    const ec2TaskDefinition = new ecs.Ec2TaskDefinition(this, 'Ec2TaskDef')
    
    // Add a container to the task definition
    const container = ec2TaskDefinition.addContainer('Embeddings', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../python/docker/embeddings')),
      memoryLimitMiB: 128,
      environment: {
        BUCKET_NAME: this._bucket.bucketName,
      },
      secrets: {
        COHERE_API_KEY: ecs.Secret.fromSecretsManager(this._cohereApiKey),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'Embeddings',
      })
    })

    // Grant the container access to the S3 bucket
    this._bucket.grantReadWrite(ec2TaskDefinition.taskRole)

    // Create a lambda function to orchestrate the ECS task
    const orchestrationHandler = new lambda.Function(this, 'EcsOrchestrationLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../python/lambda/ecs_orchestration')),
      environment: {
        CLUSTER_NAME: cluster.clusterName,
        CONTAINER_NAME: container.containerName,
        TASK_DEFINITION_ARN: ec2TaskDefinition.taskDefinitionArn,
      }
    })

    // Grant the lambda run task permissions on the cluster
    ec2TaskDefinition.grantRun(orchestrationHandler)

    // Trigger the lambda function when a new parquet file is added to the requests folder in the bucket
    this._bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(orchestrationHandler),
      {prefix: 'requests/', suffix: '.snappy.parquet'},
    )
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

    const orchestrationHandler = new lambda.Function(this, 'GlueOrchestrationLambda', {
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

  private _setupSEOKeywords() {
    const keywordsHandler = new python.PythonFunction(this, 'KeywordsLambda', {
      entry: path.join(__dirname, '../python/lambda/keywords'),
      runtime: lambda.Runtime.PYTHON_3_9,
      index: 'main.py',
      handler: 'handler',
      environment: {
        BUCKET_NAME: this._bucket.bucketName,
        COHERE_API_KEY_ARN: this._cohereApiKey.secretArn,
      },
    })
    
    this._bucket.grantReadWrite(keywordsHandler)
    this._cohereApiKey.grantRead(keywordsHandler)

    const keywordsIntegration = new apigateway.LambdaIntegration(keywordsHandler)

    const resource = this._restApi.root.addResource('keywords', {
      defaultIntegration: keywordsIntegration,
    })

    resource.addMethod('POST')
  }
}
