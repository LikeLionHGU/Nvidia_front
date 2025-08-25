# 개발 가이드라인

공실 소유자와 공간이 필요한 사람을 연결해주는 플랫폼 Space On 입니다.

### 흥해읍 엔비디아 개발 규칙 (요약)
1) 이슈작성법: ```[타입] - 한글 ```=> ```[style] - 메뉴바 스타일```
2) 브랜치 : ```이름_[타입]/#번호 ```=> ```jonghun_feat/#1```
3) 커밋 : ```"타입 : 짧은설명"``` => ```"feat: 로그인"```
4) 파일구조 : 
``` tree
   /src
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/          # 전역적으로 사용하는 버튼, 인풋, 모달 등
│   └── specific/        # 특정 페이지에서만 사용하는 컴포넌트
├── pages/               # 라우팅 되는 페이지 컴포넌트 (e.g., Home, About)
│   ├── HomePage.jsx
│   └── AboutPage.jsx
├── api/             # API 요청 관련 파일 (e.g., axios 인스턴스, 각 API 함수)
├── assets/              # 이미지, 폰트, 아이콘 등 정적 파일
│   ├── images/
│   ├── fonts/
│   └── icons/
├── hooks/               # 커스텀 훅 (재사용 가능한 로직)
├── store/               # 상태 관리 
├── styles/              # 전역 스타일, 공통 스타일
│   ├── global.css
│   └── variables.css
├── main.jsx             
└── App.jsx
```

6) 자기가 짠 코드 주석 달기 




### 이슈 작성

✹ **Git Issue**

- 작업할 기능에 대한 issue를 작성합니다.
- issue 제목은 **[타입] - 설명**으로 통일합니다. (ex. [Style] - 텍스트 스타일 추가)
- Assignees에는 작업을 맡은 사람을 태그합니다.
- Labels에는 해당 작업과 맞는 유형을 태그합니다.
- 설명란에는 어떤 작업을 할 예정인지, 관련된 이슈번호가 있는지 참고한 내용이 있는지 등 필요한 내용을 적습니다.
  <br />

### 브랜치 생성

✹ **Git Branch**

- 각자 생성한 브랜치에서만 작업합니다.
- 브랜치 이름 구조는 <**본인이름_유형/#이슈번호**> 입니다. (ex. eunju_feat/#1)
  <br />

### Commit 메시지 작성법

|          |                                       |                                                         |
| -------- | ------------------------------------- | ------------------------------------------------------- |
| type     | Description                           | Example                                                 |
| feat     | 새로운 기능 추가, 구현                | feat : 로그인 기능 구현                                 |
| edit     | 단순 오타 수정                        | edit : 로그인 캐시 처리 방식 수정                       |
| style    | UI작업, 스타일 관련 파일 추가 및 수정 | style : 폰트 등록                                       |
| add      | asset 파일(이미지, 아이콘 등) 추가    | add : 위젯 이미지 추가                                  |
| chore    | 파일, 경로를 옮기거나 이름 변경       | chore : feet -> feat 이름 변경                          |
| delete   | 덤프 파일 삭제                        | delete : Empty.md 파일 삭제                             |
| merge    | 브랜치 병합(merge)                    | merge : pull request #3 from LikeLionHGU/Haeun_Style/#1 |
| fix      | 버그 픽스                             | fix : Color 버그 수정                                   |
| docs     | 문서 작업                             | docs : Readme 작성                                      |
| refactor | 코드 리팩토링                         | refactor : 변수명 수정                                  |
| model    | 데이터베이스(모델) 작업               | model : 데이터 모델 생성                                |
| init     | 프로젝트 생성                         | init : 프로젝트 생성                                    |
| test     | 테스트 케이스 생성                    | test: 테스트 케이스 생성                                |
| 빌드관련 |                                       |                                                         |
| build    | 재빌드                                | build: 동일버전 재빌드(x.xx)                            |
| version  | 버전 업                               | version : 버전(2.0.0) 업데이트                          |

<br />
