## 🚀 Git 작업 흐름

---

1️⃣ **기능 브랜치 생성** 

`main`과 `dev` 브랜치에서는 직접 작업하지 않고, 기능별 브랜치를 만들어 작업합니다.

```bash
git checkout dev           
git pull origin dev          # dev 최신화
git checkout -b feat/기능명  # 브랜치 생성 
```

> 📌 브랜치 명명 규칙은 [🔽 브랜치 규칙](https://www.notion.so/22f5f5c2ca4980e98a0bed9f431d9576?pvs=21) 참고
> 

2️⃣ **기능 구현 & 커밋** 

기능 구현 후 작업 단위로 커밋합니다. 

```bash
git add .
git commit -m "feat: 회원가입 API 구현"
```

> 📌 커밋 컨벤션은  [🔽 커밋 메시지 규칙  (Conventional Commits)](https://www.notion.so/Conventional-Commits-22f5f5c2ca498086809cc1c2e5845c09?pvs=21) 참고
> 

3️⃣ **원격 저장소에 푸시** 

```bash
git push origin feat/기능명
```

4️⃣ **PR (Pull Request) 생성** 

GitHub에서 **`dev` 브랜치로 PR**을 생성합니다.

<aside>

1. PR 제목은 커밋 컨벤션과 동일하게
2. 작업 중이면 Draft PR로 먼저 공유
3. 작업 완료 후 “Ready for review” 클릭 → 코드 리뷰 요청
</aside>

> 📌 자세한 형식은 [🔽 PR (Pull Request) 규칙](https://www.notion.so/PR-Pull-Request-22f5f5c2ca498088a05ddbf61fb8c855?pvs=21) 참고
> 

### 🔽 브랜치 규칙

---

```
main             # 배포용 브랜치 (⛔ push 금지)
dev              # 통합 개발 브랜치 (기능 완료 후 merge)
feat/*           # 기능 개발용 브랜치
fix/*            # 버그 수정용 브랜치
docs/*           # 문서 수정/작성
refactor/*       # 리팩토링용 브랜치
chore/*          # 설정 변경, 빌드, 패키지 등 
```

> ex)
> 
> 
> ```
> feat/signup-form
> fix/login-token-expire
> docs/readme-update
> refactor/db-models
> ```
> 

### 🔽 커밋 메시지 규칙  (Conventional Commits)

---

**형식** 

`<타입> : <간결한 설명>`

| 타입 | 설명 |
| --- | --- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| refactor | 코드 리팩토링 (기능 변화 없음) |
| style | 코드 포맷팅, 세미콜론 누락 등 |
| chore | 빌드, 설정 파일 수정 등 기타 작업 |
| docs | 문서 작성 또는 수정 |
| test | 테스트 코드 추가/수정 |

> ex)
> 
> 
> ```
> feat: 회원가입 API 구현
> fix: 로그인 토큰 갱신 버그 수정
> docs: README에 실행 방법 추가
> refactor: DB 모델 초기화 로직 분리
> ```
> 

### 🔽 PR (Pull Request) 규칙

---

- **PR 생성**
    
    > **PR 제목** : 커밋 컨벤션 형식과 동일하게 작성
    > 
    > 
    > *ex) `feat: 상품 상세 페이지 UI 구현`*
    > 
    > **PR 본문** : 작업 개요 및 주요 변경 사항 간략히 작성 
    > 
    > 
- **Draft PR 활용**
    
    > Draft PR을 활용하면 작업 중에 미리 PR을 올릴 수 있습니다.
    > 

- **코드 리뷰**
    
    > 수정 완료 후, 코드 리뷰 받기 전 **"Ready for review"** 클릭해 리뷰 요청!
    > 
    > 
    > Comment를 통해 다른 팀원 코드 리뷰  후 Merge 
    > 
   