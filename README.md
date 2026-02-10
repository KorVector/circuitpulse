# CircuitPulse

> AI 기반 전기회로 분석 시뮬레이터

CircuitPulse는 인공지능을 활용하여 전기회로를 분석하고 시뮬레이션할 수 있는 웹 애플리케이션입니다. 회로도 이미지를 업로드하면 GPT-4o Vision API가 자동으로 회로를 인식하고 분석하여, 오류 진단, 부품 최적화, 위험 경고 등을 제공합니다.

## 주요 기능

### 🔍 AI 회로 분석
- **회로도 이미지 인식**: 손그림이나 스캔한 회로도를 업로드하면 AI가 자동으로 인식
- **구성요소 분석**: 저항, LED, 전지 등 회로 부품을 자동으로 식별
- **전기적 계산**: 전압, 전류, 저항, 전력 등을 자동으로 계산

### ⚠️ 오류 진단 & 위험 경고
- **실시간 오류 감지**: 단락, 과전류, 부품 손상 등 잠재적 위험 사전 감지
- **위험도 평가**: 경고 수준별로 색상 코딩된 알림 제공
- **안전 권장사항**: 각 위험 요소에 대한 구체적인 해결 방안 제시

### 💡 인과관계 설명
- **"왜 안 되는지" 설명**: 회로가 작동하지 않는 이유를 원인-결과-해결 구조로 설명
- **교육적 피드백**: 초보자도 이해하기 쉬운 한국어 설명 제공

### 🔧 부품 최적화
- **대체 부품 제안**: 보유 부품으로 회로를 구성할 수 있도록 대안 제시
- **수급 가능성 평가**: 현실적으로 구할 수 있는 부품 추천
- **비용 효율성**: 성능 대비 가격을 고려한 부품 제안

### ⚡ 실시간 시뮬레이션
- **가상 회로 구성**: 드래그 앤 드롭으로 쉽게 회로 설계
- **즉시 계산**: 옴의 법칙을 적용한 실시간 전기적 특성 계산
- **시각적 피드백**: 전압, 전류, 저항, 전력을 직관적으로 표시

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **API Routes**: Next.js API Routes
- **AI**: OpenAI GPT-4o Vision API

### 유틸리티
- **Class Management**: clsx, tailwind-merge
- **UI Components**: Radix UI (Dialog, Tabs)

## 설치 및 실행

### 사전 요구사항
- Node.js 18.x 이상
- OpenAI API 키 ([OpenAI Platform](https://platform.openai.com/)에서 발급)

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/KorVector/circuitpulse.git
cd circuitpulse
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 OpenAI API 키를 입력하세요:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_NAME=CircuitPulse
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
circuitpulse/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── analyze/         # AI 회로 분석 API
│   │   │   │   └── route.ts
│   │   │   └── simulate/        # 시뮬레이션 API
│   │   │       └── route.ts
│   │   ├── analyze/             # 회로 분석 페이지
│   │   │   └── page.tsx
│   │   ├── simulate/            # 시뮬레이션 페이지
│   │   │   └── page.tsx
│   │   ├── globals.css          # 전역 스타일
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 메인 랜딩 페이지
│   ├── components/              # React 컴포넌트
│   │   └── layout/
│   │       └── Header.tsx       # 네비게이션 헤더
│   ├── lib/                     # 유틸리티 함수
│   │   └── utils.ts
│   └── types/                   # TypeScript 타입 정의
│       └── circuit.ts
├── public/                      # 정적 파일
├── .env.example                 # 환경 변수 예시
├── .gitignore
├── next.config.js               # Next.js 설정
├── package.json
├── postcss.config.js            # PostCSS 설정
├── tailwind.config.ts           # Tailwind CSS 설정
└── tsconfig.json                # TypeScript 설정
```

## 사용 방법

### 1. 회로 분석
1. 상단 네비게이션에서 "회로 분석" 클릭
2. 회로도 이미지를 드래그 앤 드롭하거나 클릭하여 업로드
3. (선택사항) 보유 부품 목록 입력
4. "회로 분석하기" 버튼 클릭
5. AI 분석 결과 확인:
   - 종합 분석
   - 위험 경고
   - 인식된 부품
   - 오류 진단
   - 회로 계산
   - 인과관계 설명
   - 대체 부품 제안
   - 현실 변수

### 2. 시뮬레이션
1. 상단 네비게이션에서 "시뮬레이션" 클릭
2. 부품 팔레트에서 원하는 부품 추가 (전지, 저항, LED, 커패시터, 스위치)
3. 각 부품의 값 입력 (예: 9V, 220Ω)
4. "시뮬레이션 실행" 버튼 클릭
5. 결과 확인:
   - 총 전압, 전류, 저항, 전력
   - 경고 메시지
   - 사용된 공식

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정 (OPENAI_API_KEY)
4. 배포 버튼 클릭

### 다른 플랫폼

Next.js 애플리케이션을 지원하는 모든 플랫폼에 배포 가능:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Microsoft Azure

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여

이슈 제출 및 풀 리퀘스트를 환영합니다!

## 문의

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.
