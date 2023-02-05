import json
import boto3
import sys
from awsglue.utils import getResolvedOptions
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit
from pyspark.sql.types import IntegerType, StructType, StructField, StringType


s3 = boto3.client('s3')
sqs = boto3.client('sqs')

def cache_exists(bucket_name: str, file_key: str) -> bool:
  '''
  Checks if a file exists in S3
  :param bucket_name: Name of the bucket
  :param file_key: Key of the file
  :return: True if the file exists, False otherwise
  '''
  if not file_key.endswith('/'):
    file_key = file_key + '/' 
  resp = s3.list_objects(Bucket=bucket_name, Prefix=file_key, Delimiter='/', MaxKeys=1)
  return 'Contents' in resp

def glue_job():
  args = getResolvedOptions(sys.argv, ['JOB_NAME', 'bucket_name', 'sqs_queue_url'])
  bucket_name = args['bucket_name']
  queue_url = args['sqs_queue_url']

  spark = SparkSession.builder.getOrCreate()

  # Get the file key from the SQS message
  while True:
    messages = sqs.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=10)
    
    # If there are no messages, stop the job
    if 'Messages' not in messages:
      break

    # Process the messages
    for message in messages['Messages']:
      message_body = json.loads(message['Body'])
      request_id = message_body['request_id']

      # Load combinations and keywords from the message
      combinations_list = message_body['combinations']
      keywords_list = message_body['keywords']

      # Convert the list into an RDD
      combinations_rdd = spark.sparkContext.parallelize(combinations_list)
      keywords_rdd = spark.sparkContext.parallelize(keywords_list)

      # Define the schema for the DataFrame
      combinations_schema = StructType([StructField("text", StringType(), False)])
      keywords_schema = StructType([StructField("text", StringType(), False), StructField("volume", IntegerType(), True)])

      # Convert the RDD into a DataFrame
      combinations = spark.createDataFrame(combinations_rdd.map(lambda x: (x,)), combinations_schema)
      keywords = spark.createDataFrame(keywords_rdd, keywords_schema)

      # Add a static column to the DataFrame
      combinations = combinations.withColumn("type", lit("combination"))
      keywords = keywords.withColumn("type", lit("keyword"))

      # Add volume column to the DataFrame
      combinations = combinations.withColumn("volume", lit(None).cast(IntegerType()))

      # Union the DataFrames
      cols = [col("type"), col("text"), col("volume")]
      text = combinations.select(cols).union(keywords.select(cols))

      text.filter(text["type"] != "combination").show()
      
      if cache_exists(bucket_name, "embeddings-cache/"):
        # Load the cache
        cache = spark.read.parquet(f"s3://{bucket_name}/embeddings-cache").dropDuplicates(["text"]).cache()
      
        # Split the text into cache hits and cache misses
        cache_miss = text.join(cache, ["text"], "left_anti")
        if cache_miss.count() > 0:
          cache_miss.repartition(1).write.mode("ignore").parquet(f"s3://{bucket_name}/requests/{request_id}/cache_miss")

        cache_hit = text.join(cache, ["text"], "inner")
        if cache_hit.count() > 0:
          cache_hit.repartition(1).write.mode("ignore").parquet(f"s3://{bucket_name}/requests/{request_id}/cache_hit")
      else:
        text.repartition(1).write.mode("ignore").parquet(f"s3://{bucket_name}/requests/{request_id}/cache_miss")

      # Delete received message from queue
      sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=message['ReceiptHandle'])

  spark.stop()


if __name__ == "__main__":
  glue_job()
