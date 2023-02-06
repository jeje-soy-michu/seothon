import os
import boto3

def send_message(request_id: str, message: str, close_connection: bool = False, endpoint_url: str = os.environ['WS_ENDPOINT_URL'], region_name: str = os.environ['AWS_DEFAULT_REGION']):
  ws = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url, region_name=region_name)
  ws.post_to_connection(Data=message.encode(), ConnectionId=request_id)

  if close_connection:
    ws.delete_connection(ConnectionId=request_id)
