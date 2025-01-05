---
title: BMONZ 서비스 구축 Part 3
layout: post
permalink: /project/bmonzpart3
posttype: project
post-image: https://cdn.bouldermon.com/project/project00005/initial.jpg
description: AWS CI/CD 구성
tags:
- TECH
- AWS
- CI/CD
---

> [BMOZ 서비스 구축 Part3] CodeDeploy - Lightsail 연결 후 CodePipeline을 통해 Github부터 Lightsail까지 전체 CI/CD 연동을 완료한다.

### CodeDeploy - Lightsail 연동
- IAM Role 생성
- IAM User 생성
- CodeDeloy Agent 설치
  sudo chmod +x ./install
  sudo ./install auto
- Configure 설정
  aws configure
  project00005 이미지참고
- lightsail 배포 태그 등록
  웹에서 Key-Value 태그 등록
- lightsail 인스턴스를 aws on-premise 인스턴스로 등록
  aws deploy register-on-premises-instance --instance-name AmazonLinux2 --iam-user-arn arn:aws:iam::489701125781:user/lighsail_amazonlinux2 --region ap-northeast-2
- lightsail 태그를 on-premise 인스턴스에 등록
  aws deploy add-tags-to-on-premises-instances --instance-names AmazonLinux2 --tags Key=Name,Value=AmazonLinux2 --region ap-northeast-2

  aws deploy remove-tags-from-on-premises-instances --instance-names AmazonLinux2 --tags Key=Name,Value=AmazonLinux2 --region ap-northeast-2
  
  aws deploy add-tags-to-on-premises-instances --instance-names AmazonLinux2 --tags Key=Name,Value=AmazonLinux2Lightsail --region ap-northeast-2

- CodeDeploy에서 Application 생성
  ec2/onpremise선택
  Create Deployment Group


배포 파이프라인

Github PR Merge(Webhook) - CodeBuild(Dockerize) - ECR(Image Push) - CodePipeline - CodeDeploy(Image Pull & docker reboot)
  
- Code Pipeline 설정
  . source provider : Amazon S3
  . Bucket : codedeploybmonzbucket
  . S3 object Key : bmonzApiArtifacts
    > bmonzApiArtifacts.zip에는 appspec.yml과 scripts가 들어있음
    > 추후 codedeploy에서 사용할 파일들임

- CodeBuild 수행 시 Cloud Watch Logs IAM 권한 오류
  . Resource 부분에 신규 빌드프로젝트 추가 필요 (CodeBuildBasePolicy-bmonz-api-ap-northeast-2)
    > "arn:aws:logs:ap-northeast-2:489701125781:log-group:/aws/codebuild/bmonz-api-prod:*"

- 빌드 시 cache 사용을 위한 S3 Bucket 접근 권한 오류
  . 
  Unable to download cache: AccessDenied: User: arn:aws:sts::489701125781:assumed-role/codebuild-bmonz-api-service-role/AWSCodeBuild-b1b5fb4b-a9f7-4c26-8599-4fd12cff2e29 is not authorized to perform: s3:ListBucket on resource: "arn:aws:s3:::codedeploybmonzbucket" because no identity-based policy allows the s3:ListBucket action
    status code: 403, request id: 6XS1SZPQFANJCEX8, host id: 68w1tSLcSVfzrrfD/RvjvLGvFxdroa4mm5fPiRHAd1uGJYVkgKIxhmHPSQ/rlL52VxTXwWGiTwk=