import os
import boto3
import urllib.parse


BUCKET_NAME = os.environ['BUCKET_NAME']
EMBEDDINGS_CACHE_JOB_NAME = os.environ['EMBEDDINGS_CACHE_JOB_NAME']

client = boto3.client('glue')

def handler(event, _):
  key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
  args = {
    '--bucket_name': BUCKET_NAME,
    '--file_key': key
  }
  client.start_job_run(JobName=EMBEDDINGS_CACHE_JOB_NAME, Arguments=args)
