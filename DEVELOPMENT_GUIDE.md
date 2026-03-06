# 토스 미니앱 개발 가이드 (무드푸드 기준)

> **목적**: 개발 중 발생한 이슈, 반려사항, 수정 내역을 정리하여 향후 유사 프로젝트에서 **한 번에 개발**할 수 있도록 참고 자료 제공

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **앱 이름** | 무드푸드 (MoodFood) |
| **내부 앱명** | mood-food |
| **플랫폼** | 토스 미니앱 |
| **기능** | 기분에 따른 음식 추천 |
| **수익 모델** | 토스 인앱 광고 (보상형 광고) |
| **기술 스택** | 순수 JavaScript, Vite, @apps-in-toss/web-framework |
| **버전** | 1.0.0 |

---

## 2. 핵심 반려 사항 및 필수 수정 내용

### 2.1 광고 연동 관련 (가장 중요!)

#### [반려 이슈 1] 테스트 광고 ID 사용
```
문제: 테스트 광고 ID 사용으로 실제 광고 미노출
해결: 실제 광고 ID로 교체 필수
```

**올바른 광고 ID 설정:**
```javascript
var AD_GROUP_ID = 'ait.v2.live.a3eac9b2608e407c';  // 실제 발급받은 ID 사용
```

#### [반려 이슈 2] 광고 시청 없이 결과 노출
```
문제: 해금된 기분 버튼 클릭 시 광고 없이 바로 결과 표시됨
원인: toggleMoodSelection() 함수에서 바로 recommendByMood() 호출
해결: 모든 버튼 클릭(해금된 버튼 포함) 시 광고 시청 후 결과 표시
```

**수정 전 (잘못된 코드):**
```javascript
function toggleMoodSelection(moodKey) {
  // 바로 추천 실행 (광고 없음) - 이러면 반려됨!
  recommendByMood(moodKey);
}
```

**수정 후 (올바른 코드):**
```javascript
function toggleMoodSelection(moodKey) {
  // 광고 보고 결과 표시 - 모든 버튼에서 광고 필수!
  state.pendingAction = { type: 'mood', moodKey: moodKey };
  showAd();
}
```

### 2.2 광고 노출 시점 정리

| 사용자 액션 | 광고 시청 필수 여부 | 결과 |
|------------|-------------------|------|
| "오늘 뭐먹지?" 버튼 클릭 | **필수** | 광고 후 랜덤 추천 |
| 잠긴 기분 버튼 클릭 | **필수** | 광고 후 해금 + 결과 표시 |
| **해금된 기분 버튼 클릭** | **필수** | 광고 후 결과 표시 |
| "광고 보고 다시 뽑기" 클릭 | **필수** | 광고 후 새 결과 |

> **핵심**: 결과를 보여주는 모든 경로에서 광고가 먼저 나와야 함!

---

## 3. 광고 SDK 연동 방법

### 3.1 광고 SDK import (index.html)
```html
<!-- 토스 미니앱 광고 SDK -->
<script type="module">
  import { GoogleAdMob } from '@apps-in-toss/web-bridge';
  window.GoogleAdMob = GoogleAdMob;
</script>

<script src="app.js"></script>
```

> **중요**: 광고 SDK import가 app.js보다 먼저 위치해야 함!

### 3.2 광고 매니저 구현 (필수 패턴)

```javascript
var AD_GROUP_ID = 'ait.v2.live.실제광고ID';

var TossAdManager = {
  isAdLoaded: false,
  isAdShowing: false,
  loadCleanup: null,
  showCleanup: null,

  // SDK 사용 가능 여부 확인 (토스 앱 내부인지)
  isSDKAvailable: function() {
    return typeof GoogleAdMob !== 'undefined' && 
           typeof GoogleAdMob.loadAppsInTossAdMob === 'function' &&
           typeof GoogleAdMob.showAppsInTossAdMob === 'function';
  },

  // 광고 미리 로드
  loadAd: function(adGroupId, onLoaded, onError) {
    var self = this;
    
    if (this.loadCleanup) {
      this.loadCleanup();
      this.loadCleanup = null;
    }

    if (!this.isSDKAvailable()) {
      // SDK 없으면 시뮬레이션 (개발 환경용)
      setTimeout(function() {
        self.isAdLoaded = true;
        if (onLoaded) onLoaded();
      }, 500);
      return;
    }

    var cleanup = GoogleAdMob.loadAppsInTossAdMob({
      adGroupId: adGroupId
    }, function(event) {
      if (event.type === 'loaded') {
        self.isAdLoaded = true;
        if (onLoaded) onLoaded();
      } else if (event.type === 'failedToLoad') {
        self.isAdLoaded = false;
        if (onError) onError(event);
      }
    });

    this.loadCleanup = cleanup;
  },

  // 광고 표시
  showAd: function(adGroupId, onComplete, onError) {
    var self = this;

    if (this.isAdShowing) return;

    if (!this.isAdLoaded) {
      // 광고가 아직 로드 안됐으면 로드 후 바로 표시
      this.loadAd(adGroupId, function() {
        self.showAd(adGroupId, onComplete, onError);
      }, onError);
      return;
    }

    if (!this.isSDKAvailable()) {
      // SDK 없으면 시뮬레이션
      self.isAdLoaded = false;
      setTimeout(function() {
        if (onComplete) onComplete();
        self.loadAd(adGroupId);  // 다음 광고 미리 로드
      }, 1000);
      return;
    }

    this.isAdShowing = true;
    this.isAdLoaded = false;

    var cleanup = GoogleAdMob.showAppsInTossAdMob({
      adGroupId: adGroupId
    }, function(event) {
      if (event.type === 'dismissed' || event.type === 'userEarnedReward') {
        self.isAdShowing = false;
        if (onComplete) onComplete();
        self.loadAd(adGroupId);  // 다음 광고 미리 로드
      } else if (event.type === 'failedToShow') {
        self.isAdShowing = false;
        if (onError) onError(event);
        self.loadAd(adGroupId);
      }
    });

    this.showCleanup = cleanup;
  },

  isReady: function() {
    return this.isAdLoaded && !this.isAdShowing;
  }
};
```

### 3.3 광고 이벤트 처리

| 이벤트 | 설명 | 처리 |
|--------|------|------|
| `loaded` | 광고 로드 완료 | `isAdLoaded = true` |
| `dismissed` | 광고 닫힘 | 결과 표시, 다음 광고 로드 |
| `userEarnedReward` | 보상형 광고 완료 | 결과 표시, 다음 광고 로드 |
| `failedToLoad` | 광고 로드 실패 | 에러 로깅, 재시도 가능 |
| `failedToShow` | 광고 표시 실패 | 에러 처리 또는 결과 표시 |

---

## 4. 앱 로고 및 아이콘

### 4.1 로고 파일 위치
```
moodfood-main/
├── logo.png              # 루트 로고 (512x512 PNG 권장)
├── public/
│   └── logo.png          # public 폴더 복사본
└── dist/
    └── web/
        └── logo.png      # 빌드 결과물
```

### 4.2 로고 CDN URL (granite.config.ts에서 사용)
```typescript
icon: 'https://static.toss.im/appsintoss/18177/f7692818-aecf-4a41-bf7b-c753e0c72c3a.png'
```

> **새 미니앱 개발 시**: 토스 미니앱 등록 후 발급받은 CDN URL로 교체

### 4.3 HTML 로고 참조 (index.html)
```html
<meta property="og:image" content="logo.png">
<link rel="icon" type="image/png" href="logo.png">
<link rel="apple-touch-icon" href="logo.png">
```

---

## 5. 앱 공유 링크

### 5.1 공유 URL
```
https://minion.toss.im/Zzzehtx3
```

> **새 미니앱**: 토스 미니앱 등록 후 발급받은 링크로 교체

### 5.2 공유 텍스트 형식 (필수 준수)
```javascript
function handleShare() {
  var foodName = dom.resultFoodName.textContent;
  var foodEmoji = dom.resultEmoji.textContent;
  var comment = dom.resultComment.textContent;
  var moodLabel = dom.resultLabel.textContent;
  
  var text = foodEmoji + ' 오늘의 추천 메뉴\n\n';
  text += '**' + foodName + '**\n\n';
  text += comment + '\n\n';
  
  if (moodLabel && moodLabel !== '오늘의 추천 메뉴') {
    text += moodLabel + '\n\n';
  }
  
  // 손가락 이모지는 유니코드 이스케이프로!
  text += '무드푸드 메뉴 고르러 가기 \uD83D\uDC49 https://minion.toss.im/Zzzehtx3';

  if (navigator.share) {
    navigator.share({ title: '무드푸드', text: text });
  } else {
    copyToClipboard(text);
  }
}
```

### 5.3 공유 텍스트 예시

**기분 선택 시:**
```
🍚 오늘의 추천 메뉴

**김치찌개**

스트레스 쌓였을 땐
역시 김치찌개! 먹고 확 날려버려요~

🔥 스트레스 MAX

무드푸드 메뉴 고르러 가기 👉 https://minion.toss.im/Zzzehtx3
```

**랜덤 추천 시:**
```
🍣 오늘의 추천 메뉴

**라멘**

오늘의 운명적 메뉴,
라멘! 맛있게 드세요

무드푸드 메뉴 고르러 가기 👉 https://minion.toss.im/Zzzehtx3
```

---

## 6. 파일 구조 및 동기화 (매우 중요!)

### 6.1 반드시 동기화해야 하는 파일

```
app.js              (루트) ─┐
public/app.js       (복사본) ├── 3개 파일 동일하게 유지!
dist/web/app.js     (빌드)  ─┘
```

> **수정 시 3개 파일 모두 동일하게 수정 필요!**  
> 하나만 수정하면 빌드/배포 시 불일치 발생

### 6.2 전체 프로젝트 구조

```
moodfood-main/
├── .granite/
│   └── app.json               # 앱 이름 설정 {"appName": "mood-food"}
├── app.js                      # 메인 앱 로직 (핵심!)
├── index.html                  # 메인 HTML
├── styles.css                  # TDS 스타일
├── granite.config.ts           # 토스 미니앱 설정 (로고, 색상)
├── vite.config.js              # Vite 빌드 설정
├── package.json                # 프로젝트 설정
├── logo.png                    # 앱 로고 (512x512 PNG)
├── public/
│   ├── app.js                  # 앱 로직 복사본
│   └── logo.png                # 로고 복사본
├── dist/
│   ├── web/                    # 웹 빌드 결과물
│   │   ├── index.html
│   │   ├── app.js
│   │   └── logo.png
│   ├── mood-food.android.js    # Android 번들
│   └── mood-food.ios.js        # iOS 번들
├── data/
│   └── foods.json              # 음식 데이터 (사용 안 함 - JS에 임베드)
└── docs/
    ├── privacy.html            # 개인정보처리방침
    └── terms.html              # 이용약관
```

---

## 7. 설정 파일 템플릿

### 7.1 granite.config.ts
```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mood-food',  // 내부 앱 이름 (영문, 하이픈만)
  brand: {
    displayName: '무드푸드',  // 표시 이름 (한글 가능)
    primaryColor: '#3182F6',  // 토스 블루
    icon: 'https://static.toss.im/appsintoss/XXXXX/YYYYY.png',  // CDN URL
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
```

### 7.2 package.json
```json
{
  "name": "moodfood",
  "version": "1.0.0",
  "description": "기분에 따라 오늘 먹을 음식을 추천해주는 앱",
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
    "vite": "^5.4.0"
  },
  "keywords": ["toss", "mini-app", "food", "recommendation"]
}
```

### 7.3 vite.config.js
```javascript
export default {
  root: '.',
  publicDir: 'public',
  base: './',
  build: {
    outDir: 'dist/web',
    copyPublicDir: true,
    target: ['es2015', 'chrome58', 'safari11', 'ios11'],
    rollupOptions: {
      input: 'index.html',
    },
  },
};
```

### 7.4 .granite/app.json
```json
{
  "appName": "mood-food",
  "permissions": []
}
```

---

## 8. 개발 시 주의사항 (반려 방지)

### 8.1 절대 하면 안 되는 것들

| 금지 항목 | 이유 |
|-----------|------|
| **테스트 광고 ID 사용** | 실제 광고 미노출, 반려됨 |
| **해금된 버튼에서 광고 스킵** | 수익 누락, 반려됨 |
| **외부 API 사용 (Claude, GPT 등)** | 과금 발생, 유지보수 어려움 |
| **fetch로 외부 JSON 로드** | CORS 에러 발생 |
| **직접 이모지 문자 사용** | 유니코드 깨짐 (빌드 시) |
| **브랜드명 직접 사용** | 상표권 이슈 가능 |

### 8.2 반드시 해야 하는 것들

| 필수 항목 | 방법 |
|-----------|------|
| 광고 ID 실제 ID 사용 | `ait.v2.live.XXXXXX` 형식 |
| 모든 결과에 광고 먼저 | `showAd()` 후 결과 표시 |
| 데이터 JS 임베드 | fetch 대신 변수에 직접 선언 |
| 이모지 유니코드 이스케이프 | `\uD83D\uDC49` 형식 |
| 3개 app.js 파일 동기화 | 수정 시 모두 동일하게 |

### 8.3 브랜드명 회피 예시

| 원래 이름 | 변경 후 |
|-----------|---------|
| 서브웨이 | 지하철 샌드위치 |
| 엽기떡볶이 | 엽기적인 매운 떡볶이 |
| BBQ치킨 | 바베큐 치킨 |
| 맘스터치 | 수제버거 |

---

## 9. 자주 발생하는 오류 및 해결

### 9.1 광고가 표시되지 않음
**원인:** SDK 미로드 또는 테스트 환경
**해결:**
1. 토스 앱 내에서 테스트
2. 광고 ID 확인 (`ait.v2.live.` 으로 시작하는지)
3. `isSDKAvailable()` 로그 확인

### 9.2 CORS 오류 (fetch 실패)
**원인:** 외부 JSON 파일 로드 시 CORS 정책
**해결:** 데이터를 JS 파일에 직접 임베드
```javascript
// fetch 사용 금지!
var FOODS_DATA = [
  {id:1, name:"김치찌개", categories:[...], tags:[...]},
  // ...
];
```

### 9.3 이모지 깨짐
**원인:** 유니코드 이스케이프 문제 (빌드 시 깨짐)
**해결:** 유니코드 이스케이프 시퀀스 사용
```javascript
// 직접 이모지 사용 금지!
// 👉 → '\uD83D\uDC49'
// 🔥 → '\uD83D\uDD25'
// 🍚 → '\uD83C\uDF5A'
```

### 9.4 파일 동기화 누락
**원인:** 루트 app.js만 수정하고 다른 파일 미수정
**해결:** 수정 시 항상 3개 파일 동시 수정
- `app.js`
- `public/app.js`
- `dist/web/app.js`

---

## 10. 체크리스트

### 10.1 개발 전 확인사항
- [ ] 토스 미니앱 계정 등록 완료
- [ ] 앱 등록 및 광고 ID 발급 완료
- [ ] 개인정보처리방침, 이용약관 페이지 준비
- [ ] 앱 아이콘 (512x512 PNG) 준비
- [ ] 앱 공유 링크 발급 완료

### 10.2 광고 연동 확인사항 (반려 방지 핵심!)
- [ ] GoogleAdMob SDK import 확인 (`index.html`)
- [ ] **실제 광고 ID 적용** (테스트 ID 아님!)
- [ ] 광고 로드/표시 이벤트 핸들링
- [ ] 테스트 모드 폴백 구현 (개발 환경용)
- [ ] 광고 실패 시 사용자 경험 처리
- [ ] **모든 버튼에서 광고 후 결과 표시** (해금된 버튼 포함!)

### 10.3 기능 확인사항
- [ ] 랜덤 추천 버튼 → 광고 → 결과
- [ ] 기분 버튼 (잠금) → 광고 → 해금 + 결과
- [ ] 기분 버튼 (해금됨) → 광고 → 결과
- [ ] 다시 뽑기 버튼 → 광고 → 새 결과
- [ ] 공유하기 기능 (텍스트 형식 확인)
- [ ] 클립보드 복사 폴백 (navigator.share 미지원 시)

### 10.4 배포 전 확인사항
- [ ] **app.js, public/app.js, dist/web/app.js 동기화**
- [ ] **실제 광고 ID 적용 확인**
- [ ] 앱 링크 URL 확인
- [ ] 토스트/모달 메시지 검토
- [ ] 모바일 반응형 확인
- [ ] 토스 앱 내 실제 테스트 완료

---

## 11. 명령어 정리

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 토스 미니앱 배포
npm run deploy
# 또는
ait deploy
```

---

## 12. 참고 자료 및 링크

| 항목 | 내용 |
|------|------|
| **토스 미니앱 문서** | https://toss.im/miniapp-docs |
| **무드푸드 앱 링크** | https://minion.toss.im/Zzzehtx3 |
| **무드푸드 광고 ID** | ait.v2.live.a3eac9b2608e407c |
| **무드푸드 로고 CDN** | https://static.toss.im/appsintoss/18177/f7692818-aecf-4a41-bf7b-c753e0c72c3a.png |
| **Pretendard 폰트** | https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css |
| **토스 블루 컬러** | #3182F6 |

---

## 13. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-06 | 개발 문서 최신화 (반려사항, 광고 연동, 로고 URL 등 상세 정리) |
| 2026-02-26 | 해금된 기분 버튼도 광고 시청 후 결과 표시하도록 수정 |
| 2026-02-26 | 공유하기 텍스트 형식 개선 (이모지, 메뉴명 강조, 기분상태, URL 추가) |
| 2026-02-26 | 개발 문서 작성 |

---

## 14. 무드푸드 핵심 구현 요약

### 14.1 기분 카테고리 (10종)
| ID | 한글키 | 표시명 | 이모지 |
|----|--------|--------|--------|
| stressMax | 스트레스MAX | 스트레스 MAX | 🔥 |
| refreshing | 청량한날 | 청량한 날 | ☀️ |
| sad | 우울한날 | 우울한 날 | 😢 |
| angry | 열받는날 | 열받는 날 | 😤 |
| dopamine | 도파민풀충전 | 도파민 충전 | ⚡ |
| diet | 살찐것같을때 | 살찐 것 같을 때 | 😰 |
| lazy | 귀찮은날 | 귀찮은 날 | 😴 |
| celebrate | 축하하는날 | 축하하는 날 | 🎉 |
| filling | 든든하게배채우기 | 든든하게 | 🍝 |
| adventure | 새로운도전 | 새로운 도전 | 🆕 |

### 14.2 음식 데이터 (130개)
- **한식** (22개): 김치찌개, 된장찌개, 비빔밥, 불고기, 삼겹살 등
- **중식** (14개): 짜장면, 짬뽕, 탕수육, 마라탕 등
- **일식** (13개): 초밥, 라멘, 돈카츠, 우동 등
- **양식** (14개): 스테이크, 파스타, 리조또 등
- **분식** (12개): 떡볶이, 순대, 라볶이 등
- **치킨** (10개): 후라이드, 양념, 간장, 순살 등
- **피자** (8개): 페퍼로니, 콤비네이션, 불고기 등
- **햄버거** (8개): 더블패티, 치즈버거, 치킨버거 등
- **배달음식** (14개): 족발, 보쌈, 찜닭, 곱창 등
- **카페** (15개): 아메리카노, 케이크, 빙수 등

### 14.3 추천 알고리즘
```javascript
// Claude API 사용 금지! 순수 Math.random() 사용
function getRandomFood() {
  var randomIndex = Math.floor(Math.random() * FOODS_DATA.length);
  return FOODS_DATA[randomIndex];
}

function getFoodByMood(moodKey) {
  var filtered = FOODS_DATA.filter(function(food) {
    return food.categories.includes(moodKey);
  });
  var randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
```

---

## 15. 새 미니앱 개발 시 교체해야 할 항목

| 항목 | 무드푸드 값 | 새 앱에서 교체 |
|------|-------------|---------------|
| `appName` | mood-food | 새 앱 영문명 |
| `displayName` | 무드푸드 | 새 앱 한글명 |
| `AD_GROUP_ID` | ait.v2.live.a3eac9b2608e407c | 새 광고 ID |
| `icon` URL | https://static.toss.im/appsintoss/18177/... | 새 로고 CDN URL |
| 앱 공유 링크 | https://minion.toss.im/Zzzehtx3 | 새 앱 공유 링크 |
| 공유 텍스트 | "무드푸드 메뉴 고르러 가기" | 새 앱 문구 |

---

**문서 작성일**: 2026년 3월 6일  
**마지막 업데이트**: 2026년 3월 6일
