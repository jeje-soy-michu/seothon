import os
import boto3
import urllib.parse


CLUSTER_NAME = os.environ['CLUSTER_NAME']
CONTAINER_NAME = os.environ['CONTAINER_NAME']
TASK_DEFINITION_ARN = os.environ['TASK_DEFINITION_ARN']

client = boto3.client('ecs')

def handler(event, _):
  key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
  stage = key.split('/')[-2]
  if stage == 'cache_miss':
    args = {
      'cluster': CLUSTER_NAME,
      'launchType': 'EC2', # FIXME: we should use a capacityProviderStrategy
      'overrides': {
        'containerOverrides': [
          {'name': CONTAINER_NAME, 'command': [ key ]},
        ],
      },
      'taskDefinition': TASK_DEFINITION_ARN,
    }
    client.run_task(**args)
