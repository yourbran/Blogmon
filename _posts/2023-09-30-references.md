---
title: 개발 참고자료
layout: post
permalink: /project/references
posttype: project
post-image: /assets/images/202309130_references/references_front.png
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
#### `bundle exec jekyll build --config _config.yml,_environment-dev.yml`
#### `bundle exec jekyll build --config _config.yml,_environment-prod.yml`
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

- 이미지 파일 : python:3.7
- 

#### 서비스계정 생성 및 지정

#### Docker Applicatoin log를 Host directory에 연결


### Docker Build
> #### docker build -t *REPOSITORY*:*VERSION* *PATH*

`Dockerfile` 작성 후 `docker build`를 통해 이미지 생성한다. `version`을 입력하지 않을 경우 `latest`가 default로 입력된다.
#### `docker build -t prodflaskapi:20231228 .`

### Docker 컨테이너 구동
> #### docker run \[options\] *IMAGE* \[command\] \[arg...\]

docker 컨테이너를 실행한다. \[OPTIONS\] 종류는 아래와 같다.
* `-p` : port를 설정해주는 옵션
* `--name` : 컨테이너 이름을 설정하는 옵션
* `-d` : 동작방식을 백그라운드로 설정하는 옵션

nginx와 docker간 UNIX socket 통신을 위해 docker 구동 시 volume을 설정한다.
* `-v {localPath}:{containerPath}`

UNIX socket 통신으로 진행하기때문에 Docker 컨테이너에서 PORT를 열지 않는다.

`docker run -d --user 1000 --name devFlaskApi -v /home/ec2-user/app/devApiServer/socket:/flaskapi/socket -v /home/ec2-user/app/devApiServer/logs:/flaskapi/logs flaskapi:20231227`

docker run -d --user 1000 --name prodflaskApi -v /home/ec2-user/app/apiServer/socket:/flaskapi/socket -v /home/ec2-user/app/apiServer/logs:/flaskapi/logs prodflaskapi:20231228

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
### uWSGI 설치
Python버전에 맞게 devel 라이브러리를 다운받은 후 Python3로 uwsgi설치가 필요하다. Python 가상환경이 Python3 기준이라면 pip3 list에서 **uWSGI**가 조회되어야 한다.

### 배포환경별 INI 설정
개발서버와 운영서버에 적용되어야 하는 설정들이 다르므로 각 스테이지에 맞게 옵션을 분기하여 처리했다. uWSGI 공식문서에 따라 [환경변수(Environment variables)](https://uwsgi-docs.readthedocs.io/en/latest/Configuration.html#environment-variables)와 [if-env문(Configuration logic)](https://uwsgi-docs.readthedocs.io/en/latest/ConfigLogic.html#if-env)을 이용하여 개발/운영 서버에 적용될 설정들을 분리했다.

개발서버에서는 uWSGI를 실행할 때 환경변수를 전달시킨다. 참고로 환경변수명은 `UWSGI_`로 시작되어야한다.
```bash
# 환경변수 전달 후 실행하는 CASE
UWSGI_DEVENV=dev uwsgi --ini uwsgi.ini 

# 환경변수 없이 실행하는 CASE
uwsgi --ini uwsgi.ini 
```
<br/>
전달받은 환경변수가 존재할 경우 `if-env` 구문을 통해 개발서버용 설정이 적용되며, 존재하지 않은 경우 `if-not-env`를 통해 운영서버용 설정이 적용된다.

```ini
[uwsgi]

# %(_) 는 context-placeholder로, 입력된 환경변수의 값이 출력
if-env = UWSGI_DEVENV
print = current uwsgi environment is %(_)
endif =

# uwsgi 실행 시 IWSGU_DEVENV환경변수를 전달받지 못했을 경우 실행
if-not-env = UWSGI_DEVENV
print = current uwsgi environment is production
endif =
```


* * *

# 크롤링
### chrominum 설치
#### `sudo yum install chromium-common.x86_64`
#### `sudo yum install chromium.x86_64`
#### `sudo yum install sudo yum install chromedriver.x86_64`

### selenium 설치
#### `pip3 install selenium`

* * *

# Route 53 domain 등록
### Lightsail ↔ Route 53 연결
1. Lightsail에서 *static IP* 등록
2. *static IP*를 Lightsail Instance에 연결
3. Route 53 Hosted zones에서 등록한 도메인 클릭
4. *Create record*
5. *subdomain*입력
6. *Record type* : A - Routes traffic to an IPv4 address and som AWS resources
7. *Value* : Lightsail Instance의 *Static IP*입력
8. *TTL* : 300
9. *Routing policy* : Simple routing
10. *Create records*

* * *

# SSL 적용
### ACM이용한 인증서 발급
1. ACM 접속 후 *Request*
2. *Certificate type : Request a public certificate* 클릭 후 Next
3. Fully qualified domain name : *\*.bouldermon.com*
4. Validation method : *DNS validation  recommanded*
5. Key algorithm : *RSA 2048*
6. Request
7. *Create record in Route 53*
8. Create record

* * *