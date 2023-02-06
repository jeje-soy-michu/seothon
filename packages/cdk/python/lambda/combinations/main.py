import json
import os
import re
import boto3


BUCKET_NAME = os.environ['BUCKET_NAME']
EMBEDDINGS_CACHE_JOB_NAME = os.environ['EMBEDDINGS_CACHE_JOB_NAME']
WS_ENDPOINT_URL = os.environ['WS_ENDPOINT_URL']
QUEUE_URL = os.environ['QUEUE_URL']
NEW_LINE = "\n"
SPACE = " "

s3 = boto3.client('s3')
sqs = boto3.client('sqs')
glue = boto3.client('glue')
ws = boto3.client('apigatewaymanagementapi', endpoint_url=WS_ENDPOINT_URL)

def get_combinations(post: str, combination_length: int = 7):
  """
  Gets all combinations of words in a post
  :param post: Post to get combinations from
  :param combination_length: Length of each combination
  :return: List of combinations
  """
  # Remove the \n characters from the post
  post = re.sub(NEW_LINE, SPACE, post)

  words = list(filter(lambda x: x, post.split(SPACE)))

  combination = words[:combination_length]

  combinations = [SPACE.join(combination)]
  for word in words[combination_length:]:
    combination = combination[1:] + [word]
    combinations.append(SPACE.join(combination))
  
  return combinations

def handler(event, _):
  payload = json.loads(event["body"])
  request_id = event["requestContext"]["connectionId"]

  # Verify all required fields are present
  if not payload.get("text") or not payload.get("keywords"):
    ws.post_to_connection(Data=json.dumps({"status": 400, "error": "Missing required fields"}).encode(), ConnectionId=request_id)
    return {
      "statusCode": 400,
      "body": "Missing required fields"
    }

  ws.post_to_connection(Data=json.dumps({"status": 200, "action": "ANALYZING"}).encode(), ConnectionId=request_id)
  post_text = payload["text"]
  keywords = payload["keywords"]
  
  # Save post to S3
  s3.put_object(Body=post_text, Bucket=BUCKET_NAME, Key=f"requests/{request_id}/post.txt")
  s3.put_object(Body=json.dumps(keywords), Bucket=BUCKET_NAME, Key=f"requests/{request_id}/keywords.json")

  combinations  = get_combinations(post_text, 1)
  combinations += get_combinations(post_text, 2)
  combinations += get_combinations(post_text, 4)
  combinations += get_combinations(post_text, 7)

  params = {
    "request_id": request_id,
    "post_text": post_text,
    "combinations": combinations,
    "keywords": keywords,
  }

  # Send to SQS
  sqs.send_message(QueueUrl=QUEUE_URL,MessageBody=json.dumps(params))

  # Start Glue job
  args = {
    '--bucket_name': BUCKET_NAME,
    '--sqs_queue_url': QUEUE_URL,
  }

  try:
    glue.start_job_run(JobName=EMBEDDINGS_CACHE_JOB_NAME, Arguments=args)
  except boto3.exceptions.botocore.exceptions.ClientError as e:
    if e.response['Error']['Code'] != 'ConcurrentRunsExceededException':
      raise e

  return {
    "statusCode": 200,
    "headers": {
      "Content-Type": "text/plain"
    },
    "body": request_id
  }
