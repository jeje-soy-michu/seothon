import os
import boto3
import urllib.parse


CAPACITY_PROVIDER_NAME = os.environ['CAPACITY_PROVIDER_NAME']
CLUSTER_NAME = os.environ['CLUSTER_NAME']
CONTAINER_NAME = os.environ['CONTAINER_NAME']
TASK_DEFINITION_ARN = os.environ['TASK_DEFINITION_ARN']
VPC_SUBNETS = os.environ['VPC_SUBNETS'].split(',')

client = boto3.client('ecs')

def handler(event, _):
  key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
  stage = key.split('/')[-2]
  if stage == 'cache_miss':
    args = {
      'cluster': CLUSTER_NAME,
      'capacityProviderStrategy': [ {'capacityProvider': 'FARGATE_SPOT'} ],
      'overrides': {
        'containerOverrides': [
          {'name': CONTAINER_NAME, 'command': [ "fetch-embeddings", key ]},
        ],
        'memory': '2048',
        'cpu': '256',
      },
      'networkConfiguration': {
        'awsvpcConfiguration': {
          'subnets': VPC_SUBNETS,
          'assignPublicIp': 'ENABLED',
        },
      },
      'taskDefinition': TASK_DEFINITION_ARN,
    }
    client.run_task(**args)
  elif stage == 'new-embeddings' or stage == 'cache_hit':
    request_id = key.split('/')[-3]
    file_name = key.split('/')[-1]
    use_new_embeddings = stage == 'new-embeddings'

    command = [ "calculate-score", request_id, file_name ]
    if use_new_embeddings:
      command.append("--use-new-embeddings")
      
    args = {
      'cluster': CLUSTER_NAME,
      'capacityProviderStrategy': [ {'capacityProvider': 'FARGATE_SPOT'} ],
      'overrides': {
        'containerOverrides': [
          {'name': CONTAINER_NAME, 'command': command},
        ],
        'memory': '2048',
        'cpu': '256',
      },
      'networkConfiguration': {
        'awsvpcConfiguration': {
          'subnets': VPC_SUBNETS,
          'assignPublicIp': 'ENABLED',
        },
      },
      'taskDefinition': TASK_DEFINITION_ARN,
    }
    
    print(args)
    client.run_task(**args)
  elif key.split('/')[-1] == 'keywords.json':
    request_id = key.split('/')[-2]
    args = {
      'cluster': CLUSTER_NAME,
      'capacityProviderStrategy': [ {'capacityProvider': 'FARGATE_SPOT'} ],
      'overrides': {
        'containerOverrides': [
          {'name': CONTAINER_NAME, 'cpu': 8192, 'memory': 61440, 'command': [ "fast-cache", request_id ]},
        ],
      },
      'networkConfiguration': {
        'awsvpcConfiguration': {
          'subnets': VPC_SUBNETS,
          'assignPublicIp': 'ENABLED',
        },
      },
      'taskDefinition': TASK_DEFINITION_ARN,
    }
    client.run_task(**args)
