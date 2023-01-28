import json
import os
import re
import boto3


NEW_LINE = "\n"
SPACE = " "

s3 = boto3.client('s3')

def upload_to_s3(text: str, s3_key: str):
  """
  Uploads a text to S3
  :param text: Text to upload
  :param s3_key: S3 key to upload to
  """
  s3.put_object(Body=text.encode(), Bucket=os.environ['BUCKET_NAME'], Key=s3_key)

def get_combinations(post: str, combination_length: int = 7):
  """
  Gets all combinations of words in a post
  :param post: Post to get combinations from
  :param combination_length: Length of each combination
  :return: List of combinations
  """
  assert combination_length > 0, "Combination length must be greater than 0"
  words = re.sub(r"(\\n)+", SPACE, post).split(SPACE)

  combination = words[:combination_length]

  combinations = [SPACE.join(combination)]
  for word in words[combination_length:]:
    combination = combination[1:] + [word]
    combinations.append(SPACE.join(combination))
  
  return combinations

def handler(event, context):
  payload = json.loads(event["body"])
  request_id = context.aws_request_id
  post_text = payload["text"]

  combinations = get_combinations(post_text, 2)
  combinations += get_combinations(post_text, 4)
  combinations += get_combinations(post_text, 7)

  upload_to_s3(NEW_LINE.join(combinations), f"requests/{request_id}/combinations.txt")
  upload_to_s3(post_text, f"requests/{request_id}/post.txt")

  return {
    "statusCode": 200,
    "headers": {
      "Content-Type": "text/plain"
    },
    "body": request_id
  }
