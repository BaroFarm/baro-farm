# 🤖 생성형 AI 기반 로컬푸드 이커머스 플랫폼: **BaroFarm (바로팜)**

## 🔗 프로젝트 개요

### 1. 프로젝트 정의
로컬푸드 직거래, AI로 간편하게!
BaroFarm은 전국 각지의 로컬푸드 직매장을 하나의 온라인 플랫폼으로 통합한 AI 기반 로컬푸드 판매 플랫폼입니다. 생성형 AI를 기반으로 상품 등록 간편화, AI 챗봇 등의 기능으로 생산자에게 판매 자동화, 소비자에게 맞춤형 구매를 제공해 로컬푸드의 지속적인 성장을 이끌며, 농가와 소비자가 상생하는 지속가능한 유통구조를 만드는 것을 목표로 합니다.

[![ICT 한이음 공모전 출품](https://img.shields.io/badge/Competition-ICT%20한이음%20드림업%20공모전-blue?style=flat-square&logo=gitHub&logoColor=white)](https://www.hanium.or.kr/)

---
### 2. 팀 구성 및 역할 분담

#### 개발 기간 및 팀원
* **개발 기간:** 2025년 3월 ~ 2025년 8월
* **팀원:** 주성아(팀장), 이해원, 선비, 조유진

#### 역할 분담

| 성명 | 역할 | 담당 업무 (주요) |
| :--- | :--- | :--- |
| **주성아 (팀장)** | PM, 백엔드 개발 | 프로젝트 관리, 판매자 기능 (AI 상품 등록/상세페이지 자동화 등) 개발 |
| **이해원** | 백엔드 개발 | 구매자 및 회원관리 기능, AI 챗봇 기능 개발 |
| **선비** | 프론트엔드 개발 | UI/UX 설계, 구매자 기능 프론트엔드 개발 |
| **조유진** | 프론트엔드 개발 | UI/UX 설계, 판매자 기능 프론트엔드 개발 |


---
### 3. 개발 배경 및 필요성
* **오프라인 로컬푸드 직매장의 한계:** 로컬푸드는 고령화로 인한 농가의 디지털 활용 어려움, 한정된 고객층과 매출 변동, 오프라인 직매장의 경쟁력 약화 등 구조적 한계에 직면해 있습니다. 이로 인해 로컬푸드의 사회적 가치를 지키고 안정적인 판로를 확보할 새로운 돌파구가 필요합니다.
* **온라인 식품 산업의 급성장과 유통 환경 변화:** 최근 10년간 온라인 유통 산업은 비약적으로 성장했으며, 특히 온라인 쇼핑 시장은 대형마트보다 **약 10배 빠른 속도**로 성장 중입니다. 빠른 배송 서비스와 사용자 편의성을 갖춘 소비자 중심의 서비스가 새로운 경쟁 요소로 부상했으며, 주요 유통 기업들(B마트, 마켓컬리 등)이 온라인 식품 서비스에 적극 진출하는 등 유통 방식이 빠르게 변화하고 있습니다.
* **BaroFarm이 제안하는 해결책 및 프로젝트 목적:** AI 기반 로컬푸드 온라인 판매 플랫폼이라는 새로운 유통 모델을 통해 로컬푸드의 사회적 가치를 보존하고, 지역 농가의 안정적 판로 확보에 기여합니다.

---

## 🚀 주요 기능

BaroFarm은 판매자와 구매자 모두의 편의를 극대화하는 기능을 제공합니다.

### 1. 생성형 AI 기반 자동화 기능
* **상품 설명 자동 생성:** 판매자가 입력한 기본 정보를 이용해 장문 형태의 상품 상세 설명을 AI가 자동 생성합니다.
* **상품 소개 영상 생성:** AI로 생성된 상세 설명을 기반으로 AI 상품 소개 영상을 자동 제작합니다.
* **상품 상세 페이지 생성:** Figma+GPT 연동을 통해 설명과 이미지를 기반으로 자동으로 레이아웃과 디자인을 생성합니다.
* **AI 챗봇:** OpenAI의 GPT API를 활용한 RAG 구조의 챗봇으로, 상품, 주문, 배송 등 기본적인 문의에 맥락을 파악하여 적절하게 응답합니다.

### 2. 데이터 기반 판매 지원 및 신뢰성
* **AI 판매 데이터 분석:** 품목별 매출 현황, 시기별 매출 변화 등을 시각화하여 제공하며, 농산물 가격 변동 데이터를 분석해 합리적인 가격 설정 기준을 제시합니다.
* **맞춤형 상품 추천 (하이브리드 CBF):** 사용자의 찜/구매 이력 및 선호도를 분석하여 개인별 최적화된 로컬푸드 상품을 추천합니다.
    * **비로그인 사용자:** 최근 30일 주문/찜 건수 기반 인기 상품을 추천합니다.
    * **로그인 사용자:** **CBF** 기반 선호 카테고리에서 인기 상품을 추천합니다.
* **신뢰성 확보:** 판매자는 회원가입 시 사업자번호와 통신판매번호를 입력해야 하며,상품에 부착된 QR 코드를 통해 생산 이력 조회를 기획하여 신선도와 투명성을 확보합니다.

---
## 🛠️ 기술 스택 (Tech Stack)

### 1. 개발 언어 및 프레임워크 (Frontend & Backend)
* **프론트엔드 (Frontend):** [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
* **백엔드 (Backend):** [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) 
    [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

### 2. AI 및 데이터 처리
* **AI/LLM:** [![OpenAI](https://img.shields.io/badge/OpenAI-41295D?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)  (GPT-3.5-turbo, GPT-4o-mini)
* **영상/디자인 자동화:** [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/) + [![OpenAI](https://img.shields.io/badge/OpenAI-41295D?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
* **클라우드:** [![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
### 3. 인증 및 결제 시스템
* **인증:** [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
* **결제:** [![Toss Payments](https://img.shields.io/badge/Toss%20Payments-3399FF?style=for-the-badge&logo=toss&logoColor=white)](https://www.tosspayments.com/)

### 4. 협업 및 관리 (DevOps)
* **버전 관리:** [![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/) 
    [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/) 
* **프로젝트 관리:** [![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)](https://www.atlassian.com/software/jira)
* **문서/디자인:** [![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://www.notion.so/) 
    [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)



## 📈 프로젝트 성과 및 향후 기대 효과

### 1. 프로젝트 작동 동영상
프로젝트의 실제 작동 모습을 확인하실 수 있습니다.

> [바로팜 프로젝트 작동 영상](https://youtu.be/ygQR53eN-Q0?si=EPjAt3jvxkIWK_5F)

### 2. 기대 효과 및 활용 분야
* **접근성 강화:** 고령층 판매자 특성을 고려하여 직관적 구조, 큰 글씨 등 고령자 친화적 UI를 반영하여 디지털 소외 계층의 서비스 접근성 실질적 개선
* **실현 가능성:** 로컬푸드 연합회와의 협업을 통해 실수요 기반으로 기획되었으며, 실제 도입을 추진 중인 모델
* **신뢰 중심 유통:** 주문 접수 후 익일 수확/당일 발송 구조 및 QR 코드 기반 생산 이력 조회를 기획하여 높은 신선도와 신뢰도 확보
* **활용 분야:**
    * 지역 농가와 소비자를 연결하는 B2C 기반 온라인 직거래 플랫폼
    * 지자체·공공기관 연계 로컬푸드 유통 플랫폼으로 확장 가능
    * 학교, 급식센터 등과의 정기 납품 계약을 위한 B2B 연계 납품 시스템으로 활용
