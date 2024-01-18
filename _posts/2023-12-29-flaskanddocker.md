---
title: Flask + uWSGI + Docker를 이용한 API서버 구축
layout: post
permalink: /project/flaskapiserver
posttype: project
post-image: https://cdn.bouldermon.com/project/project00001/initial_image.jpg
description: Jekyll Website로부터의 요청을 처리하는 API서버가 필요했다. Micro Web Framework인 Flask를 이용해 가볍고 확장 가능한 서버를 구축하려했고 Docker를 이용해 MSA환경으로 구성했다.
tags:
- TECH
- FLASK
- UWSGI
- DOCKER
---

## 배경
Static Site인 Jekyll로부터의 요청을 동적으로 처리해야 하는 API서버가 필요했다. Flask를 이용해 API서버를 구축하며, Jekyll이 올라가 있는 AWS Lightsail instance에서 같이 서비스될 것이다. WEB서버는 nginx로 이미 구성되어 있는 상태다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00001/overview.png" />
</p>

## Flask (Python 3.7) 설치
Python 3.7이 이미 설치된 상태이다. Flask 설치 시 flask모듈 뿐만 아니라 flask_cors모듈도 함께 설치했다. 서비스를 요청할 Jekyll 웹사이트와 그 요청을 받아 응답하는 Flask 서버가 도메인은 같지만 PORT가 다르므로, CORS 정책 관련 이슈가 발생할 것이기 때문이다.
> CORS policy : Cross Origin Resource Sharing 의 약자로, 서로 다른 출처의 요청을 제한시키는 정책이다. 출처(Origin)는 `protocol`, `host`, `port`로 구성되며 이 세 개 중 하나라도 다를 경우 웹브라우저는 해당 요청을 버린다.

- Jekyll Static Site : https://blog.bouldermon.com
- Flask API Server   : https://blog.bouldermon.com:5XXX

위와 같이 `protocol`과 `host`는 동일하지만 `port`가 다르므로 CORS정책에 위반된다. 일반적으로 웹브라우저에서는 CORS정책에 위반된 경우 해당 응답을 버리기 때문에 정상적인 통신을 위해서는 CORS 예외처리를 해주어야한다.

```bash
# flask 및 flask_cors 설치
pip3 install flask
pip3 install flask_cors
```
<br/>
코드에서는 서비스하는 uri에 대해서만 CORS예외를 적용할 수 있도록 명시적으로 작성했다. `decorator`를 이용한 예외처리도 가능하며 [Flask-CORS Documentation](https://flask-cors.readthedocs.io/en/latest/)을 참고하면 된다.

```python
from flask_cors import CORS

CORS(
        app,
        resources={
            r"/searchaddr1": {"origins": ORIGINS_URL},
            r"/searchaddr2": {"origins": ORIGINS_URL},
        },
    )
```
<br/>
Flask는 웹서버를 통해 요청을 전달받을 것이므로 현재 사용 중인 nginx에서도 CORS 예외처리가 필요하다.

```bash
location / {
        add_header Access-Control-Allow-Origin 'https://blog.bouldermon.com';
        add_header Access-Control-Allow-Methods 'OPTIONS, POST';
        add_header Access-Control-Allow-Headers 'Content-Type';
        try_files $uri @app;
    }
```

## uWSGI 설치
> WSGI(Web Server Gateway Interface) : Web Server의 요청을 Application에 전달하는데 사용하는 인터페이스

Web Framework인 `flask`가 웹서버의 요청을 해석하기 위해서는 WSGI가 필요하다. `flask`에 기본적으로 내장되어 있기는 하지만, 성능과 보안적인 측면을 고려해 공식적으로도 production 환경에서의 사용은 권장하지 않는다. 따라서 운영 환경에서 사용 가능한 `uWSGI`를 추가로 설치했다.
```bash
pip3 install uwsgi
```
<br/>
설치가 완료되면 설정에 필요한 정보들을 `ini`파일에 명시한 후 해당 파일을 이용하여 `uWSGI`를 실행시킨다.
```ini
[uwsgi]

# load a WSGI module
module = main
# set default WSGI callable name
callable = app

# bind to the specified UNIX/TCP socket using default protocol
socket = /flaskapi/socket/flask.sock
# spawn the specified number of workers/processes
processes = 2

# enable master process
master = true
# try to remove all of the generated file/sockets
vacuum = true
```
<br/>
위 설정에서 **주의깊게 봐야할 것**은 `socket`경로다. Docker를 이용해 어플리케이션을 띄울 경우, 웹서버(nginx)와의 통신에 사용할 `socket`을 공유해야 한다. 따라서 Docker를 실행할 때 위 socket설정에 명시된 경로를 `Volume`을 통해 host와 공유될 수 있어야한다.

```bash
# v 옵션을 통해 host와 container간 디렉토리를 연결한다.
docker run -d \
-v /home/ec2-user/app/apiServer/socket:/flaskapi/socket \
-v /home/ec2-user/app/apiServer/logs:/flaskapi/logs \
...
```
<br/>

## Dockerfile 작성
Flask api의 기능 테스트를 완료한 후 `Dockerfile`을 작성한다. 눈여겨볼 만한 것은 HOST와의 파일/디렉토리 공유를 위한 `USER`생성과 `VOLUME` 지정이다.

```dockerfile
FROM python:3.7

WORKDIR /flaskapi

COPY main.py /flaskapi
COPY uwsgi.ini /flaskapi
COPY appConfig.ini /flaskapi
COPY requirements.txt /flaskapi
COPY common/ /flaskapi/common/
COPY searchaddr/ /flaskapi/searchaddr/

# 스크래핑을 위한 크롬 설치
COPY chrome_114_amd64.deb /flaskapi/
RUN  mkdir chromedriver
ADD  chromedriver_114.tar /flaskapi/chromedriver/
RUN  apt-get -y update && apt -y install ./chrome_114_amd64.deb && rm chrome_114_amd64.deb 

# 로컬 테스트를 통해 정리된 의존성 파일 설치
RUN python -m pip install --upgrade pip 
RUN pip3 install -r requirements.txt

# socket파일과 log파일을 host에서 권한 이슈 없이 접근하기 위해 유저 생성
RUN  groupadd -g 1000 ec2-user && useradd -r -u 1000 -g ec2-user ec2-user
USER ec2-user

# 웹서버와 소켓 통신을 하기 위한 host와 컨테이너간 디렉토리 연결 명시
VOLUME /flaskapi/socket

# App 로그를 host에서 바로 확인할 수 있도록 로그 디렉토리 연결 명시
VOLUME /flaskapi/logs

ENTRYPOINT ["uwsgi", "--ini", "uwsgi.ini"]
```

## Docker volume 마운트 및 실행
Docker와 host간 파일/디렉토리를 공유할 목적으로 지정된 `Volume`을 마운트한다. `-v`옵션을 통해 마운트하며 최종 `run`명령어는 아래와 같다.
```bash
docker run -d --user 1000 
--name prodflaskApi  \
-v /home/ec2-user/app/apiServer/socket:/flaskapi/socket \
-v /home/ec2-user/app/apiServer/logs:/flaskapi/logs \
prodflaskapi:20231228
```
- `--user` : host와 동일한 UID의 계정으로 실행시켜 VOLUME 공유시 권한 문제 해결
- `-v` : UNIX socket 및 log 공유를 위해 host와 컨테이너간 디렉토리 연결
<br/>

Docker가 정상적으로 실행되었는지 확인한다. `-v` 혹은 `-u` 옵션의 문제가 있을 경우 docker 프로세스가 정상적으로 올라오지 않는다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00001/dockerrunuwsgi.png" />
  <em>docker 프로세스가 정상적으로 올라왔는지 확인</em>
</p>

docker 프로세스가 정상적으로 올라오면 `-v` 옵션에 명시된 **host경로**에서 `flask.socket`과 log파일 접근이 가능하다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00001/host_socket_path.png" />
  <em>host에서 docker에서 생성한 flask.socket에 접근 가능</em>
</p>

 이제 host의 nginx에서 docker 내부의 Flask와 통신할 수 있도록 `uwsgi_pass`설정에서 `flask.sock`의 **host경로**를 지정한다.

```bash
# Docker에서 생성한 flask.sock의 경로를 지정
uwsgi_pass unix:/home/ec2-user/app/apiServer/socket/flask.sock;
```
<br/>

`flask.socket`파일을 통해 host의 nginx와 docker의 flaskAPI가 통신할 수 있게 된다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00001/success_docker_log.png" />
  <em>docker logs를 통해 정상 동작 확인</em>
</p>
