/* ============================================
   무드푸드 - Main Application
   순수 JavaScript (Claude API 사용 금지)
   Math.random() 기반 랜덤 추천
   ============================================ */

(function () {
  'use strict';

  // ─── 기분 카테고리 정의 ───
  var MOOD_CATEGORIES = [
    { id: 'stressMax',    key: '스트레스MAX',     name: '스트레스 MAX',             emoji: '\uD83D\uDD25', short: '스트레스 풀 음식' },
    { id: 'refreshing',   key: '청량한날',         name: '청량한 날',                emoji: '\u2600\uFE0F', short: '상쾌한 음식' },
    { id: 'sad',          key: '우울한날',         name: '우울한 날',                emoji: '\uD83D\uDE22', short: '위로가 되는 음식' },
    { id: 'angry',        key: '열받는날',         name: '열받는 날',                emoji: '\uD83D\uDE24', short: '매운 음식으로 해소' },
    { id: 'dopamine',     key: '도파민풀충전',     name: '도파민 충전',              emoji: '\u26A1',       short: '달콤하고 자극적인' },
    { id: 'diet',         key: '살찐것같을때',     name: '살찐 것 같을 때',          emoji: '\uD83D\uDE30', short: '가볍고 건강한' },
    { id: 'lazy',         key: '귀찮은날',         name: '귀찮은 날',                emoji: '\uD83D\uDE34', short: '간편하게 시켜먹자' },
    { id: 'celebrate',    key: '축하하는날',       name: '축하하는 날',              emoji: '\uD83C\uDF89', short: '특별한 한 끼' },
    { id: 'filling',      key: '든든하게배채우기', name: '든든하게',                 emoji: '\uD83C\uDF5D', short: '배 꽉 차게' },
    { id: 'adventure',    key: '새로운도전',       name: '새로운 도전',              emoji: '\uD83C\uDD95', short: '색다른 메뉴에 도전' }
  ];

  // ─── 음식 이모지 매핑 ───
  var FOOD_EMOJIS = {
    '한식': '\uD83C\uDF5A',       // 🍚 밥
    '중식': '\uD83E\uDD62',       // 🥢 젓가락
    '일식': '\uD83C\uDF63',       // 🍣 초밥
    '양식': '\uD83C\uDF5D',       // 🍝 파스타
    '분식': '\uD83C\uDF62',       // 🍢 꼬치
    '치킨': '\uD83C\uDF57',       // 🍗 치킨
    '피자': '\uD83C\uDF55',       // 🍕 피자
    '햄버거': '\uD83C\uDF54',     // 🍔 햄버거
    '배달음식': '\uD83C\uDF72',   // 🍲 냄비요리
    '카페': '\u2615',              // ☕ 커피
    'default': '\uD83C\uDF74'     // 🍴 포크나이프
  };

  // ─── 음식 데이터 (JS 직접 임베드 - fetch CORS 문제 해결) ───
  // 구글링 기반 한국 인기 음식 메뉴 120+ 수집 (2025 배달앱 인기 순위 반영)
  // 브랜드명 회피: 엽기떡볶이→엽기적인 매운 떡볶이, 서브웨이→지하철 샌드위치 등
  // Claude API 사용 금지! 순수 Math.random() 랜덤 선택만 사용
  var FOODS_DATA = [
    // ── 한식 (17개) ──
    {id:1,name:"김치찌개",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["한식","매운맛"]},
    {id:2,name:"된장찌개",categories:["우울한날","든든하게배채우기","귀찮은날"],tags:["한식","담백한맛"]},
    {id:3,name:"비빔밥",categories:["살찐것같을때","청량한날","든든하게배채우기"],tags:["한식","담백한맛"]},
    {id:4,name:"불고기",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["한식","달콤한맛"]},
    {id:5,name:"삼겹살",categories:["스트레스MAX","축하하는날","든든하게배채우기"],tags:["한식","고소한맛"]},
    {id:6,name:"김밥",categories:["귀찮은날","청량한날","든든하게배채우기"],tags:["한식","담백한맛"]},
    {id:7,name:"순두부찌개",categories:["우울한날","스트레스MAX","든든하게배채우기"],tags:["한식","매운맛"]},
    {id:8,name:"삼계탕",categories:["우울한날","든든하게배채우기","청량한날"],tags:["한식","담백한맛"]},
    {id:9,name:"갈비찜",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["한식","달콤한맛"]},
    {id:10,name:"냉면",categories:["청량한날","살찐것같을때","새로운도전"],tags:["한식","시원한맛"]},
    {id:11,name:"부대찌개",categories:["스트레스MAX","든든하게배채우기","귀찮은날"],tags:["한식","매운맛"]},
    {id:12,name:"잡채",categories:["축하하는날","살찐것같을때","든든하게배채우기"],tags:["한식","달콤한맛"]},
    {id:13,name:"해물파전",categories:["우울한날","축하하는날","도파민풀충전"],tags:["한식","고소한맛"]},
    {id:14,name:"제육볶음",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["한식","매운맛"]},
    {id:15,name:"김치볶음밥",categories:["귀찮은날","스트레스MAX","든든하게배채우기"],tags:["한식","매운맛"]},
    {id:16,name:"떡갈비",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["한식","달콤한맛"]},
    {id:17,name:"육개장",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["한식","매운맛"]},
    {id:18,name:"돼지국밥",categories:["든든하게배채우기","우울한날","귀찮은날"],tags:["한식","담백한맛"]},
    {id:19,name:"순대국밥",categories:["든든하게배채우기","우울한날","귀찮은날"],tags:["한식","담백한맛"]},
    {id:20,name:"콩나물국밥",categories:["살찐것같을때","우울한날","청량한날"],tags:["한식","담백한맛"]},
    {id:21,name:"갈비탕",categories:["축하하는날","든든하게배채우기","우울한날"],tags:["한식","담백한맛"]},
    {id:22,name:"쌈밥",categories:["살찐것같을때","청량한날","든든하게배채우기"],tags:["한식","담백한맛"]},

    // ── 중식 (13개) ──
    {id:23,name:"짜장면",categories:["귀찮은날","우울한날","든든하게배채우기"],tags:["중식","달콤한맛"]},
    {id:24,name:"짬뽕",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["중식","매운맛"]},
    {id:25,name:"탕수육",categories:["도파민풀충전","축하하는날","귀찮은날"],tags:["중식","달콤한맛"]},
    {id:26,name:"마라탕",categories:["스트레스MAX","열받는날","새로운도전"],tags:["중식","매운맛"]},
    {id:27,name:"깐풍기",categories:["도파민풀충전","스트레스MAX","든든하게배채우기"],tags:["중식","매운맛"]},
    {id:28,name:"볶음밥",categories:["귀찮은날","든든하게배채우기","우울한날"],tags:["중식","고소한맛"]},
    {id:29,name:"양장피",categories:["청량한날","축하하는날","새로운도전"],tags:["중식","시원한맛"]},
    {id:30,name:"유산슬",categories:["축하하는날","든든하게배채우기","청량한날"],tags:["중식","담백한맛"]},
    {id:31,name:"마파두부",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["중식","매운맛"]},
    {id:32,name:"군만두",categories:["도파민풀충전","귀찮은날","축하하는날"],tags:["중식","고소한맛"]},
    {id:33,name:"꿔바로우",categories:["도파민풀충전","스트레스MAX","축하하는날"],tags:["중식","달콤한맛"]},
    {id:34,name:"동파육",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["중식","달콤한맛"]},
    {id:35,name:"울면",categories:["든든하게배채우기","청량한날","새로운도전"],tags:["중식","담백한맛"]},
    {id:36,name:"마라샹궈",categories:["스트레스MAX","열받는날","새로운도전"],tags:["중식","매운맛"]},

    // ── 일식 (13개) ──
    {id:37,name:"초밥",categories:["청량한날","축하하는날","새로운도전"],tags:["일식","담백한맛"]},
    {id:38,name:"라멘",categories:["우울한날","든든하게배채우기","귀찮은날"],tags:["일식","고소한맛"]},
    {id:39,name:"돈카츠",categories:["도파민풀충전","든든하게배채우기","귀찮은날"],tags:["일식","고소한맛"]},
    {id:40,name:"우동",categories:["우울한날","청량한날","든든하게배채우기"],tags:["일식","담백한맛"]},
    {id:41,name:"회덮밥",categories:["청량한날","살찐것같을때","축하하는날"],tags:["일식","시원한맛"]},
    {id:42,name:"규동",categories:["귀찮은날","든든하게배채우기","우울한날"],tags:["일식","달콤한맛"]},
    {id:43,name:"타코야키",categories:["도파민풀충전","귀찮은날","새로운도전"],tags:["일식","고소한맛"]},
    {id:44,name:"텐동",categories:["든든하게배채우기","도파민풀충전","귀찮은날"],tags:["일식","고소한맛"]},
    {id:45,name:"소바",categories:["청량한날","살찐것같을때","새로운도전"],tags:["일식","시원한맛"]},
    {id:46,name:"나베",categories:["우울한날","축하하는날","든든하게배채우기"],tags:["일식","담백한맛"]},
    {id:47,name:"가츠동",categories:["든든하게배채우기","도파민풀충전","귀찮은날"],tags:["일식","고소한맛"]},
    {id:48,name:"사시미",categories:["청량한날","축하하는날","살찐것같을때"],tags:["일식","담백한맛"]},
    {id:49,name:"장어덮밥",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["일식","고소한맛"]},

    // ── 양식 (14개) ──
    {id:50,name:"스테이크",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["양식","고소한맛"]},
    {id:51,name:"크림파스타",categories:["도파민풀충전","우울한날","든든하게배채우기"],tags:["양식","고소한맛"]},
    {id:52,name:"토마토파스타",categories:["청량한날","살찐것같을때","든든하게배채우기"],tags:["양식","담백한맛"]},
    {id:53,name:"알리오올리오",categories:["청량한날","살찐것같을때","귀찮은날"],tags:["양식","고소한맛"]},
    {id:54,name:"리조또",categories:["축하하는날","든든하게배채우기","새로운도전"],tags:["양식","고소한맛"]},
    {id:55,name:"그라탕",categories:["우울한날","도파민풀충전","든든하게배채우기"],tags:["양식","고소한맛"]},
    {id:56,name:"오믈렛",categories:["청량한날","귀찮은날","살찐것같을때"],tags:["양식","고소한맛"]},
    {id:57,name:"수프",categories:["우울한날","살찐것같을때","청량한날"],tags:["양식","담백한맛"]},
    {id:58,name:"폭립",categories:["스트레스MAX","도파민풀충전","든든하게배채우기"],tags:["양식","고소한맛"]},
    {id:59,name:"샐러드",categories:["살찐것같을때","청량한날","새로운도전"],tags:["양식","담백한맛"]},
    {id:60,name:"치킨샐러드",categories:["살찐것같을때","청량한날","든든하게배채우기"],tags:["양식","담백한맛"]},
    {id:61,name:"샌드위치",categories:["귀찮은날","청량한날","살찐것같을때"],tags:["양식","담백한맛"]},
    {id:62,name:"필라프",categories:["귀찮은날","든든하게배채우기","새로운도전"],tags:["양식","고소한맛"]},
    {id:63,name:"카레라이스",categories:["귀찮은날","든든하게배채우기","새로운도전"],tags:["양식","고소한맛"]},

    // ── 분식 (12개) ──
    {id:64,name:"떡볶이",categories:["스트레스MAX","열받는날","도파민풀충전"],tags:["분식","매운맛"]},
    {id:65,name:"순대",categories:["귀찮은날","도파민풀충전","든든하게배채우기"],tags:["분식","고소한맛"]},
    {id:66,name:"모듬튀김",categories:["도파민풀충전","귀찮은날","스트레스MAX"],tags:["분식","고소한맛"]},
    {id:67,name:"라볶이",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["분식","매운맛"]},
    {id:68,name:"어묵",categories:["우울한날","귀찮은날","청량한날"],tags:["분식","담백한맛"]},
    {id:69,name:"떡꼬치",categories:["도파민풀충전","귀찮은날","스트레스MAX"],tags:["분식","달콤한맛"]},
    {id:70,name:"핫도그",categories:["귀찮은날","도파민풀충전","든든하게배채우기"],tags:["분식","고소한맛"]},
    {id:71,name:"토스트",categories:["귀찮은날","청량한날","살찐것같을때"],tags:["분식","고소한맛"]},
    {id:72,name:"쫄면",categories:["청량한날","스트레스MAX","살찐것같을때"],tags:["분식","매운맛"]},
    {id:73,name:"엽기적인 매운 떡볶이",categories:["스트레스MAX","열받는날","도파민풀충전"],tags:["분식","매운맛"]},
    {id:74,name:"로제떡볶이",categories:["도파민풀충전","새로운도전","축하하는날"],tags:["분식","고소한맛"]},
    {id:75,name:"치즈김밥",categories:["귀찮은날","도파민풀충전","든든하게배채우기"],tags:["분식","고소한맛"]},

    // ── 치킨 (10개) ──
    {id:76,name:"후라이드치킨",categories:["스트레스MAX","도파민풀충전","축하하는날"],tags:["치킨","고소한맛"]},
    {id:77,name:"양념치킨",categories:["도파민풀충전","스트레스MAX","축하하는날"],tags:["치킨","달콤한맛"]},
    {id:78,name:"간장치킨",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["치킨","달콤한맛"]},
    {id:79,name:"순살치킨",categories:["귀찮은날","도파민풀충전","스트레스MAX"],tags:["치킨","고소한맛"]},
    {id:80,name:"파닭",categories:["청량한날","스트레스MAX","새로운도전"],tags:["치킨","담백한맛"]},
    {id:81,name:"마늘치킨",categories:["도파민풀충전","스트레스MAX","든든하게배채우기"],tags:["치킨","고소한맛"]},
    {id:82,name:"반반치킨",categories:["귀찮은날","도파민풀충전","축하하는날"],tags:["치킨","고소한맛"]},
    {id:83,name:"허니 순살치킨",categories:["도파민풀충전","축하하는날","우울한날"],tags:["치킨","달콤한맛"]},
    {id:84,name:"치즈파우더 치킨",categories:["도파민풀충전","새로운도전","축하하는날"],tags:["치킨","고소한맛"]},
    {id:85,name:"올리브오일 치킨",categories:["새로운도전","축하하는날","도파민풀충전"],tags:["치킨","담백한맛"]},

    // ── 피자 (8개) ──
    {id:86,name:"페퍼로니피자",categories:["도파민풀충전","귀찮은날","든든하게배채우기"],tags:["피자","고소한맛"]},
    {id:87,name:"콤비네이션피자",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["피자","고소한맛"]},
    {id:88,name:"불고기피자",categories:["든든하게배채우기","도파민풀충전","귀찮은날"],tags:["피자","달콤한맛"]},
    {id:89,name:"고구마피자",categories:["도파민풀충전","우울한날","귀찮은날"],tags:["피자","달콤한맛"]},
    {id:90,name:"포테이토피자",categories:["든든하게배채우기","귀찮은날","도파민풀충전"],tags:["피자","고소한맛"]},
    {id:91,name:"슈퍼슈프림피자",categories:["축하하는날","든든하게배채우기","도파민풀충전"],tags:["피자","고소한맛"]},
    {id:92,name:"하와이안피자",categories:["청량한날","새로운도전","도파민풀충전"],tags:["피자","달콤한맛"]},
    {id:93,name:"시카고딥디쉬피자",categories:["든든하게배채우기","새로운도전","축하하는날"],tags:["피자","고소한맛"]},

    // ── 햄버거 (8개) ──
    {id:94,name:"더블패티 버거",categories:["든든하게배채우기","도파민풀충전","스트레스MAX"],tags:["햄버거","고소한맛"]},
    {id:95,name:"치즈버거",categories:["귀찮은날","도파민풀충전","든든하게배채우기"],tags:["햄버거","고소한맛"]},
    {id:96,name:"새우버거",categories:["청량한날","귀찮은날","새로운도전"],tags:["햄버거","담백한맛"]},
    {id:97,name:"불고기버거",categories:["귀찮은날","든든하게배채우기","도파민풀충전"],tags:["햄버거","달콤한맛"]},
    {id:98,name:"치킨버거",categories:["귀찮은날","도파민풀충전","든든하게배채우기"],tags:["햄버거","고소한맛"]},
    {id:99,name:"베이컨버거",categories:["스트레스MAX","도파민풀충전","든든하게배채우기"],tags:["햄버거","고소한맛"]},
    {id:100,name:"수제버거",categories:["축하하는날","새로운도전","든든하게배채우기"],tags:["햄버거","고소한맛"]},
    {id:101,name:"지하철 샌드위치",categories:["살찐것같을때","청량한날","귀찮은날"],tags:["햄버거","담백한맛"]},

    // ── 배달음식 (14개) - 2025 배달앱 인기순위 반영 ──
    {id:102,name:"족발",categories:["스트레스MAX","축하하는날","든든하게배채우기"],tags:["배달음식","고소한맛"]},
    {id:103,name:"보쌈",categories:["축하하는날","든든하게배채우기","스트레스MAX"],tags:["배달음식","담백한맛"]},
    {id:104,name:"찜닭",categories:["도파민풀충전","든든하게배채우기","열받는날"],tags:["배달음식","매운맛"]},
    {id:105,name:"곱창",categories:["스트레스MAX","축하하는날","도파민풀충전"],tags:["배달음식","고소한맛"]},
    {id:106,name:"막창",categories:["스트레스MAX","축하하는날","든든하게배채우기"],tags:["배달음식","고소한맛"]},
    {id:107,name:"양념갈비",categories:["축하하는날","도파민풀충전","든든하게배채우기"],tags:["배달음식","달콤한맛"]},
    {id:108,name:"양꼬치",categories:["새로운도전","스트레스MAX","축하하는날"],tags:["배달음식","매운맛"]},
    {id:109,name:"훠궈",categories:["새로운도전","스트레스MAX","축하하는날"],tags:["배달음식","매운맛"]},
    {id:110,name:"쭈꾸미",categories:["스트레스MAX","열받는날","도파민풀충전"],tags:["배달음식","매운맛"]},
    {id:111,name:"낙지볶음",categories:["스트레스MAX","열받는날","든든하게배채우기"],tags:["배달음식","매운맛"]},
    {id:112,name:"감자탕",categories:["우울한날","든든하게배채우기","귀찮은날"],tags:["배달음식","담백한맛"]},
    {id:113,name:"닭발",categories:["스트레스MAX","열받는날","새로운도전"],tags:["배달음식","매운맛"]},
    {id:114,name:"도시락",categories:["귀찮은날","살찐것같을때","든든하게배채우기"],tags:["배달음식","담백한맛"]},
    {id:115,name:"닭가슴살 샐러드",categories:["살찐것같을때","청량한날","든든하게배채우기"],tags:["배달음식","담백한맛"]},

    // ── 카페/디저트 (15개) ──
    {id:116,name:"아메리카노",categories:["귀찮은날","청량한날","살찐것같을때"],tags:["카페","담백한맛"]},
    {id:117,name:"카페라떼",categories:["우울한날","귀찮은날","청량한날"],tags:["카페","고소한맛"]},
    {id:118,name:"딸기케이크",categories:["도파민풀충전","축하하는날","우울한날"],tags:["카페","달콤한맛"]},
    {id:119,name:"팥빙수",categories:["청량한날","도파민풀충전","살찐것같을때"],tags:["카페","달콤한맛"]},
    {id:120,name:"와플",categories:["도파민풀충전","귀찮은날","우울한날"],tags:["카페","달콤한맛"]},
    {id:121,name:"마카롱",categories:["도파민풀충전","축하하는날","새로운도전"],tags:["카페","달콤한맛"]},
    {id:122,name:"타르트",categories:["축하하는날","도파민풀충전","청량한날"],tags:["카페","달콤한맛"]},
    {id:123,name:"브라우니",categories:["우울한날","도파민풀충전","스트레스MAX"],tags:["카페","달콤한맛"]},
    {id:124,name:"티라미수",categories:["축하하는날","도파민풀충전","새로운도전"],tags:["카페","달콤한맛"]},
    {id:125,name:"젤라또",categories:["청량한날","도파민풀충전","새로운도전"],tags:["카페","달콤한맛"]},
    {id:126,name:"크로플",categories:["도파민풀충전","귀찮은날","새로운도전"],tags:["카페","달콤한맛"]},
    {id:127,name:"츄러스",categories:["도파민풀충전","귀찮은날","우울한날"],tags:["카페","달콤한맛"]},
    {id:128,name:"아이스티",categories:["청량한날","살찐것같을때","귀찮은날"],tags:["카페","시원한맛"]},
    {id:129,name:"스무디",categories:["청량한날","살찐것같을때","도파민풀충전"],tags:["카페","달콤한맛"]},
    {id:130,name:"버블티",categories:["도파민풀충전","새로운도전","청량한날"],tags:["카페","달콤한맛"]}
  ];

  // ─── 기분별 추천 멘트 ───
  // {food} 는 음식 이름으로 치환됨
  var MOOD_COMMENTS = {
    '스트레스MAX':     '스트레스 쌓였을 땐\n역시 {food}! 먹고 확 날려버려요~',
    '청량한날':        '청량한 오늘,\n{food} 어때요? 기분까지 상쾌!',
    '우울한날':        '우울할 땐 {food} 한 입!\n맛있는 게 최고의 위로예요',
    '열받는날':        '열받는 날엔\n{food}로 화끈하게 풀어버려요!',
    '도파민풀충전':    '도파민 충전!\n{food} 먹고 행복 게이지 MAX',
    '살찐것같을때':    '가볍게 {food} 어때요?\n맛도 챙기고 칼로리도 챙기고!',
    '귀찮은날':        '귀찮은 날엔 {food}이 딱!\n최소 노력, 최대 만족',
    '축하하는날':      '축하하는 날엔\n{food}로 특별하게! 맘껏 즐겨요',
    '든든하게배채우기': '배고플 땐 {food}!\n배부르면 세상이 아름다워요',
    '새로운도전':      '오늘은 {food}에 도전!\n새로운 맛이 기다리고 있어요'
  };

  var RANDOM_COMMENTS = [
    '오늘의 운명적 메뉴,\n{food}! 맛있게 드세요',
    '고민 끝!\n오늘은 {food} 어때요?',
    '{food} 땡기지 않나요?\n지금 바로 GO!',
    '메뉴 고민은 그만~\n오늘은 {food}입니다!',
    '두구두구...\n오늘의 메뉴는 {food}!'
  ];

  // ─── 앱 상태 ───
  var state = {
    foods: FOODS_DATA,
    unlockedMoods: {},
    selectedMood: null,
    pendingAction: null,      // { type: 'random' | 'mood', moodKey?: string }
    isAdShowing: false
  };

  // ─── DOM 참조 ───
  var dom = {};

  // ─── 초기화 ───
  function init() {
    cacheDom();
    bindEvents();
    renderMoodButtons();
  }

  function cacheDom() {
    dom.moodGrid = document.getElementById('moodGrid');
    dom.btnRandomAll = document.getElementById('btnRandomAll');
    dom.resultScreen = document.getElementById('resultScreen');
    dom.resultCloseBtn = document.getElementById('resultCloseBtn');
    dom.resultContent = document.getElementById('resultContent');
    dom.resultLabel = document.getElementById('resultLabel');
    dom.resultEmoji = document.getElementById('resultEmoji');
    dom.resultFoodName = document.getElementById('resultFoodName');
    dom.resultComment = document.getElementById('resultComment');
    dom.resultTags = document.getElementById('resultTags');
    dom.btnRetry = document.getElementById('btnRetry');
    dom.btnShare = document.getElementById('btnShare');
    dom.modalOverlay = document.getElementById('modalOverlay');
    dom.modalTitle = document.getElementById('modalTitle');
    dom.modalBody = document.getElementById('modalBody');
    dom.modalFooter = document.getElementById('modalFooter');
    dom.toastContainer = document.getElementById('toastContainer');
  }

  function bindEvents() {
    dom.btnRandomAll.addEventListener('click', handleRandomAll);
    dom.resultCloseBtn.addEventListener('click', hideResult);
    dom.btnRetry.addEventListener('click', handleRetry);
    dom.btnShare.addEventListener('click', handleShare);
    dom.modalOverlay.addEventListener('click', function (e) {
      if (e.target === dom.modalOverlay) hideModal();
    });
  }

  // ─── 기분 버튼 렌더링 ───
  function renderMoodButtons() {
    var html = '';
    for (var i = 0; i < MOOD_CATEGORIES.length; i++) {
      var mood = MOOD_CATEGORIES[i];
      html += createMoodButtonHTML(mood);
    }
    dom.moodGrid.innerHTML = html;

    // 이벤트 바인딩
    var buttons = dom.moodGrid.querySelectorAll('.mood-btn');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', handleMoodClick);
    }
  }

  function createMoodButtonHTML(mood) {
    var lockIcon = '<svg viewBox="0 0 24 24"><path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm3 10H9V7c0-1.66 1.34-3 3-3s3 1.34 3 3v3z"/></svg>';
    return '<button class="mood-btn mood-btn--locked" data-mood-key="' + mood.key + '" type="button">' +
           '  <span class="mood-btn-emoji">' + mood.emoji + '</span>' +
           '  <span class="mood-btn-text">' + mood.short + '</span>' +
           '  <span class="mood-btn-lock">' + lockIcon + '</span>' +
           '</button>';
  }

  function updateMoodButton(moodKey, isSelected) {
    var btn = dom.moodGrid.querySelector('[data-mood-key="' + moodKey + '"]');
    if (!btn) return;

    btn.classList.remove('mood-btn--locked', 'mood-btn--unlocked', 'mood-btn--selected');

    if (isSelected) {
      btn.classList.add('mood-btn--selected');
    } else if (state.unlockedMoods[moodKey]) {
      btn.classList.add('mood-btn--unlocked');
    } else {
      btn.classList.add('mood-btn--locked');
    }
  }

  // ─── 이벤트 핸들러 ───
  function handleRandomAll() {
    if (state.foods.length === 0) {
      showToast('음식 데이터를 불러오는 중이에요...');
      return;
    }
    state.pendingAction = { type: 'random' };
    showAd();
  }

  function handleMoodClick(e) {
    var btn = e.currentTarget;
    var moodKey = btn.getAttribute('data-mood-key');

    if (state.foods.length === 0) {
      showToast('음식 데이터를 불러오는 중이에요...');
      return;
    }

    if (state.unlockedMoods[moodKey]) {
      // 이미 해금된 기분 → 선택 토글
      toggleMoodSelection(moodKey);
      return;
    }

    // 잠긴 기분 → 광고 시청 후 해금
    state.pendingAction = { type: 'mood', moodKey: moodKey };
    showAd();
  }

  function toggleMoodSelection(moodKey) {
    // 기존 선택 해제
    if (state.selectedMood && state.selectedMood !== moodKey) {
      updateMoodButton(state.selectedMood, false);
    }

    // 항상 선택 상태로 유지하고 바로 결과 표시
    state.selectedMood = moodKey;
    updateMoodButton(moodKey, true);
    // 선택 후 바로 추천
    recommendByMood(moodKey);
  }

  function handleRetry() {
    // 다시 뽑기: 광고 → 새 결과 (애니메이션으로 갱신 체감)
    var retryMood = state.selectedMood;
    var action = retryMood
      ? { type: 'mood', moodKey: retryMood }
      : { type: 'random' };

    // 결과 화면을 먼저 닫고 광고 호출
    hideResult();
    state.pendingAction = action;
    showAd();
  }

  function handleShare() {
    var foodName = dom.resultFoodName.textContent;
    var text = '오늘의 추천 메뉴: ' + foodName + ' \uD83C\uDF7D\uFE0F\n무드푸드에서 추천받았어요!';

    if (navigator.share) {
      navigator.share({
        title: '무드푸드',
        text: text
      }).catch(function () {
        // 공유 취소 - 무시
      });
    } else {
      copyToClipboard(text);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('\u2705 클립보드에 복사했어요');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('\u2705 클립보드에 복사했어요');
    } catch (err) {
      showToast('복사에 실패했어요');
    }
    document.body.removeChild(textarea);
  }

  // ─── 광고 시스템 ───
  // 전면 광고 방식: 버튼 클릭 → SDK 전면 광고 호출 → 완료 후 결과 표시
  // 실제 배포 시 AD_GROUP_ID를 토스 콘솔에서 발급받은 값으로 교체

  var AD_GROUP_ID = 'ait.v2.live.a3eac9b2608e407c';
  function showAd() {
    if (state.isAdShowing) return;
    state.isAdShowing = true;
    import('@apps-in-toss/web-framework').then(function (sdk) {
      var GoogleAdMob = sdk.GoogleAdMob;
      GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: function (event) {
          if (event.type === 'loaded') {
            GoogleAdMob.showAppsInTossAdMob({
              options: { adGroupId: AD_GROUP_ID },
              onEvent: function (ev) {
                if (ev.type === 'userEarnedReward') {
                  onAdComplete();
                }
                if (ev.type === 'dismissed') {
                  state.isAdShowing = false;
                }
              },
              onError: function () { onAdFailed(); }
            });
          }
        },
        onError: function () { onAdFailed(); }
      });
    }).catch(function () {
      onAdFailed();
    });
  }


  function onAdComplete() {
    state.isAdShowing = false;

    var action = state.pendingAction;
    if (!action) return;

    if (action.type === 'random') {
      recommendRandom();
    } else if (action.type === 'mood') {
      unlockMood(action.moodKey);
      recommendByMood(action.moodKey);
    }

    state.pendingAction = null;
  }

  function onAdFailed() {
    state.isAdShowing = false;
    state.pendingAction = null;
    showModal(
      '광고를 불러오지 못했어요',
      '잠시 후 다시 시도해주세요.',
      [{ text: '확인', type: 'primary' }]
    );
  }

  // ─── 기분 해금 ───
  function unlockMood(moodKey) {
    state.unlockedMoods[moodKey] = true;
    state.selectedMood = moodKey;

    // 모든 버튼 상태 업데이트
    for (var i = 0; i < MOOD_CATEGORIES.length; i++) {
      var key = MOOD_CATEGORIES[i].key;
      updateMoodButton(key, key === moodKey);
    }
  }

  // ─── 음식 추천 (순수 Math.random) ───
  function recommendRandom() {
    var food = getRandomFood(state.foods);
    showResult(food, null);
  }

  function recommendByMood(moodKey) {
    var filtered = state.foods.filter(function (food) {
      return food.categories && food.categories.indexOf(moodKey) !== -1;
    });

    if (filtered.length === 0) {
      showToast('해당 기분에 맞는 메뉴가 없어요. 전체에서 추천할게요!');
      filtered = state.foods;
    }

    var food = getRandomFood(filtered);
    showResult(food, moodKey);
  }

  // 순수 JavaScript Math.random() 사용 - Claude API 사용 금지!
  function getRandomFood(foods) {
    var randomIndex = Math.floor(Math.random() * foods.length);
    return foods[randomIndex];
  }

  // ─── 결과 화면 ───
  function showResult(food, moodKey) {
    if (!food) return;

    var emoji = getFoodEmoji(food.tags);
    dom.resultEmoji.textContent = emoji;
    dom.resultFoodName.textContent = food.name;

    // 상단 라벨 - 어떤 기분 버튼으로 들어왔는지 표시
    if (moodKey) {
      var moodInfo = getMoodInfo(moodKey);
      if (moodInfo) {
        dom.resultLabel.textContent = moodInfo.emoji + ' ' + moodInfo.name;
      } else {
        dom.resultLabel.textContent = '오늘의 추천 메뉴';
      }
    } else {
      dom.resultLabel.textContent = '오늘의 추천 메뉴';
    }

    // 기분별 멘트
    var comment = '';
    if (moodKey && MOOD_COMMENTS[moodKey]) {
      comment = MOOD_COMMENTS[moodKey].replace('{food}', food.name);
    } else {
      var randomComments = RANDOM_COMMENTS;
      var randIdx = Math.floor(Math.random() * randomComments.length);
      comment = randomComments[randIdx].replace('{food}', food.name);
    }
    dom.resultComment.textContent = comment;

    // 태그 렌더링
    var tagsHTML = '';
    if (food.tags) {
      for (var i = 0; i < food.tags.length; i++) {
        tagsHTML += '<span class="result-tag">' + food.tags[i] + '</span>';
      }
    }
    if (moodKey) {
      var selectedMoodInfo = getMoodInfo(moodKey);
      if (selectedMoodInfo) {
        tagsHTML += '<span class="result-tag result-tag--mood">' + selectedMoodInfo.emoji + ' ' + selectedMoodInfo.short + '</span>';
      }
    }
    dom.resultTags.innerHTML = tagsHTML;

    dom.resultScreen.hidden = false;
  }

  function hideResult() {
    dom.resultScreen.hidden = true;
  }

  function getFoodEmoji(tags) {
    if (!tags || tags.length === 0) return FOOD_EMOJIS['default'];

    for (var i = 0; i < tags.length; i++) {
      if (FOOD_EMOJIS[tags[i]]) return FOOD_EMOJIS[tags[i]];
    }
    return FOOD_EMOJIS['default'];
  }

  function getMoodInfo(moodKey) {
    for (var i = 0; i < MOOD_CATEGORIES.length; i++) {
      if (MOOD_CATEGORIES[i].key === moodKey) return MOOD_CATEGORIES[i];
    }
    return null;
  }

  // ─── TDS 모달 (alert/confirm 대체) ───
  function showModal(title, body, buttons) {
    dom.modalTitle.textContent = title;
    dom.modalBody.textContent = body;

    var footerHTML = '';
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var cls = btn.type === 'primary' ? 'modal-btn--primary' : 'modal-btn--secondary';
      footerHTML += '<button class="modal-btn ' + cls + '" data-modal-idx="' + i + '" type="button">' + btn.text + '</button>';
    }
    dom.modalFooter.innerHTML = footerHTML;

    // 이벤트 바인딩
    var modalBtns = dom.modalFooter.querySelectorAll('.modal-btn');
    for (var j = 0; j < modalBtns.length; j++) {
      modalBtns[j].addEventListener('click', function (e) {
        var idx = parseInt(e.currentTarget.getAttribute('data-modal-idx'));
        hideModal();
        if (buttons[idx] && buttons[idx].action) {
          buttons[idx].action();
        }
      });
    }

    dom.modalOverlay.hidden = false;
  }

  function hideModal() {
    dom.modalOverlay.hidden = true;
  }

  // ─── TDS 토스트 ───
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    dom.toastContainer.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2600);
  }

  // ─── 시작 ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
