import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling'
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import * as apigwv2_integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as glue_alpha from '@aws-cdk/aws-glue-alpha'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
import { Construct } from 'constructs'
import * as path from 'path'

export class ApiStack extends Stack {

  private _bucket: s3.Bucket
  private _cohereApiKey: secretsmanager.Secret
  private _webSocketApi: apigwv2.WebSocketApi
  private _webSocketStage: apigwv2.WebSocketStage

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this._cohereApiKey = new secretsmanager.Secret(this, 'CohereApiKey')
    this._bucket = new s3.Bucket(this, 'ApiBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    })
    this._webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi')
    this._webSocketStage = new apigwv2.WebSocketStage(this, 'ProdStage', {
      webSocketApi: this._webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    })
    
    this._setupGlueJobs()
    this._setupEmbeddings()
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

    const capacityProvider = new ecs.AsgCapacityProvider(this, 'DefaultCapacityProvider', {
      autoScalingGroup: new autoscaling.AutoScalingGroup(this, 'DefaultAutoScalingGroup', {
        vpc,
        instanceType: new ec2.InstanceType('t2.micro'),
        desiredCapacity: 1,
        machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      }),
    })
    cluster.addAsgCapacityProvider(capacityProvider)
    

    // Create a task definition
    const taskDefinition = new ecs.TaskDefinition(this, 'TaskDefinition', {
      compatibility: ecs.Compatibility.EC2_AND_FARGATE,
      cpu: "8192",
      memoryMiB: "61440",
    })
    
    // Add a container to the task definition
    const container = taskDefinition.addContainer('Score', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../python/docker/embeddings')),
      cpu: 128,
      memoryLimitMiB: 896,
      environment: {
        AWS_DEFAULT_REGION: Stack.of(this).region,
        BUCKET_NAME: this._bucket.bucketName,
        WS_ENDPOINT_URL: this._webSocketStage.callbackUrl,
      },
      secrets: {
        COHERE_API_KEY: ecs.Secret.fromSecretsManager(this._cohereApiKey),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'Score',
      }),
    })

    // Grant the container access to the S3 bucket
    this._bucket.grantReadWrite(taskDefinition.taskRole)

    // Grant the container access to write to WebSockets
    this._webSocketStage.grantManagementApiAccess(taskDefinition.taskRole)

    // Create a lambda function to orchestrate the ECS task
    const orchestrationHandler = new lambda.Function(this, 'EcsOrchestrationLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../python/lambda/ecs_orchestration')),
      environment: {
        CAPACITY_PROVIDER_NAME: capacityProvider.capacityProviderName,
        CLUSTER_NAME: cluster.clusterName,
        CONTAINER_NAME: container.containerName,
        VPC_SUBNETS: vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
        TASK_DEFINITION_ARN: taskDefinition.taskDefinitionArn,
      }
    })

    // Grant the lambda run task permissions on the cluster
    taskDefinition.grantRun(orchestrationHandler)

    // Trigger the lambda function when a new parquet file is added to the requests folder in the bucket
    this._bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(orchestrationHandler),
      {prefix: 'requests/', suffix: '.snappy.parquet'},
    )
    this._bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(orchestrationHandler),
      {prefix: 'requests/', suffix: 'keywords.json'},
    )
  }

  private _setupGlueJobs() {
    const glueSQSQueue = new sqs.Queue(this, 'GlueSQSQueue', {
      visibilityTimeout: Duration.seconds(15),
      retentionPeriod: Duration.minutes(15),
    })
    const embeddings_cache = new glue_alpha.Job(this, 'EmbeddingsCachePythonETLJob', {
      description: 'Python Etl Job to read new requests from SQS and filter cache misses',
      executable: glue_alpha.JobExecutable.pythonEtl({
        glueVersion: glue_alpha.GlueVersion.V4_0,
        pythonVersion: glue_alpha.PythonVersion.THREE,
        script: glue_alpha.Code.fromAsset(path.join(__dirname, '../python/glue/embeddings_cache.py')),
      }),
      workerCount: 2,
      workerType: glue_alpha.WorkerType.G_1X,
      enableProfilingMetrics: true,
    })

    this._bucket.grantReadWrite(embeddings_cache)
    glueSQSQueue.grantConsumeMessages(embeddings_cache)

    const combinationsHandler = new lambda.Function(this, 'Combinations', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../python/lambda/combinations')),
      environment: {
        QUEUE_URL: glueSQSQueue.queueUrl,
        BUCKET_NAME: this._bucket.bucketName,
        EMBEDDINGS_CACHE_JOB_NAME: embeddings_cache.jobName,
        WS_ENDPOINT_URL: this._webSocketStage.callbackUrl,
      }
    })

    combinationsHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['glue:StartJobRun'],
        resources: [ embeddings_cache.jobArn ],
      })
    )
    glueSQSQueue.grantSendMessages(combinationsHandler)
    this._bucket.grantWrite(combinationsHandler)
    this._webSocketStage.grantManagementApiAccess(combinationsHandler)

    const combinationsIntegration = new apigwv2_integrations.WebSocketLambdaIntegration("webSocketHandler", combinationsHandler)
    this._webSocketApi.addRoute('analyze', {integration: combinationsIntegration})
  }
}
