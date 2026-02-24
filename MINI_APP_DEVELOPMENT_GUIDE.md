# 토스 미니앱 개발 가이드

> 행운쿠키 미니앱 개발 경험을 바탕으로 정리한 토스 미니앱 개발 가이드입니다.

## 목차
1. [프로젝트 구조](#1-프로젝트-구조)
2. [환경 설정](#2-환경-설정)
3. [개발 시작하기](#3-개발-시작하기)
4. [토스 인앱 광고 연동 (핵심)](#4-토스-인앱-광고-연동-핵심)
5. [빌드 및 배포](#5-빌드-및-배포)
6. [디자인 가이드 (TDS)](#6-디자인-가이드-tds)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 프로젝트 구조

```
my-mini-app/
├── index.html              # 메인 HTML (진입점)
├── js/
│   └── app.js              # 앱 로직 (React 컴포넌트)
├── img/
│   └── icon.png            # 앱 아이콘
├── docs/
│   ├── app.json            # 앱 메타데이터
│   ├── privacy.html        # 개인정보처리방침
│   └── terms.html          # 이용약관
├── granite.config.ts       # 토스 미니앱 설정
├── package.json
├── vite.config.js
└── dist/                   # 빌드 결과물
    └── web/
        └── index.html
```

---

## 2. 환경 설정

### 2.1 필수 패키지 설치

```bash
npm init -y
npm install @apps-in-toss/web-framework
npm install -D vite
```

### 2.2 package.json 설정

```json
{
  "name": "my-mini-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "granite dev",
    "build": "granite build",
    "deploy": "ait deploy"
  },
  "dependencies": {
    "@apps-in-toss/web-framework": "^1.9.1"
  },
  "devDependencies": {
    "vite": "^7.3.1"
  }
}
```

### 2.3 granite.config.ts (토스 미니앱 설정)

```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-app-name',           // 앱 고유 식별자
  brand: {
    displayName: '내 앱 이름',       // 사용자에게 보이는 앱 이름
    primaryColor: '#3182F6',         // 토스 블루 권장
    icon: 'https://example.com/icon.png',  // 앱 아이콘 URL
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],  // 필요한 권한 추가
  outdir: 'dist',
});
```

### 2.4 vite.config.js

```javascript
export default {
  root: '.',
  publicDir: '.',
  base: './',
  build: {
    outDir: 'dist',
    copyPublicDir: false,
    target: ['es2015', 'chrome58', 'safari11', 'ios11'],  // 구형 기기 지원
  },
}
```

### 2.5 docs/app.json (앱 메타데이터)

```json
{
  "name": "내 앱 이름",
  "version": "1.0.0",
  "entry": "index.html"
}
```

---

## 3. 개발 시작하기

### 3.1 로컬 개발 서버 실행

```bash
npm run dev
```

### 3.2 기본 HTML 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>내 앱</title>
  
  <!-- TDS 폰트: Pretendard -->
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
  
  <!-- Tailwind CSS (선택) -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  
  <!-- React CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- 앱 코드 -->
  <script src="js/app.js"></script>
</body>
</html>
```

---

## 4. 토스 인앱 광고 연동 (핵심)

> **중요**: 이 섹션은 실제 광고 수익을 발생시키는 핵심 부분입니다.

### 4.1 광고 그룹 ID 발급받기

1. 토스 개발자 콘솔에서 앱 등록
2. 광고 설정 메뉴에서 **광고 그룹 ID** 발급
3. 형식: `ait.v2.live.XXXXXXXXXXXXXX`

### 4.2 광고 SDK 임포트

```html
<!-- index.html에 추가 -->
<script type="module">
  import { GoogleAdMob } from '@apps-in-toss/web-bridge';
  window.GoogleAdMob = GoogleAdMob;
  console.log('[TossAd] SDK imported');
</script>
```

### 4.3 광고 매니저 구현 (전체 코드)

```javascript
// =====================================================
// 토스 인앱광고 매니저 (Apps in Toss AdMob)
// 
// 실제 광고 ID: ait.v2.live.XXXXXXXXXXXXXX
// (토스 개발자 콘솔에서 발급받은 ID로 교체)
// =====================================================

var AD_GROUP_ID = 'ait.v2.live.4866439559594857';  // 실제 광고 그룹 ID

var TossAdManager = {
  isAdLoaded: false,      // 광고 로드 완료 여부
  isAdShowing: false,     // 광고 표시 중 여부
  loadCleanup: null,      // 로드 cleanup 함수
  showCleanup: null,      // 표시 cleanup 함수

  // =====================================================
  // SDK 사용 가능 여부 확인
  // 토스 앱 내부에서만 true 반환
  // =====================================================
  isSDKAvailable: function() {
    return typeof GoogleAdMob !== 'undefined' && 
           typeof GoogleAdMob.loadAppsInTossAdMob === 'function' &&
           typeof GoogleAdMob.showAppsInTossAdMob === 'function';
  },

  // =====================================================
  // 광고 미리 로드 (Pre-load)
  // 
  // 권장: 앱 시작 시 또는 광고 표시 전에 미리 호출
  // 광고가 미리 로드되어 있으면 표시 속도가 빨라짐
  // =====================================================
  loadAd: function(onLoaded, onError) {
    var self = this;
    
    // 이미 로드된 경우 바로 콜백 호출
    if (this.isAdLoaded) {
      console.log('[TossAd] 광고가 이미 로드되어 있습니다.');
      if (onLoaded) onLoaded();
      return;
    }

    // 기존 로드 요청 정리
    if (this.loadCleanup) {
      this.loadCleanup();
      this.loadCleanup = null;
    }

    console.log('[TossAd] 광고 로드 시작... (adGroupId: ' + AD_GROUP_ID + ')');

    // SDK가 사용 가능한 경우 (토스 앱 내부)
    if (this.isSDKAvailable()) {
      console.log('[TossAd] GoogleAdMob SDK 발견');
      
      // isSupported 확인 (선택적)
      try {
        if (typeof GoogleAdMob.loadAppsInTossAdMob.isSupported === 'function' && 
            !GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
          console.warn('[TossAd] loadAppsInTossAdMob이 지원되지 않습니다.');
          if (onError) onError({ message: '광고가 지원되지 않는 환경입니다.' });
          return;
        }
      } catch (e) {
        // isSupported 확인 실패 시 무시하고 진행
      }

      try {
        // =====================================================
        // loadAppsInTossAdMob API 호출
        // 
        // options.adGroupId: 필수 - 토스에서 발급받은 광고 그룹 ID
        // onEvent: 이벤트 콜백
        //   - { type: 'loaded' } : 광고 로드 완료
        // onError: 에러 콜백
        // 
        // 반환값: cleanup 함수 (리소스 정리용)
        // =====================================================
        this.loadCleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID
          },
          onEvent: function(event) {
            console.log('[TossAd] 로드 이벤트:', event);
            if (event && event.type === 'loaded') {
              self.isAdLoaded = true;
              console.log('[TossAd] 광고 로드 성공!');
              if (onLoaded) onLoaded();
            }
          },
          onError: function(error) {
            console.error('[TossAd] 광고 로드 실패:', error);
            self.isAdLoaded = false;
            if (onError) onError(error);
          }
        });
        console.log('[TossAd] loadAppsInTossAdMob 호출 완료');
      } catch (e) {
        console.error('[TossAd] loadAppsInTossAdMob 호출 중 예외:', e);
        if (onError) onError(e);
      }
    } else {
      // =====================================================
      // SDK 없음 - 테스트 모드 (브라우저에서 직접 실행 시)
      // 실제 토스 앱에서는 이 분기로 들어오지 않음
      // =====================================================
      console.log('[TossAd] GoogleAdMob SDK를 찾을 수 없습니다. 테스트 모드로 동작합니다.');
      setTimeout(function() {
        self.isAdLoaded = true;
        console.log('[TossAd] (테스트) 광고 로드 성공');
        if (onLoaded) onLoaded();
      }, 500);
    }
  },

  // =====================================================
  // 광고 표시 (Show)
  // 
  // 반드시 loadAd로 광고가 로드된 후에 호출해야 함
  // 광고 시청 완료 시 onComplete 콜백 호출
  // =====================================================
  showAd: function(onComplete, onError) {
    var self = this;
    
    // 광고가 로드되지 않은 경우
    if (!this.isAdLoaded) {
      console.warn('[TossAd] 광고가 아직 로드되지 않았습니다.');
      if (onError) onError({ message: '광고가 준비되지 않았습니다.' });
      return;
    }

    // 이미 광고가 표시 중인 경우
    if (this.isAdShowing) {
      console.warn('[TossAd] 광고가 이미 표시 중입니다.');
      return;
    }

    this.isAdShowing = true;
    console.log('[TossAd] 광고 표시 시작... (adGroupId: ' + AD_GROUP_ID + ')');

    if (this.isSDKAvailable()) {
      console.log('[TossAd] showAppsInTossAdMob 호출');
      
      // isSupported 확인 (선택적)
      try {
        if (typeof GoogleAdMob.showAppsInTossAdMob.isSupported === 'function' && 
            !GoogleAdMob.showAppsInTossAdMob.isSupported()) {
          console.warn('[TossAd] showAppsInTossAdMob이 지원되지 않습니다.');
          self.isAdShowing = false;
          if (onError) onError({ message: '광고 표시가 지원되지 않는 환경입니다.' });
          return;
        }
      } catch (e) {
        // isSupported 확인 실패 시 무시하고 진행
      }

      try {
        // =====================================================
        // showAppsInTossAdMob API 호출
        // 
        // options.adGroupId: 필수 - 토스에서 발급받은 광고 그룹 ID
        // onEvent: 이벤트 콜백 (중요한 이벤트들)
        //   - { type: 'show' }         : 광고 표시됨
        //   - { type: 'impression' }   : 광고 노출됨 (수익 발생 시점)
        //   - { type: 'clicked' }      : 광고 클릭됨
        //   - { type: 'dismissed' }    : 광고 닫힘 (완료)
        //   - { type: 'failedToShow' } : 광고 표시 실패
        //   - { type: 'userEarnedReward' } : 리워드 획득 (리워드 광고)
        // onError: 에러 콜백
        // 
        // 반환값: cleanup 함수 (리소스 정리용)
        // =====================================================
        this.showCleanup = GoogleAdMob.showAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID
          },
          onEvent: function(event) {
            console.log('[TossAd] show 이벤트:', event);
            
            // 광고 닫힘 - 가장 중요한 이벤트
            if (event && event.type === 'dismissed') {
              console.log('[TossAd] 광고 닫힘 (dismissed)');
              self.isAdLoaded = false;   // 로드 상태 초기화
              self.isAdShowing = false;  // 표시 상태 초기화
              
              // cleanup 함수 호출
              if (self.showCleanup) {
                self.showCleanup();
                self.showCleanup = null;
              }
              
              // 다음 광고 미리 로드 (권장)
              self.loadAd();
              
              // 완료 콜백 호출
              if (onComplete) onComplete();
            }
            // 광고 표시 실패
            else if (event && event.type === 'failedToShow') {
              console.log('[TossAd] 광고 표시 실패');
              self.isAdLoaded = false;
              self.isAdShowing = false;
              if (self.showCleanup) {
                self.showCleanup();
                self.showCleanup = null;
              }
              if (onError) onError({ message: '광고 표시 실패' });
            }
            // 기타 이벤트 로깅
            else if (event && event.type === 'show') {
              console.log('[TossAd] 광고 표시됨');
            }
            else if (event && event.type === 'impression') {
              console.log('[TossAd] 광고 노출됨 (수익 발생)');
            }
            else if (event && event.type === 'clicked') {
              console.log('[TossAd] 광고 클릭됨');
            }
            else if (event && event.type === 'userEarnedReward') {
              console.log('[TossAd] 리워드 획득:', event.data);
            }
          },
          onError: function(error) {
            console.error('[TossAd] 광고 표시 실패:', error);
            self.isAdLoaded = false;
            self.isAdShowing = false;
            if (self.showCleanup) {
              self.showCleanup();
              self.showCleanup = null;
            }
            if (onError) onError(error);
          }
        });
        console.log('[TossAd] showAppsInTossAdMob 호출 완료');
      } catch (e) {
        console.error('[TossAd] showAppsInTossAdMob 호출 중 예외:', e);
        self.isAdShowing = false;
        if (onError) onError(e);
      }
    } else {
      // 테스트 모드 (브라우저)
      console.log('[TossAd] (테스트) 광고 표시 중...');
      setTimeout(function() {
        console.log('[TossAd] (테스트) 광고 닫힘');
        self.isAdLoaded = false;
        self.isAdShowing = false;
        self.loadAd();  // 다음 광고 미리 로드
        if (onComplete) onComplete();
      }, 2000);  // 테스트용 2초 딜레이
    }
  },

  // =====================================================
  // 광고 준비 상태 확인
  // 
  // true: 광고가 로드되어 있고 표시 중이 아님
  // false: 광고가 아직 준비되지 않았거나 표시 중
  // =====================================================
  isReady: function() {
    return this.isAdLoaded && !this.isAdShowing;
  }
};
```

### 4.4 광고 사용 패턴 (권장)

```javascript
// =====================================================
// 패턴 1: 앱 시작 시 광고 미리 로드
// =====================================================
useEffect(function() {
  // 앱 시작 시 광고 미리 로드
  TossAdManager.loadAd(
    function() { 
      console.log('광고 준비 완료');
      setIsAdReady(true); 
    },
    function(error) { 
      console.error('광고 로드 실패:', error);
      setIsAdReady(false); 
    }
  );
}, []);

// =====================================================
// 패턴 2: 광고 시청 후 콘텐츠 표시
// =====================================================
function handleWatchAd() {
  if (isAdLoading) return;
  setIsAdLoading(true);
  
  // 타임아웃 설정 (10초 후 광고 없이 진행)
  var adTimeout = setTimeout(function() {
    console.log('광고 타임아웃 - 결과 바로 표시');
    onAdComplete();
  }, 10000);
  
  function clearAdTimeout() {
    if (adTimeout) {
      clearTimeout(adTimeout);
      adTimeout = null;
    }
  }

  // 광고가 준비되어 있는 경우
  if (TossAdManager.isReady()) {
    TossAdManager.showAd(
      function() {
        // 광고 시청 완료
        clearAdTimeout();
        setIsAdReady(false);
        onAdComplete();  // 콘텐츠 표시
        
        // 다음 광고 로드 상태 업데이트
        setTimeout(function() {
          if (TossAdManager.isAdLoaded) setIsAdReady(true);
        }, 1000);
      },
      function(error) {
        // 광고 표시 실패 - 그래도 콘텐츠는 표시
        clearAdTimeout();
        console.error('광고 표시 실패:', error);
        setIsAdReady(false);
        onAdComplete();  // 광고 실패해도 콘텐츠 표시
        
        // 광고 다시 로드 시도
        TossAdManager.loadAd(
          function() { setIsAdReady(true); },
          function() { setIsAdReady(false); }
        );
      }
    );
  } else {
    // 광고가 준비되지 않은 경우 - 로드 시도 후 표시
    TossAdManager.loadAd(
      function() {
        setIsAdReady(true);
        TossAdManager.showAd(
          function() {
            clearAdTimeout();
            setIsAdReady(false);
            onAdComplete();
          },
          function() {
            clearAdTimeout();
            setIsAdReady(false);
            onAdComplete();
          }
        );
      },
      function() {
        // 로드 실패 - 광고 없이 진행
        clearAdTimeout();
        setIsAdReady(false);
        onAdComplete();
      }
    );
  }
}

// =====================================================
// 패턴 3: 다음 사용을 위해 광고 미리 로드
// =====================================================
function handleBackToMain() {
  setShowResult(false);
  
  // 다음 사용을 위해 광고 미리 로드
  if (!TossAdManager.isAdLoaded) {
    TossAdManager.loadAd(
      function() { setIsAdReady(true); },
      function() { setIsAdReady(false); }
    );
  }
}
```

### 4.5 광고 이벤트 타입 정리

| 이벤트 타입 | 설명 | 처리 방법 |
|------------|------|----------|
| `loaded` | 광고 로드 완료 | `isAdLoaded = true` |
| `show` | 광고 표시됨 | 로깅용 |
| `impression` | 광고 노출됨 (수익 발생) | 로깅용 |
| `clicked` | 광고 클릭됨 | 로깅용 |
| `dismissed` | 광고 닫힘 (완료) | 상태 초기화 후 `onComplete` 호출 |
| `failedToShow` | 광고 표시 실패 | `onError` 호출 |
| `userEarnedReward` | 리워드 획득 | 리워드 지급 처리 |

### 4.6 광고 연동 체크리스트

- [ ] 토스 개발자 콘솔에서 광고 그룹 ID 발급
- [ ] `AD_GROUP_ID` 변수에 실제 광고 ID 설정
- [ ] SDK 임포트 코드 추가
- [ ] 앱 시작 시 광고 미리 로드
- [ ] 광고 실패 시 fallback 처리 (콘텐츠는 표시)
- [ ] 타임아웃 처리 (광고가 오래 걸릴 경우)
- [ ] cleanup 함수 호출하여 메모리 누수 방지

---

## 5. 빌드 및 배포

### 5.1 빌드

```bash
npm run build
```

빌드 결과물은 `dist/web/` 폴더에 생성됩니다.

### 5.2 커스텀 빌드 스크립트 (필요시)

```json
{
  "scripts": {
    "build": "granite build && mkdir dist\\web\\img 2>nul & copy img\\icon.png dist\\web\\img\\icon.png"
  }
}
```

### 5.3 배포

```bash
npm run deploy
# 또는
ait deploy
```

---

## 6. 디자인 가이드 (TDS)

### 6.1 TDS 컬러 시스템

```css
:root {
  /* 라이트 모드 */
  --tds-blue: #3182F6;
  --tds-blue-hover: #1B64DA;
  
  --tds-text-primary: #191F28;
  --tds-text-secondary: #4E5968;
  --tds-text-tertiary: #8B95A1;
  
  --tds-bg-primary: #F9FAFB;
  --tds-bg-secondary: #FFFFFF;
  
  --tds-divider: #E5E8EB;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 다크 모드 */
    --tds-blue: #4A93F7;
    --tds-blue-hover: #6AA6F8;
    
    --tds-text-primary: #ECECEE;
    --tds-text-secondary: #A9ABB0;
    --tds-text-tertiary: #6B6D72;
    
    --tds-bg-primary: #17171C;
    --tds-bg-secondary: #1C1C22;
    
    --tds-divider: #2C2C34;
  }
}
```

### 6.2 TDS 버튼 스타일

```css
/* 프라이머리 버튼 */
.tds-btn-primary {
  background: var(--tds-blue);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.tds-btn-primary:hover {
  background: var(--tds-blue-hover);
}

.tds-btn-primary:active {
  transform: scale(0.98);
}

/* 세컨더리 버튼 */
.tds-btn-secondary {
  background: var(--tds-btn-secondary-bg);
  color: var(--tds-text-secondary);
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 12px;
}
```

### 6.3 TDS 카드 스타일 (글래스모피즘)

```css
.tds-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

@media (prefers-color-scheme: dark) {
  .tds-card {
    background: rgba(36, 36, 42, 0.95);
    border: 1px solid rgba(60, 60, 70, 0.5);
  }
}
```

### 6.4 권장 폰트

```html
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
```

```css
body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## 7. 트러블슈팅

### 7.1 광고가 로드되지 않음

**원인**: SDK가 토스 앱 외부에서 실행됨
**해결**: 토스 앱 내부에서만 실제 광고가 로드됨. 브라우저에서는 테스트 모드로 동작.

### 7.2 광고 ID 오류

**원인**: 잘못된 광고 그룹 ID 사용
**해결**: 토스 개발자 콘솔에서 발급받은 정확한 ID 사용 (`ait.v2.live.XXXXX` 형식)

### 7.3 광고 표시 후 앱이 멈춤

**원인**: cleanup 함수를 호출하지 않음
**해결**: `dismissed` 이벤트에서 반드시 cleanup 함수 호출

```javascript
if (self.showCleanup) {
  self.showCleanup();
  self.showCleanup = null;
}
```

### 7.4 다크 모드에서 텍스트가 안 보임

**원인**: 하드코딩된 색상 사용
**해결**: CSS 변수 사용

```css
/* 잘못된 예 */
color: #191F28;

/* 올바른 예 */
color: var(--tds-text-primary);
```

### 7.5 빌드 후 이미지가 안 보임

**원인**: 빌드 시 이미지 파일이 복사되지 않음
**해결**: 빌드 스크립트에 이미지 복사 추가 또는 외부 URL 사용

```json
{
  "scripts": {
    "build": "granite build && copy img\\icon.png dist\\web\\img\\icon.png"
  }
}
```

---

## 참고 자료

- [토스 개발자 문서](https://toss.im/developers)
- [Apps in Toss 프레임워크](https://www.npmjs.com/package/@apps-in-toss/web-framework)
- [TDS (Toss Design System)](https://toss.im/tds)

---

> **마지막 업데이트**: 2026년 2월
> **버전**: 1.0.0
> **작성**: 행운쿠키 미니앱 개발 경험 기반
