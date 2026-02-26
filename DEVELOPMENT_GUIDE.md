# 무드푸드 토스 미니앱 개발 문서

> **목적**: 개발 중 발생한 이슈, 반려사항, 수정 내역을 정리하여 향후 유사 프로젝트에서 한 번에 개발할 수 있도록 참고 자료 제공

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | 무드푸드 (MoodFood) |
| 플랫폼 | 토스 미니앱 |
| 기능 | 기분에 따른 음식 추천 |
| 수익 모델 | 토스 인앱 광고 (보상형 광고) |
| 기술 스택 | 순수 JavaScript, Vite, @apps-in-toss/web-framework |

---

## 2. 핵심 수정 사항 및 반려 이슈

### 2.1 광고 연동 관련

#### [이슈] 광고 ID 설정
```
문제: 테스트 광고 ID 사용으로 실제 광고 미노출
해결: 실제 광고 ID로 교체 필요
```

**올바른 광고 ID 설정:**
```javascript
var AD_GROUP_ID = 'ait.v2.live.a3eac9b2608e407c';
```

**광고 SDK import 방식 (index.html):**
```html
<script type="module">
  import { GoogleAdMob } from '@apps-in-toss/web-bridge';
  window.GoogleAdMob = GoogleAdMob;
</script>
```

#### [이슈] 광고 시청 없이 결과 노출
```
문제: 해금된 기분 버튼 클릭 시 광고 없이 바로 결과 표시
원인: toggleMoodSelection() 함수에서 바로 recommendByMood() 호출
해결: 모든 버튼 클릭 시 광고 시청 후 결과 표시하도록 수정
```

**수정 전 (잘못된 코드):**
```javascript
function toggleMoodSelection(moodKey) {
  // 바로 추천 (광고 없음)
  recommendByMood(moodKey);
}
```

**수정 후 (올바른 코드):**
```javascript
function toggleMoodSelection(moodKey) {
  // 광고 보고 결과 표시
  state.pendingAction = { type: 'mood', moodKey: moodKey };
  showAd();
}
```

### 2.2 광고 매니저 패턴

**필수 구현 사항:**
```javascript
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
    // 구현...
  },

  // 광고 표시
  showAd: function(adGroupId, onComplete, onError) {
    // 구현...
  }
};
```

**광고 이벤트 처리:**
| 이벤트 | 설명 | 처리 |
|--------|------|------|
| `loaded` | 광고 로드 완료 | isAdLoaded = true |
| `dismissed` | 광고 닫힘 | 결과 표시, 다음 광고 로드 |
| `userEarnedReward` | 보상형 광고 완료 | 결과 표시, 다음 광고 로드 |
| `failedToShow` | 광고 표시 실패 | 에러 처리 또는 결과 표시 |

**테스트 모드 (토스 앱 외부):**
```javascript
if (!this.isSDKAvailable()) {
  // SDK 없으면 시뮬레이션
  setTimeout(function() {
    self.isAdLoaded = true;
    if (onLoaded) onLoaded();
  }, 500);
}
```

---

## 3. 파일 구조 및 동기화

### 3.1 동일하게 유지해야 할 파일들

```
app.js              (루트) - 메인 소스
public/app.js       - 복사본 (public 폴더용)
dist/web/app.js     - 빌드 결과물
```

**중요:** 수정 시 3개 파일 모두 동일하게 수정 필요!

### 3.2 프로젝트 구조
```
moodfood-main/
├── .granite/
│   └── app.json           # 앱 이름 설정
├── app.js                  # 메인 앱 로직
├── index.html              # 메인 HTML
├── styles.css              # TDS 스타일
├── granite.config.ts       # 토스 미니앱 설정
├── vite.config.js          # Vite 빌드 설정
├── package.json            # 프로젝트 설정
├── public/
│   └── app.js              # 앱 로직 복사본
├── dist/
│   ├── web/                # 웹 빌드 결과물
│   ├── mood-food.android.js
│   └── mood-food.ios.js
└── docs/
    ├── privacy.html        # 개인정보처리방침
    └── terms.html          # 이용약관
```

---

## 4. 공유하기 기능 구현

### 4.1 공유 텍스트 형식

**올바른 구현:**
```javascript
function handleShare() {
  var foodName = dom.resultFoodName.textContent;
  var foodEmoji = dom.resultEmoji.textContent;
  var comment = dom.resultComment.textContent;
  var moodLabel = dom.resultLabel.textContent;
  
  // 공유 텍스트 구성
  var text = foodEmoji + ' 오늘의 추천 메뉴\n\n';
  text += '**' + foodName + '**\n\n';
  text += comment + '\n\n';
  
  // 기분 상태 표시
  if (moodLabel && moodLabel !== '오늘의 추천 메뉴') {
    text += moodLabel + '\n\n';
  }
  
  text += '무드푸드 메뉴 고르러 가기 \uD83D\uDC49 https://minion.toss.im/Zzzehtx3';

  if (navigator.share) {
    navigator.share({ title: '무드푸드', text: text });
  } else {
    copyToClipboard(text);
  }
}
```

### 4.2 공유 텍스트 예시

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

## 5. 설정 파일 템플릿

### 5.1 granite.config.ts
```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mood-food',
  brand: {
    displayName: '무드푸드',
    primaryColor: '#3182F6',  // 토스 블루
    icon: 'https://your-domain.com/logo.png',
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

### 5.2 package.json
```json
{
  "name": "moodfood",
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
    "vite": "^5.4.0"
  }
}
```

### 5.3 vite.config.js
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

---

## 6. 체크리스트

### 6.1 개발 전 확인사항
- [ ] 실제 광고 ID 발급 완료
- [ ] 토스 미니앱 계정 및 앱 등록
- [ ] 개인정보처리방침, 이용약관 페이지 준비
- [ ] 앱 아이콘 (512x512 PNG) 준비

### 6.2 광고 연동 확인사항
- [ ] GoogleAdMob SDK import 확인
- [ ] 광고 ID 올바르게 설정
- [ ] 광고 로드/표시 이벤트 핸들링
- [ ] 테스트 모드 폴백 구현
- [ ] 광고 실패 시 사용자 경험 처리
- [ ] **모든 버튼에서 광고 후 결과 표시**

### 6.3 기능 확인사항
- [ ] 랜덤 추천 버튼 동작
- [ ] 기분 버튼 (잠금 → 광고 → 해금 → 결과)
- [ ] 기분 버튼 (해금됨 → 광고 → 결과)
- [ ] 다시 뽑기 버튼 동작
- [ ] 공유하기 기능 (텍스트 형식 확인)
- [ ] 클립보드 복사 폴백

### 6.4 배포 전 확인사항
- [ ] app.js, public/app.js, dist/web/app.js 동기화
- [ ] 실제 광고 ID 적용
- [ ] 앱 링크 URL 확인
- [ ] 토스트/모달 메시지 검토
- [ ] 모바일 반응형 확인

---

## 7. 자주 발생하는 오류 및 해결

### 7.1 광고가 표시되지 않음
**원인:** SDK 미로드 또는 테스트 환경
**해결:** 
1. 토스 앱 내에서 테스트
2. 광고 ID 확인
3. `isSDKAvailable()` 로그 확인

### 7.2 CORS 오류 (fetch 실패)
**원인:** 외부 JSON 파일 로드 시 CORS 정책
**해결:** 데이터를 JS 파일에 직접 임베드
```javascript
var FOODS_DATA = [
  {id:1, name:"김치찌개", categories:[...], tags:[...]},
  // ...
];
```

### 7.3 이모지 깨짐
**원인:** 유니코드 이스케이프 문제
**해결:** 유니코드 이스케이프 시퀀스 사용
```javascript
// 손가락 이모지 👉
'\uD83D\uDC49'
```

### 7.4 파일 동기화 누락
**원인:** 루트 app.js만 수정하고 다른 파일 미수정
**해결:** 수정 시 항상 3개 파일 동시 수정
- `app.js`
- `public/app.js`
- `dist/web/app.js`

---

## 8. 명령어 정리

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

## 9. 연락처 및 참고 자료

- **토스 미니앱 문서**: https://toss.im/miniapp-docs
- **앱 링크**: https://minion.toss.im/Zzzehtx3
- **광고 ID**: ait.v2.live.a3eac9b2608e407c

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02-26 | 해금된 기분 버튼도 광고 시청 후 결과 표시하도록 수정 |
| 2026-02-26 | 공유하기 텍스트 형식 개선 (이모지, 메뉴명 강조, 기분상태, URL 추가) |
| 2026-02-26 | 개발 문서 작성 |
