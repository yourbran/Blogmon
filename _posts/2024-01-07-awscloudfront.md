---
title: 블로그몬 CDN 적용 Part 1
layout: post
permalink: /project/blogmoncdnpart1
posttype: project
post-image: https://cdn.bouldermon.com/project/project00002/initial.jpg
description: AWS S3 Bucket과 CloudFront distribution 생성
tags:
- TECH
- NETWORK
- AWS
---

### CDN 사용 목적
> CDN(Content Delivery Network) : 데이터 사용량이 많은 애플리케이션의 웹 페이지 로드 속도를 높이는 상호 연결된 서버 네트워크

CDN을 사용하면 다음과 같은 이점이 있다.
- 페이지 로드 시간 단축
- 대역폭 비용 절감
- 콘텐츠 가용성 제고
- 웹 사이트 보안 강화

블로그몬 **게시글의 로드 시간을 단축**시키며 **Lightsail instance의 대역폭 비용을 절감**하고 **DDoS 공격으로부터 보호**하기 위한 목적으로 CDN을 사용하고 싶었다.

### CloudFront와 S3를 이용한 CDN 환경 구성
블로그몬이 AWS lightsail에서 서비스되고 있으므로, CDN 환경도 AWS의 CloudFront와 S3 Bucket을 사용하여 구축하는게 좋을 것이라고 생각했다. AWS에서 제공하는 Tutorial인 [Deliver Content Faster with Amazon CloudFront](https://aws.amazon.com/ko/getting-started/hands-on/deliver-content-faster/)을 참고했다.

#### S3 Bucket 생성
S3 Bucket을 생성할 때 *Bucket naming Rules*이 존재한다. 지정된 특수문자만 사용하거나 특정 prefix를 사용하면 안 되는 등 여러 Rules 존재하므로 [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)을 참고하여 Bucket 이름을 정한다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/create_bucket_name.png">
</p>

대부분의 설정들은 Tutorial과 대부분 동일하게 진행했지만, **Block all public access** 부분만은 체크를 해제하지 않았다. 보안 상의 이유가 가장 크긴 했지만 Public Access를 풀어야할 이유는 없었기 때문이다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/block_all_public_access.png">
</p>

생성을 완료하면 아래와 같이 S3 console에 생성된 Bucket이 표시된다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/created_bucket.png">
</p>

Bucket에 진입 후 **Add folder**를 클릭하여 파일들을 추가한다. Tutorial에서는 **Permissions**부분에서 **Grant public-read access**을 선택하지만, S3 Bucket 생성 시 **Block all public access**을 선택했으므로 해당 옵션이 보이지 않는다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/bucket_add_folder.png">
</p>

S3에 업로드된 자원들이 어떻게 사용되고 어느정도의 성능을 갖춰야하는지에 따라 **storage class**를 선택할 수 있다. 블로그 게시글에 포함될 이미지들을 업로드하는 것이므로 범용적인 목적의 **Standard**를 선택했다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/bucket_storage_class.png">
</p>

업로드를 완료한 후 Object URL을 통해 직접 접근하면 **AccessDenied** 코드를 응답받는다. S3 Bucket 생성 시 설정했던 **Block all public access** 때문이다. CloudFront를 통해서만 Object에 접근할 수 있도록 할 것이다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/fail_access_obj_url.png">
</p>

#### CloudFront distribution 생성
Bucket 생성이 끝났으면 CloudFront 배포를 생성해야 한다. 우선 **Origin domain**과 **Name**을 입력한다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_origin_setting.png">
</p>

**Origin Access**는 CloudFront로부터의 인증된 요청만이 S3에 접근할 수 있도록 하기 위해, AWS에서 권장하는 OAC(Origin Access Control)을 선택했다.

> Origin Access Control :  IAM 서비스 주체를 사용하여 S3 원본에 인증하는 AWS 모범 사례를 기반으로, OAI(Origin Access Identity) 대비 향상된 기능들을 제공

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_origin_access_setting.png">
</p>

CloudFront는 항상 들어오는 요청에 서명하기 때문에 AWS 권장에 따라 **Sign requests**를 체크한 후 **Create control setting**을 생성했다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/oac_create_control_setting.png">
</p>

https만 허용하는 **Viewer protocol policy** 설정을 제외하곤 나머지 설정은 모두 기본 설정으로 체크했다. **Web Application Firewall (WAF)**도 미사용으로 진행했다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_viewer_setting.png">
</p>

#### S3 Bucket Policy 수정
CloudFront distribution이 완료되면 CloudFront의 OAC 읽기 접근이 S3에 유효할 수 있도록 **Bucket Policy**를 수정하라는 메세지가 나온다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_bucket_policy_update.png">
</p>

링크를 타고 S3 Bucket으로 넘어가서 **Bucket Policy**를 수정한다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/s3_bucket_policy_change.png">
</p>

CloudFront 배포가 완료되고 Bucket Policy 설정까지 끝나면 CloudFront를 통해 S3 Object에 접근할 수 있다. **Distribution domain name** 밑으로 **S3 Object의 Key**를 입력하면 저장했던 이미지들을 확인할 수 있다.

<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_s3_image.png">
  <em>https://{DistributionDomainName}/{S3ObjectKey}</em>
</p>

#### CloudFront 도메인 설정
배포 도메인 이름은 다소 복잡하고 읽기도 쉽지 않다. 블로그몬은 Route53을 통해 기존에 사용하던 도메인이 있으므로, 해당 도메인을 활용해 CloudFront에 새로운 도메인을 적용했다.

먼저, Route53에서 신규 Record를 생성해야 한다. **Record type**은  **CNAME**으로 선택하고 **Value**에는 CloudFront의 **Distribution Domain Name**을 입력한다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/create_record_cf.png">
</p>

Record 생성 후 CloudFront console로 이동하여 **Alternate domain name (CNAME) - optional**에 Route53에서 생성한 Record명을 입력한다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_alternate_domain_name.png">
</p>

SSL을 적용해야하므로 **Custom SSL certificate - optional**을 클릭했는데 과거에 만들어 두었던 Public 인증서가 보이지 않았다. 이유는 서울 리전에 생성해두었기 때문이었는데, CloudFront는 버지니아 리전에 있는 인증서만을 이용할 수 있었다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_custom_certificate_none.png">
</p>

서울 리전에 있는 Public 인증서를 버지니아 리전으로 복사하고 싶었으나 불가능했다. *왜냐하면 인증서의 프라이빗 키를 암호화하는 데 사용되는 AWS Key Management Service(AWS KMS) 키가 AWS 리전 및 계정마다 고유하기 때문이다.* ([AWS 지식센터](https://repost.aws/ko/knowledge-center/acm-export-certificate) 참고)

지식센터 솔루션에 따라 **버지니아** 리전에 동일 도메인으로 새로운 인증서를 생성했다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_virginia_certificate_create.png">
</p>

CloudFront Setting으로 돌아와서 페이지 refresh 후 **Custom SSL certificate - optional**을 클릭하면 인증서가 조회된다. **Alternate domain name (CNAME) - optional**까지 다시 입력 후 변경사항을 저장한다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_custom_certificate_selected.png">
</p>

이제 Route53에서 등록했던 CDN Record를 통해 S3 Bucket에 접근할 수 있게 되었다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_cdn_s3_image.png">
</p>

그런데 브라우저의 개발자도구에서 CloudFront의 Cache Hit 점검 도중 다른 부분에서 CORS 오류를 발견했다. 블로그의 이미지들과 폰트들을 S3로부터 가져오는데, 폰트만 CORS 오류가 발생했다. 왜 이미지는 정상적으로 가져올 수 있었지?
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cache_hit_and_cors_error.png">
</p>

그 이유는 브라우저는 일반적으로 img와 script 태그에 대해선 CORS 체크를 하지 않았기 때문이다. 개발자도구를 통해 Img태그를 보면 Origin이 없는 것을 확인할 수 있다. 반면에 Font는 Origin이 존재한다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/img_font_origin_tags.png">
  <em>Img Request에는 Origin항목이 없지만 Font Request에는 존재한다</em>
</p>

때문에 CORS검증을 거쳐 Font를 정상적으로 가져오기 위해선 CloudFront에서 Origin관련 내용을 추가하여 응답할 수 있도록 설정을 추가해야 했다.

#### CloudFront CORS 설정
CloudFront는 S3Origin과 관련된 **pre-built origin request policies**를 제공한다. 덕분에 따로 개발하거나 JSON을 작성할 필요 없이 콤보박스를 통해 선택만 하면 된다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_behavior_origin_request_policy_setting.png">
  <em>CloudFront - Distributions - Behaviors - Edit - Cache key and origin requests</em>
</p>

S3로부터 객체를 가져와 Client에 응답해줄 때에도 CloudFront에서 제공하는 **Response headers policy**를 사용하여 Response를 전달한다.
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/cf_behavior_response_policy_setting.png">
  <em>CloudFront - Distributions - Behaviors - Edit - Response headers policy</em>
</p>

위 이미지에 선택된 정책은 `Access-Control-Allow-Origin`와 `Access-Control-Allow-Methods` 등 여러 header들이 포함되어 있으며 자세한 내용은 [Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html)를 참고하면 된다.

#### S3 Bucket CORS 설정
CloudFront를 통해 S3 Bucket의 리소스를 가져올 것이므로 S3 Bucket의 CORS도 설정이 필요하다. AWS의 [CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html#cors-allowed-origin) 가이드를 참고하여 설정했다.
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```
<br/>

#### 구성완료 및 후속과제
AWS CloudFront와 S3 Bucket을 이용해 블로그몬을 위한 CDN 환경이 구성되었다. 
<p align="center">
  <img src="https://cdn.bouldermon.com/project/project00002/overview.png">
  <em>fonts와 images들만 CDN을 적용한 상태</em>
</p>
추후 블로그몬에 계정시스템이 도입된 이후엔 인증된 사용자만의 리소스에 접근할 수 있도록 Signed URL 혹은 Signed Cookie도 진행해 볼 예정이다.
