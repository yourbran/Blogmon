---
title: 개발 참고자료
layout: post
permalink: /project/references
posttype: project
post-image: "https://raw.githubusercontent.com/thedevslot/WhatATheme/master/assets/images/What%20is%20Jekyll%20and%20How%20to%20use%20it.png?token=AHMQUELVG36IDSA4SZEZ5P26Z64IW"
description: 참고 명령어 및 레퍼런스
tags:
- dev
- referneces
- technology
---

* * *

# Jekyll
### bundle 구동
#### `bundle exec jekyll serve --trace --livereload`
* trace : 로그출력
* livereload : 동적반영

### 로컬 개발을 위한 config 설정
#### `bundle exec jekyll serve --config _config.yml,_environment-dev.yml`
#### `bundle exec jekyll serve --config _config.yml,_environment-prod.yml`
Jekyll은 여러개의 configuration file을 지정할 수 있도록 되어있으며, 두 번째 설정의 선언이 첫 번째 설정을 덮어쓴다.
개발기 테스트를 위해서 `_config-local.yml`의 *url*항목을 빈칸으로 설정한다.

* * *

# Python
### Python 버전 변경
**패키지 버전관리(update-alternative)** 명령어를 통해 원하는 python 버전으로 변경한다.

`sudo update-alternative --config python`

### 가상환경 실행
`. .venv/bin/activate`

### 가상환경 종료
`deactivate`

* * *

# Flask
### Flask 구동
#### `flask run`

### ajax CORS 문제
> CORS(Croos Origin Resource Sharing) : 도메인 또는 포트가 다른 서버의 자원을 요청하는 것

같은 서버에서 Jekyll ↔ Flask간 통신이므로 CORS가 발생할 수 밖에 없다. Server Side에서 동일출처정책(same-origin policy)을 허용할 수 있도록 조치가 필요하다. Flask의 cors 모듈을 통해 특정 경로를 허용한다.

`CORS(app, resources={r"/searchaddress": {"origins": "http://localhost:4000"}})`

* * *

# Docker
### Dockerfile 작성

### Docker Build
> #### docker build -t *REPOSITORY*:*VERSION* *PATH*

`Dockerfile` 작성 후 `docker build`를 통해 이미지 생성한다. `version`을 입력하지 않을 경우 `latest`가 default로 입력된다.
#### `docker build -t flaskapi .`

### Docker 컨테이너 구동
> #### docker run \[options\] *IMAGE* \[command\] \[arg...\]

docker 컨테이너를 실행한다. \[OPTIONS\] 종류는 아래와 같다.
* `-p` : port를 설정해주는 옵션
* `--name` : 컨테이너 이름을 설정하는 옵션
* `-d` : 동작방식을 백그라운드로 설정하는 옵션


`docker run -d -p 0.0.0.0:5000:5000/tcp --name apiserver flaskapi:latest`

### Docker 프로세스 확인
현재 구동중인 도커 프로세스를 확인하기 위해선 `docker ps` 혹은 `doscker ps -a`를 이용한다.

### Docker 프로세스 중지
> #### docker stop *CONTAINERID*

도커 프로세스 중지는 *CONATAINER ID*를 기준으로 진행한다.

### Docker image 삭제
> #### docker rmi *IMAGEID*

Docker 프로세스 명령어를 통해 확인된 *IMAGEID*를 통해 도커 이미지를 삭제한다.

* * *

# Nginx
### Nginx 구동
#### `nginx`

### Nginx conf 컴파일
#### `nginx -t`

### Nginx conf 동적반영
#### `nginx -s reload`

### Nginx 중지
#### `nginx -s stop`

### Nginx ajax CORS 조치
예비요청은 `location /`로, 실제 플라스크 API 수신은 `location @app`으로 들어오므로, 두 군데 모두 CORS 대응 설정을 지정해주어야 한다.
`proxy_hide_header Access-Control-Allow-Origin;`
`proxy_hide_header Access-Control-Allow-Methods;`
`add_header Access-Control-Allow-Origin 'http://3.38.61.176:4040';`
`add_header Access-Control-Allow-Methods 'OPTIONS, POST';`
`add_header Access-Control-Allow-Headers 'Content-Type';`

* * *

# uWSGI
### uwsgi.ini 설정
Python버전에 맞게 devel 라이브러리를 다운받은 후 Python3로 uwsgi설치가 필요하다. Python 가상환경이 Python3 기준이라면 pip3 list에서 **uWSGI**가 조회되어야 한다.

* * *

# 크롤링
### chrominum 설치
#### `sudo yum install chromium-common.x86_64`
#### `sudo yum install chromium.x86_64`
#### `sudo yum install sudo yum install chromedriver.x86_64`

### selenium 설치
#### `pip3 install selenium`

### Nginx conf 컴파일
#### `nginx -t`

### Nginx conf 동적반영
#### `nginx -s reload`

### Nginx 중지
#### `nginx -s stop`

### Nginx ajax CORS 조치
예비요청은 `location /`로, 실제 플라스크 API 수신은 `location @app`으로 들어오므로, 두 군데 모두 CORS 대응 설정을 지정해주어야 한다.
`proxy_hide_header Access-Control-Allow-Origin;`
`proxy_hide_header Access-Control-Allow-Methods;`
`add_header Access-Control-Allow-Origin 'http://3.38.61.176:4040';`
`add_header Access-Control-Allow-Methods 'OPTIONS, POST';`
`add_header Access-Control-Allow-Headers 'Content-Type';`