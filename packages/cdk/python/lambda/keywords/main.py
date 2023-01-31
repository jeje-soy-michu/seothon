import json
import math
import os
import boto3
import cohere 
import numpy as np
import pandas as pd


BUCKET_NAME = os.environ['BUCKET_NAME']
COHERE_API_KEY_ARN = os.environ['COHERE_API_KEY_ARN']
MODEL = 'small'

secretsmanager = boto3.client('secretsmanager')
s3 = boto3.client('s3')

def cosine_similarity(a, b):
  return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def calculate_score(combinations, keywords):
  combinations['score'] = 0
  top_amount = 4
  for i in range(1, top_amount + 1):
    combinations[f"score_{i}"] = -math.inf
  for _, row in keywords.iterrows():
    embeddings = row["embeddings"]
    query = row["text"]
    impressions = row["volume"]

    combinations["similarity"] = combinations.embeddings.apply(lambda x: cosine_similarity(x, embeddings))
    combinations["score"] += combinations["similarity"] * impressions

    filtered = combinations
    prev = True
    for i in range(1, top_amount + 1):
      query_col_name = f"query_{i}"
      score_col_name = f"score_{i}"

      row_idx = prev & (filtered["similarity"] > filtered[score_col_name])
      if filtered[row_idx].empty:
        break
      
      #FIXME: Bug dropping some values here (Overriding instead of sliding)
      filtered.loc[row_idx, query_col_name] = query
      filtered.loc[row_idx, score_col_name] = combinations["similarity"]

      prev = filtered["similarity"] < filtered[score_col_name]
  combinations = combinations.drop(columns=["similarity"])

  max_sim = combinations['score'].max()
  min_sim = combinations['score'].min()
  dif_sim = max_sim - min_sim
  combinations['score'] = (combinations['score'] - min_sim) / dif_sim

  return combinations

def get_api_key():
  """
  Gets the API key from Secrets Manager
  """
  response = secretsmanager.get_secret_value(SecretId=COHERE_API_KEY_ARN)
  return response['SecretString']

def upload_to_s3(text: str, s3_key: str):
  """
  Uploads a text to S3
  :param text: Text to upload
  :param s3_key: S3 key to upload to
  """
  s3.put_object(Body=text.encode(), Bucket=BUCKET_NAME, Key=s3_key)

def handler(event, _):
  payload = json.loads(event["body"])
  request_id = payload["request_id"]
  keywords = pd.DataFrame(payload["keywords"], columns=["text", "volume"])

  co = cohere.Client(get_api_key())

  response = co.embed(texts=keywords["text"].values.tolist(), model=MODEL)

  keywords["embeddings"] = response.embeddings

  combinations = pd.DataFrame(payload["combinations"], columns=["combination"])
  response = co.embed(texts=combinations["combination"].values.tolist(), model=MODEL)
  combinations["embeddings"] = response.embeddings

  score_df = calculate_score(combinations, keywords)
  
  return {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": score_df[['combination', 'score']].set_index('combination').to_json()
  }
