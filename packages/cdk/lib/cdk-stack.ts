
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { ApiStack } from './api-stack'

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    
    new ApiStack(this, 'ApiStack')
  }
}
