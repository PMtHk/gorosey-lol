import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new ec2.Vpc(this, 'GoroseyLolVPC', {
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    })

    // SecurityGroup
    const securityGroup = new ec2.SecurityGroup(this, 'GoroseyLolSG', {
      vpc,
      description: ' Allow SSH and HTTP Access',
      allowAllOutbound: true,
    })

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH Access')
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8000),
      'Allow HTTP Access')

    // KeyPair
    const keyPair = new ec2.KeyPair(this, 'GoroseyLolKeyPair', {
      keyPairName: 'goroseylol-instance-ssh-key',
      type: ec2.KeyPairType.RSA,
    })

    // EC2 Instance
    const instance = new ec2.Instance(this, 'GoroseyLolInstance', {
      vpc,
      securityGroup: securityGroup,
      instanceName: 'GoroseyLolInstance',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.genericLinux({
        'ap-northeast-2': 'ami-0077297a838d6761d',
      }),
      keyPair,
    })

    // EC2 Instance UserData
    instance.userData.addCommands(
      '#!/bin/bash',

      'apt-get update -y',
      'apt-get install -y curl git',

      'touch ~/.bashrc',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash',

      'export NVM_DIR="$HOME/.nvm"',
      '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',

      'nvm install --lts',
    )
  }
}


