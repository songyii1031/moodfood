# 토스 미니앱(앱인토스) 개발 완전 가이드

> 반려 사유, 심사 기준, TDS 사용법, 광고/로고/스킴 등 모든 핵심 사항 정리
> 이 문서를 읽고 미니앱을 개발하면 오류 없이 심사를 통과할 수 있습니다.

---

## 목차

1. [공식 문서 및 리소스](#1-공식-문서-및-리소스)
2. [심사 프로세스 및 반려 사유](#2-심사-프로세스-및-반려-사유)
3. [TDS (Toss Design System) 필수 가이드](#3-tds-toss-design-system-필수-가이드)
4. [앱 로고 가이드라인](#4-앱-로고-가이드라인)
5. [광고 연동 가이드](#5-광고-연동-가이드)
6. [랜딩 스킴(딥링크) 가이드](#6-랜딩-스킴딥링크-가이드)
7. [필수 구현 체크리스트](#7-필수-구현-체크리스트)
8. [기술적 제한사항](#8-기술적-제한사항)
9. [트러블슈팅](#9-트러블슈팅)
10. [심사 제출 최종 체크리스트](#10-심사-제출-최종-체크리스트)

---

## 1. 공식 문서 및 리소스

### 1.1 필수 참고 사이트

| 사이트 | URL | 용도 |
|--------|-----|------|
| **앱인토스 개발자센터** | https://developers-apps-in-toss.toss.im | 메인 개발 문서 |
| **개발자 커뮤니티** | https://techchat-apps-in-toss.toss.im | 개발 Q&A |
| **앱인토스 콘솔** | https://apps-in-toss.toss.im | 앱 등록/관리/배포 |
| **TDS React Native** | https://tossmini-docs.toss.im/tds-react-native | RN용 디자인 시스템 |
| **TDS Web (Mobile)** | https://tossmini-docs.toss.im/tds-mobile | WebView용 디자인 시스템 |

### 1.2 GitHub 리소스

| 리포지토리 | URL | 설명 |
|-----------|-----|------|
| Unity SDK | https://github.com/toss/apps-in-toss-unity-sdk | Unity 게임용 |
| 코드 예제 | https://github.com/toss/apps-in-toss-examples | 예제 코드 |
| Skills | https://github.com/toss/apps-in-toss-skills | 스킬 연동 |
| AX (MCP 서버) | https://github.com/toss/apps-in-toss-ax | AI 에이전트 |

### 1.3 문의 채널

| 유형 | 채널 |
|------|------|
| 개발 문의 | https://techchat-apps-in-toss.toss.im |
| 운영 문의 | https://apps-in-toss.channel.io/workflows/787658 |

---

## 2. 심사 프로세스 및 반려 사유

### 2.1 심사 4단계

| 단계 | 검수 항목 | 소요 시간 |
|------|----------|----------|
| 1. 서비스 검수 | 앱인토스로 출시 가능한 서비스인지 확인 | - |
| 2. 기능 검수 | 모든 기능이 정상 동작하는지 확인 | - |
| 3. 디자인 검수 | TDS 가이드 및 정책 위반 여부 | - |
| 4. 보안 검수 | 보안 취약점 여부 | - |

### 2.2 심사 소요 시간

| 검수 유형 | 소요 시간 |
|-----------|----------|
| 앱 등록 검수 | 영업일 1~2일 |
| 사업자 등록 검수 | 영업일 1일 |
| **앱 출시 검수** | **영업일 3일** |
| 푸시 메시지 검수 | 영업일 2~3일 |

### 2.3 주요 반려 사유 (다크패턴)

> **필수 회피!** 다음 사항은 100% 반려됩니다.

| # | 반려 사유 | 설명 | 해결 방법 |
|---|----------|------|----------|
| 1 | **진입 시 바텀시트** | 서비스 진입 즉시 광고성/알림동의 바텀시트 노출 | 사용자가 서비스를 충분히 이용한 후 노출 |
| 2 | **뒤로가기 방해** | Back 버튼 시 이전 화면 대신 바텀시트 노출 | 정상적인 뒤로가기 동작 구현 |
| 3 | **탈출구 없음** | 모달/바텀시트에서 나갈 수 있는 선택지 미제공 | 항상 닫기/취소 버튼 제공 |
| 4 | **예상치 못한 광고** | 사용 흐름 중 갑작스러운 전면 광고 | 예측 가능한 시점에만 광고 노출 |
| 5 | **불명확한 CTA** | 버튼만 보고 다음 행동 예측 불가 | 명확한 버튼 레이블 사용 |

### 2.4 기술적 반려 사유

| # | 반려 사유 | 설명 | 해결 방법 |
|---|----------|------|----------|
| 1 | **iframe 사용** | 앱인토스 기능 오작동, 보안 문제 | iframe 제거 (YouTube는 예외) |
| 2 | **10초 초과 로딩** | 최초 화면 로딩 10초 초과 | 로딩 최적화, 스켈레톤 UI 사용 |
| 3 | **Safe Area 침범** | iOS Dynamic Island/노치 영역 침범 | `env(safe-area-inset-*)` 적용 |
| 4 | **시스템 모달 사용** | `alert()`, `confirm()` 사용 | TDS 커스텀 모달로 교체 |
| 5 | **앱 로고 누락** | 서비스 로고/아이콘 없음 | 로고 이미지 추가 |

### 2.5 반려 시 대응 절차

1. 반려 사유 꼼꼼히 확인
2. 해당 부분만 정확히 수정
3. 수정 내역 명시하여 재심사 요청
4. **팁**: 반려 사유만 정확히 수정하면 재심사는 빠르게 통과됨

---

## 3. TDS (Toss Design System) 필수 가이드

### 3.1 TDS란?

- 토스 제품의 공통 디자인 시스템
- 수백 개의 컴포넌트와 템플릿으로 구성
- **비게임 미니앱은 TDS 필수 사용**

### 3.2 TDS 사용 시 장점

| 항목 | 설명 |
|------|------|
| 품질 보장 | 제품의 최소 품질 자동 충족 |
| 생산성 향상 | 커스텀 UI 대비 3~5배 빠른 개발 |
| 일관된 UX | 토스 앱과 통일된 사용자 경험 |
| 심사 통과율 UP | TDS 준수 시 디자인 검수 통과 용이 |

### 3.3 TDS 컬러 시스템

```css
:root {
  /* Primary */
  --tds-blue: #3182F6;            /* CTA 버튼, 주요 액션 */
  --tds-blue-hover: #1B64DA;      /* 호버 상태 */
  
  /* Text */
  --tds-text-primary: #191F28;    /* 본문 텍스트 */
  --tds-text-secondary: #4E5968;  /* 보조 텍스트 */
  --tds-text-tertiary: #8B95A1;   /* 서브 텍스트 */
  --tds-text-disabled: #B0B8C1;   /* 비활성 상태 */
  
  /* Background */
  --tds-bg-primary: #FFFFFF;      /* 기본 배경 */
  --tds-bg-secondary: #F2F4F6;    /* 섹션 구분 배경 */
  --tds-bg-tertiary: #F9FAFB;     /* 카드 배경 */
  
  /* Semantic */
  --tds-error: #F04452;           /* 에러/경고 */
  --tds-success: #00C48C;         /* 성공 */
  --tds-divider: #E5E8EB;         /* 구분선 */
  --tds-dim: rgba(0, 0, 0, 0.4);  /* 모달 배경 오버레이 */
}
```

### 3.4 TDS 폰트 시스템

```css
/* Pretendard 폰트 (필수) */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 폰트 사이즈 */
.tds-title-xl { font-size: 24px; font-weight: 700; }
.tds-title-lg { font-size: 22px; font-weight: 700; }
.tds-title-md { font-size: 18px; font-weight: 700; }
.tds-body-lg  { font-size: 16px; font-weight: 400; }
.tds-body-md  { font-size: 15px; font-weight: 400; }
.tds-body-sm  { font-size: 14px; font-weight: 400; }
.tds-caption  { font-size: 13px; font-weight: 400; }
```

### 3.5 TDS 모달 (alert/confirm 대체)

> **필수!** 시스템 `alert()`, `confirm()` 사용 금지

```css
/* 딤 오버레이 */
.tds-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 모달 카드 */
.tds-modal-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 20px 20px;
  width: calc(100% - 48px);
  max-width: 320px;
  text-align: center;
}

/* 모달 타이틀 */
.tds-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #191F28;
  margin-bottom: 8px;
}

/* 모달 본문 */
.tds-modal-body {
  font-size: 15px;
  color: #8B95A1;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* CTA 버튼 */
.tds-modal-btn-primary {
  width: 100%;
  padding: 14px 0;
  background: #3182F6;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

/* 보조 버튼 */
.tds-modal-btn-secondary {
  width: 100%;
  padding: 14px 0;
  background: #F2F4F6;
  color: #191F28;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}
```

### 3.6 TDS 토스트 (스낵바)

```css
.tds-toast {
  position: fixed;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  background: #191F28;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1100;
  animation: tds-toast-fade 2.5s ease-in-out forwards;
}

@keyframes tds-toast-fade {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}
```

### 3.7 TDS 바텀시트

```css
.tds-bottomsheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.tds-bottomsheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
  z-index: 1001;
  animation: tds-slide-up 0.3s ease-out;
}

.tds-bottomsheet-handle {
  width: 36px;
  height: 4px;
  background: #E5E8EB;
  border-radius: 2px;
  margin: 0 auto 16px;
}

@keyframes tds-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 3.8 TDS 버튼 스타일

```css
/* 프라이머리 버튼 */
.tds-btn-primary {
  background: #3182F6;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.tds-btn-primary:hover {
  background: #1B64DA;
}

.tds-btn-primary:active {
  transform: scale(0.98);
}

.tds-btn-primary:disabled {
  background: #E5E8EB;
  color: #B0B8C1;
  cursor: not-allowed;
}

/* 세컨더리 버튼 */
.tds-btn-secondary {
  background: #F2F4F6;
  color: #4E5968;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
```

### 3.9 TDS 주요 컴포넌트 목록

| 컴포넌트 | 용도 |
|---------|------|
| Button | 버튼 |
| Badge | 뱃지/태그 |
| Checkbox | 체크박스 |
| Dialog | 대화상자 |
| Dropdown | 드롭다운 |
| List/ListRow | 리스트 |
| Navbar | 내비게이션 바 |
| Tab | 탭 |
| TextField | 텍스트 입력 |
| Toast | 토스트 메시지 |
| Loader/Skeleton | 로딩 상태 |
| Switch | 스위치 |
| BottomSheet | 바텀시트 |
| BottomCTA | 하단 고정 버튼 |

### 3.10 TDS 지식재산권 주의사항

- TDS는 **토스 소유**
- **앱인토스 서비스 범위 내에서만 사용** 가능
- 외부 서비스에 TDS 무단 사용 시 **서비스 중단** 조치

---

## 4. 앱 로고 가이드라인

### 4.1 로고 필수 사양

| 항목 | 규격 | 비고 |
|------|------|------|
| **크기** | 600x600px | 정사각형 필수 |
| **형태** | 각진 정사각형 | ❌ 둥근 모서리 불가 |
| **배경** | 반드시 배경 포함 | 투명 배경 불가 |
| **색상** | 라이트/다크 모드 모두 잘 보이는 색상 | |

### 4.2 로고 적용 위치

- 전체 탭 목록
- 혜택 탭
- 푸시 알림
- 알림 센터
- 내비게이션 바
- 브릿지 화면

### 4.3 granite.config.ts 설정

```typescript
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-app-id',
  brand: {
    icon: 'https://example.com/logo-600x600.png',  // 600x600 정사각형
    displayName: '앱 이름',                          // 한글 권장
    primaryColor: '#3182F6'                          // 6자리 헥스 코드
  },
  // ...
});
```

### 4.4 브랜드 컬러 선정 기준

1. 기존 브랜드 컬러가 있으면 사용
2. 없으면 로고에서 가장 많이 사용된 색상
3. 색 대비 기준 미충족 시 자동 보정됨

### 4.5 로고 체크리스트

- [ ] 600x600px 정사각형인가?
- [ ] 각진 정사각형 형태인가? (둥근 모서리 X)
- [ ] 배경색이 포함되어 있는가? (투명 X)
- [ ] 라이트/다크 모드에서 모두 잘 보이는가?
- [ ] granite.config.ts에 icon URL이 설정되어 있는가?

---

## 5. 광고 연동 가이드

### 5.1 지원 광고 유형

| 유형 | 설명 | 권장 사용 시점 |
|------|------|--------------|
| **전면형 광고** | 화면 전체를 덮는 형태 | 화면 전환 시점 |
| **보상형 광고** | 광고 시청 시 보상 제공 | 사용자가 선택할 때 |

### 5.2 테스트 광고 ID (개발 시 필수 사용)

```javascript
// 개발/테스트 환경에서는 반드시 테스트 ID 사용
const TEST_AD_IDS = {
  interstitial: 'ait-ad-test-interstitial-id',  // 전면형
  rewarded: 'ait-ad-test-rewarded-id'           // 보상형
};
```

> **경고**: 운영 ID로 테스트 시 **제재 대상**

### 5.3 실제 광고 ID 형식

```javascript
// 실제 서비스용 (토스 개발자 콘솔에서 발급)
const LIVE_AD_ID = 'ait.v2.live.XXXXXXXXXXXXXX';
```

### 5.4 광고 SDK 임포트

```html
<script type="module">
  import { GoogleAdMob } from '@apps-in-toss/web-bridge';
  window.GoogleAdMob = GoogleAdMob;
</script>
```

### 5.5 광고 매니저 구현

```javascript
var TossAdManager = {
  isAdLoaded: false,
  isAdShowing: false,
  loadCleanup: null,
  showCleanup: null,

  // SDK 사용 가능 여부 확인
  isSDKAvailable: function() {
    return typeof GoogleAdMob !== 'undefined' && 
           typeof GoogleAdMob.loadAppsInTossAdMob === 'function' &&
           typeof GoogleAdMob.showAppsInTossAdMob === 'function';
  },

  // 광고 미리 로드
  loadAd: function(adGroupId, onLoaded, onError) {
    var self = this;
    
    if (this.isAdLoaded) {
      if (onLoaded) onLoaded();
      return;
    }

    if (this.loadCleanup) {
      this.loadCleanup();
      this.loadCleanup = null;
    }

    if (this.isSDKAvailable()) {
      try {
        this.loadCleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: { adGroupId: adGroupId },
          onEvent: function(event) {
            if (event && event.type === 'loaded') {
              self.isAdLoaded = true;
              if (onLoaded) onLoaded();
            }
          },
          onError: function(error) {
            self.isAdLoaded = false;
            if (onError) onError(error);
          }
        });
      } catch (e) {
        if (onError) onError(e);
      }
    } else {
      // 테스트 모드 (토스 앱 외부)
      setTimeout(function() {
        self.isAdLoaded = true;
        if (onLoaded) onLoaded();
      }, 500);
    }
  },

  // 광고 표시
  showAd: function(adGroupId, onComplete, onError) {
    var self = this;
    
    if (!this.isAdLoaded) {
      if (onError) onError({ message: '광고가 준비되지 않았습니다.' });
      return;
    }

    if (this.isAdShowing) return;
    this.isAdShowing = true;

    if (this.isSDKAvailable()) {
      try {
        this.showCleanup = GoogleAdMob.showAppsInTossAdMob({
          options: { adGroupId: adGroupId },
          onEvent: function(event) {
            if (event && event.type === 'dismissed') {
              self.isAdLoaded = false;
              self.isAdShowing = false;
              if (self.showCleanup) {
                self.showCleanup();
                self.showCleanup = null;
              }
              self.loadAd(adGroupId);  // 다음 광고 미리 로드
              if (onComplete) onComplete();
            }
            else if (event && event.type === 'failedToShow') {
              self.isAdLoaded = false;
              self.isAdShowing = false;
              if (self.showCleanup) {
                self.showCleanup();
                self.showCleanup = null;
              }
              if (onError) onError({ message: '광고 표시 실패' });
            }
          },
          onError: function(error) {
            self.isAdLoaded = false;
            self.isAdShowing = false;
            if (self.showCleanup) {
              self.showCleanup();
              self.showCleanup = null;
            }
            if (onError) onError(error);
          }
        });
      } catch (e) {
        self.isAdShowing = false;
        if (onError) onError(e);
      }
    } else {
      // 테스트 모드
      setTimeout(function() {
        self.isAdLoaded = false;
        self.isAdShowing = false;
        self.loadAd(adGroupId);
        if (onComplete) onComplete();
      }, 2000);
    }
  },

  isReady: function() {
    return this.isAdLoaded && !this.isAdShowing;
  }
};
```

### 5.6 광고 이벤트 타입

| 이벤트 | 설명 | 처리 |
|--------|------|------|
| `loaded` | 광고 로드 완료 | `isAdLoaded = true` |
| `show` | 광고 표시됨 | 로깅 |
| `impression` | 광고 노출됨 (수익 발생) | 로깅 |
| `clicked` | 광고 클릭됨 | 로깅 |
| `dismissed` | 광고 닫힘 | 상태 초기화, `onComplete` 호출 |
| `failedToShow` | 표시 실패 | `onError` 호출 |
| `userEarnedReward` | 리워드 획득 | 보상 지급 |

### 5.7 광고 정책 준수사항

| # | 정책 | 설명 |
|---|------|------|
| 1 | **운영 ID로 테스트 금지** | 제재 대상 |
| 2 | **사전 로딩 필수** | 재생 시점에 실시간 로딩 금지 |
| 3 | **사운드 처리** | 광고 재생 시 앱 사운드 일시정지 |
| 4 | **예측 가능한 시점** | 예상치 못한 순간에 노출 금지 |
| 5 | **과도한 노출 자제** | 사용자 경험 저해 방지 |

### 5.8 광고 수익 정산

| 항목 | 내용 |
|------|------|
| 앱인토스 수수료 | 15% (CBT 기간: 0%) |
| 정산 시기 | 익월 말 (영업일 기준) |

---

## 6. 랜딩 스킴(딥링크) 가이드

### 6.1 화면 제어 API

```typescript
// granite.config.ts에서 설정
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-app',
  // ...
});
```

### 6.2 주요 API

| API | 설명 | 사용 시점 |
|-----|------|----------|
| `setDeviceOrientation` | 가로/세로 모드 설정 | 게임 등 |
| `setIosSwipeGestureEnabled` | iOS 뒤로가기 제스처 제어 | 게임 중 비활성화 |
| `safe-area` | Safe Area 영역 제어 | 풀스크린 모드 |

### 6.3 외부 링크 정책

| 허용 | 금지 |
|------|------|
| 토스 제공 API 사용 | 자사 서비스 이동 링크 |
| | 외부 앱 설치 유도 링크 |

---

## 7. 필수 구현 체크리스트

### 7.1 접속 및 로딩

- [ ] **10초 이내 최초 화면 로딩**
- [ ] 로딩 상태 표시 (스켈레톤 UI 또는 로더)
- [ ] 네트워크 오류 시 에러 화면 표시
- [ ] 재시도 버튼 제공

### 7.2 사운드 및 진동

- [ ] 배경음/효과음/햅틱 기능 적용 (해당 시)
- [ ] 사운드 On/Off 설정 기능
- [ ] **백그라운드 전환 시 사운드 즉시 종료**
- [ ] 포그라운드 복귀 시 사운드 정상 재생
- [ ] **광고 재생 시 앱 사운드 일시정지**

### 7.3 UX 및 내비게이션

- [ ] **우측 상단 닫기 버튼 정상 동작**
- [ ] **Safe Area 영역 미침범** (Dynamic Island 포함)
- [ ] **진입 즉시 바텀시트 금지**
- [ ] **모든 화면에서 탈출 방법 제공**
- [ ] **CTA 버튼의 명확한 행동 예측**
- [ ] 뒤로가기 정상 동작

### 7.4 인터랙션

- [ ] **인터랙션 반응 2초 이내**
- [ ] 버튼 탭 시 피드백 (색상 변화/스케일)
- [ ] 종료 시 확인 모달 노출 (선택)

### 7.5 게임 전용 (해당 시)

- [ ] 유저 식별자 확인 및 저장
- [ ] 플레이 기록 유지 (랭킹, 레벨, 스테이지)
- [ ] 앱 종료 후 재접속 시 데이터 유지
- [ ] 인게임 풀스크린 구현
- [ ] 가로/세로 모드 정상 동작
- [ ] iOS 뒤로가기 제스처 비활성화

### 7.6 인앱 결제 (해당 시)

- [ ] 결제 시 배경음 일시정지
- [ ] 주문 금액 = 결제창 금액 일치
- [ ] 결제 완료 후 결과 반영
- [ ] 결제 취소/실패 처리
- [ ] 기기 변경 후 결제 데이터 유지

### 7.7 인앱 광고 (해당 시)

- [ ] 광고 시 배경음 일시정지
- [ ] **사전 로딩 완료 후 재생**
- [ ] 광고 종료 후 정상 복귀
- [ ] 리워드 광고 보상 지급
- [ ] cleanup 함수 호출

---

## 8. 기술적 제한사항

### 8.1 기술 제한

| 항목 | 제한 내용 |
|------|----------|
| **iframe** | 사용 금지 (YouTube 예외) |
| **시스템 모달** | `alert()`, `confirm()` 사용 금지 |
| **앱 번들 크기** | 압축 해제 기준 **100MB 이하** |
| **API 요청** | 기본 **분당 3,000 QPM** |
| **최초 로딩** | **10초 이내** |

### 8.2 OS 최소 요구사항

| OS | 최소 버전 |
|----|-----------|
| Android | 7 |
| iOS | 16 |

### 8.3 빌드 타겟 설정

```javascript
// vite.config.js
export default {
  build: {
    target: ['es2015', 'chrome58', 'safari11', 'ios11'],
  }
}
```

### 8.4 다크 모드

- **앱인토스는 다크 모드 미지원**
- **라이트 모드 기준으로 개발**
- 단, 로고는 라이트/다크 모두 잘 보여야 함

### 8.5 API 요청 상향

- 분당 3,000 QPM 초과 필요 시
- 채널톡으로 요청

---

## 9. 트러블슈팅

### 9.1 광고 로드 실패

| 원인 | 해결 |
|------|------|
| 토스 앱 외부 실행 | 토스 앱 내부에서만 실제 광고 로드됨 |
| 잘못된 광고 ID | `ait.v2.live.XXXXX` 형식 확인 |
| 테스트 중 운영 ID 사용 | 테스트 ID 사용 |

### 9.2 광고 표시 후 앱 멈춤

| 원인 | 해결 |
|------|------|
| cleanup 미호출 | `dismissed` 이벤트에서 cleanup 호출 |

```javascript
if (self.showCleanup) {
  self.showCleanup();
  self.showCleanup = null;
}
```

### 9.3 시스템 모달 반려

| 원인 | 해결 |
|------|------|
| `alert()` 사용 | TDS 커스텀 모달로 교체 |

```bash
# 코드에서 시스템 모달 검색
grep -rn "alert\|confirm\|prompt" src/
```

### 9.4 Safe Area 침범

| 원인 | 해결 |
|------|------|
| 고정 높이/여백 | CSS 환경 변수 사용 |

```css
/* Safe Area 적용 */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### 9.5 이미지 로드 실패

| 원인 | 해결 |
|------|------|
| 빌드 시 복사 안 됨 | 빌드 스크립트에 복사 추가 |
| 경로 오류 | 절대 경로 또는 CDN URL 사용 |

```json
{
  "scripts": {
    "build": "granite build && copy img\\*.png dist\\web\\img\\"
  }
}
```

### 9.6 10초 초과 로딩

| 원인 | 해결 |
|------|------|
| 대용량 리소스 | 이미지 최적화, 코드 스플리팅 |
| API 지연 | 스켈레톤 UI 먼저 표시 |

---

## 10. 심사 제출 최종 체크리스트

### 10.1 기본 항목

- [ ] **앱 이름** 심사 요청서와 앱 내부 동일
- [ ] **앱 로고** 600x600px 정사각형, 배경 포함
- [ ] **서비스 설명** 정확하게 작성
- [ ] **개인정보처리방침** URL 등록
- [ ] **이용약관** URL 등록

### 10.2 UI/UX 항목

- [ ] `alert()`, `confirm()` **사용 안 함**
- [ ] 모든 모달 **TDS 스타일** 적용
- [ ] **TDS 컬러/폰트** 준수
- [ ] **border-radius** 일관성 (모달 16px, 버튼 12px, 토스트 12px)
- [ ] **Safe Area** 적용

### 10.3 기능 항목

- [ ] **10초 이내** 최초 화면 로딩
- [ ] **에러 상태** 처리
- [ ] **로딩 상태** 표시
- [ ] **닫기 버튼** 정상 동작
- [ ] **뒤로가기** 정상 동작

### 10.4 호환성 항목

- [ ] **iOS Safari 웹뷰** 정상 동작
- [ ] **Android Chrome 웹뷰** 정상 동작
- [ ] 가로/세로 모드 레이아웃 정상

### 10.5 광고 항목 (해당 시)

- [ ] **테스트 ID로 개발** (운영 ID 테스트 금지)
- [ ] **사전 로딩** 후 표시
- [ ] **cleanup 함수** 호출
- [ ] 광고 중 **사운드 일시정지**

### 10.6 코드 최종 점검

```bash
# 시스템 모달 검색 (0건이어야 함)
grep -rn "alert(\|confirm(\|prompt(" src/

# 콘솔 로그 검색 (제거 권장)
grep -rn "console.log" src/
```

- [ ] 시스템 모달 사용 **0건**
- [ ] 디버깅 코드 제거
- [ ] 불필요한 주석 제거

---

## 개발 기간 예상

| 유형 | 예상 기간 |
|------|----------|
| 게임 | 약 2~4주 |
| 비게임 서비스 | 약 1~3개월 |

---

## 빠른 참조: 핵심 수치

| 항목 | 수치 |
|------|------|
| 로고 크기 | 600x600px |
| 최초 로딩 | 10초 이내 |
| 인터랙션 반응 | 2초 이내 |
| 앱 번들 | 100MB 이하 |
| API 요청 | 3,000 QPM |
| 모달 border-radius | 16px |
| 버튼 border-radius | 12px |
| 토스트 border-radius | 12px |
| 바텀시트 border-radius | 24px (상단) |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02-26 | 최초 작성 - 종합 가이드 완성 |

---

> **이 문서는 토스 미니앱(앱인토스) 개발의 모든 핵심 사항을 담고 있습니다.**
> **새로운 미니앱 개발 시 이 문서를 참고하면 심사 통과율을 높일 수 있습니다.**
