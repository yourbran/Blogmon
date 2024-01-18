---
title: Kiosk API 서버 인프라 구성
layout: post
permalink: /project/kioskapiprj
posttype: project
post-image: /assets/images/20230108_kioskPrj/kioskPrj_front.png
description: API서버를 신규로 도입함에 따라 인프라를 어떻게 설계했고 어플리케이션을 어떻게 구동시켰는지 설명합니다.
tags:
- TECH
- AA
- API
---

키오스크만을 통해 번호표를 발권하는 기존 방식을 넘어, 모바일로도 번호표를 발권할 수 있도록 시스템을 고도화하는 프로젝트에 참여했다. 요청이 들어오는 채널이 하나에서 둘로 늘어남에 따라 공통 처리 부분이 필요했다. 기간계 시스템의 가용성 관리를 위해 해당 서버에 직접 API를 호출하던 것을, 키오스크 전용 신규 API 서버를 통해 인터페이스되도록 변경했다.

<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_overview.png">
</p>

---

### 서버 인프라 구성
개발기 및 운영기에서 사용할 신규 API서버를 구성하는 것이 프로젝트에서 나의 역할이었다. 신규 VM이 발급된 이후 서버를 구성할 때 고려했던 항목들은 아래와 같다.
* 미들웨어(WEB/WAS) 설치 및 컨테이너
* 신규 서버에 대한 방화벽 설정
* 신규 시스템 개발 및 배포를 위한 CI/CD 구성
* 도메인(A레코드) 생성 및 SSL 적용
* 서버 모니터링을 위한 APM 연결
* 서비스 자동 재기동 설정

### 미들웨어(WEB/WAS) 설치 및 컨테이너 생성
두 대의 VM이 생성된 후 빈 서버에 WEB/WAS를 설치했다. 일반적으로는 WEB서버와 WAS를 다른 서버로 관리하지만 비용적인 측면을 고려하여 한 서버에 WEB/WAS를 설치했다. 물론, 장애 대응과 무중단 배포 등 원활한 관리를 위해 서버는 이중화(Active-Active)로 구성하였다.
<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_webwas.drawio.png">
</p>

### 신규 서버에 대한 방화벽 설정
신규 서버에서 처리하려는 서비스의 목적에 따라 해당 서비스와 관련이 있는 모든 서버와의 방화벽 해제 요청을 진행했다. 신규 API 서버는 IDC 내 SDN망에 설치되었기에 기본적으로 사용하는 포트들도 모두 직접 해제 신청을 해야 했다. 뿐만 아니라 키오스크 장비로부터 들어오는 요청을 처리하기 위한 VPN 장비의 설정도 추가적으로 필요했다.
<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_FW.png">
</p>

### 신규 시스템 개발 및 배포를 위한 CI/CD 구성
서버에 올라갈 소스들은 Spring 기반의 자바 프로젝트로 구성되어있으며 Maven으로 빌드한다. Gitlab과 Jenkins를 이용해 DEV → STAG → PROD 단계로 무중단 배포가 이루어진다.
<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_CICD.drawio.png">
</p>

### 도메인 생성 및 SSL 인증서 적용
개발 및 테스트를 위해선 각 단계별로 도메인이 필요했다. 루트 도메인 아래에 서브 도메인으로 신규 생성이 필요했으며, VM은 회사 IDC에 존재했기에 A레코드 추가는 간단히 완료되었다. 또한 신규 API 서버는 대내 서비스간의 인터페이스만이 존재했지만, 보안 목적상 암호화 통신은 필수적이었다. 루트 도메인 기준의 SSL 인증서는 이미 보유하고 있던 것을 그대로 적용했다.

|배포환경|도메인|
|---|---|
|DEV|devKiosk.domain.com|
|STAG|stagKiosk.domain.com|
|PROD|kiosk.domain.com|

### 서버 모니터링을 위한 APM 연결
앞선 과정을 통해 시스템 개발 및 운영을 위한 환경이 갖추어졌다. 오픈 후 해당 시스템을 안정적으로 운영하고 자원을 지속적으로 모니터링 하기 위해 APM 서버와의 연결이 필요했고, 솔루션 엔지니어를 통해 신규 VM에 APM을 적용하였다. 이후 APM에서 제공하는 API를 활용하여, 서버 자원이 일정 기준을 초과했을 경우 알람을 발생시켜 대상 서버를 자동으로 재시작 시키는 쉘스크립트를 개발했다. 자원 과사용으로 인해 서버가 내려가는 상황을 예방하기 위함이다.
<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_APM.png">
</p>

### 서비스 자동 재기동 설정
시스템 운영 중 장애 발생 시 그 이유를 찾기 어려운 경우가 있다. 어플리케이션의 오류로 인한 장애는 원인 파악이 쉽지만 시스템 자원과 관련된 장애는 로그 추적이 쉽지 않고, 그럴 경우 장애 대응 시간이 늘어나게 된다. 이러한 상황을 예방하기 위해 서비스를 주기적으로 재시작시킴으로써 힙메모리 혹은 쌓여있는 SWAP메모리 등 자원을 지속적으로 초기화시켜준다.
<p align="center">
  <img src="/assets/images/20230108_kioskPrj/kioskPrj_reboot.png">
</p>

---

### 프로젝트 후기
프로젝트를 진행하면서 평소 산발적으로 알고 있던 인프라 관련 내용들을 조각모음 하듯이 정리할 수 있었다. 이전엔 각 작업들의 필요성과 목적을 추상적으로 알고 있었지만, 이번 기회를 통해 직접 개발하고 적용하며 보다 상세히 이해할 수 있었다.
개인적으로 아쉬운 점은 정적분석도구(SonarQube)를 CI/CD Pipeline에 녹여내지 못했던 것이다. 프로젝트 기한 내 해결하기 위해선 Jenkins의 Plugin을 활용하는 방법이 가장 효율적이었지만, 버전 호환성 문제로 해당 Plugin 사용이 불가능했다. 이를 위해 Jenkins를 업그레이드 하게 될 경우 영향도 검토 및 테스트에 많은 시간이 소비되어 결국 적용하지 못했다.
곧 EOS에 따른 기간계 시스템 업그레이드가 진행될 예정인데, 해당 시점에 맞춰 Jenkins도 같이 업그레이드하여 미진했던 실시간 소스 품질 점검 프로세스를 반영해야겠다.

### 참조
[Kiosk icons created by Freepik – Flaticon](https://www.flaticon.com/free-icons/kiosk) <br/>
[Iphone icons created by Freepik – Flaticon](https://www.flaticon.com/free-icons/iphone) <br/>
[Server icons created by srip – Flaticon](https://www.flaticon.com/free-icons/server) <br/>