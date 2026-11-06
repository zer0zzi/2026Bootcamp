# 💰 스마트가계부

수입과 지출, 예산을 한눈에 관리하는 웹 가계부, 스마트가계부입니다. 외부 API 없이 동작합니다.

## 기능

| 화면 | 내용 |
| --- | --- |
| 메인 (`/`) | 월별 수입·지출·잔액, 전월 대비 지출, 월말 예상 지출, 예산 사용률, 카테고리별 지출 비율, 최근 6개월 추이 |
| 내역 (`/transactions`) | 검색, 수입/지출·카테고리·기간 필터, 거래별/카테고리별 보기, 수정·삭제·복사, CSV 내보내기 |
| 입력 (`/transactions/new`) | 수입/지출, 결제수단, 메모, 품목마다 카테고리 지정, 총액 자동 계산, 상호명 자동완성 |
| 달력 (`/calendar`) | 일별 수입·지출 합계, 날짜를 누르면 그날의 내역으로 이동 |
| 예산 (`/budget`) | 월 전체 예산과 카테고리별 예산 (80% 주의, 100% 초과 표시) |

## 기술 스택

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · Zod · Vitest

## 실행

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npx prisma migrate dev   # SQLite DB 생성
npm run dev              # http://localhost:3000
npm test                 # 단위 테스트
```

> `npm run build`는 개발 서버를 끈 상태에서 실행하세요. 둘이 `.next` 폴더를 공유해 캐시가 꼬일 수 있습니다.

## 구조

```
prisma/schema.prisma        Transaction(거래) · TransactionItem(품목) · Budget(예산)
src/lib/                    도메인 로직. 화면·DB와 분리된 순수 함수는 테스트가 있다.
  categories.ts             수입/지출 카테고리, 결제수단 상수
  schemas.ts                Zod 스키마 = 입력 폼 값 = API 요청 검증
  dates.ts                  월 이동·검증·달력 계산 (로컬 시간 기준)
  stats.ts                  월 요약, 카테고리 집계, 예산 현황, 추이, 일별 합계, 월말 예상
  transactionFilter.ts      내역 필터·검색·카테고리별 그룹핑, URL 쿼리 해석
  csv.ts                    CSV 변환 (엑셀 한글 BOM, 따옴표 이스케이프)
  transactions.ts, budgets.ts   DB 접근 (Prisma)
src/app/api/                transactions, transactions/[id], budgets
src/app/                    메인, 내역, 입력/수정, 달력, 예산 페이지
src/components/             화면 컴포넌트
```

## 설계 메모

- **총액은 입력받지 않습니다.** 품목 가격의 합계로 화면에서 자동 계산하고, 서버도 저장할 때 다시
  계산합니다. 클라이언트가 보낸 값은 믿지 않습니다.
- **카테고리는 품목 단위입니다.** 한 영수증에 식비와 생활용품이 섞여 있어도 카테고리별 통계가 정확합니다.
  카테고리 필터를 걸면 그 카테고리 품목만 남기고 합계도 다시 계산합니다.
- **수입/지출 카테고리는 서로 섞이지 않습니다.** 스키마(`superRefine`)가 거래 종류와 카테고리 불일치를 거절합니다.
- **통계는 DB가 아니라 순수 함수로 계산합니다.** 데이터 양이 개인 가계부 규모라 모든 거래를 읽어 메모리에서
  집계하며, 덕분에 계산 규칙을 DB 없이 단위 테스트할 수 있습니다. 데이터가 커지면 월 단위 조회·집계 쿼리로
  옮기는 지점이 `listTransactions`입니다.
- **월·필터는 URL 쿼리로 유지합니다.** 새로고침하거나 링크를 공유해도 같은 화면이 나오고, 메인 화면의
  카테고리나 달력의 날짜를 누르면 해당 조건의 내역으로 바로 이동합니다.
- **날짜는 로컬 시간 기준 문자열(YYYY-MM-DD)** 로 다룹니다. `toISOString()`은 UTC라 자정 무렵에
  하루가 어긋날 수 있어 쓰지 않습니다.
- **DB 모델 이름을 바꿀 때 데이터를 옮기지 않았습니다.** 기존 `Receipt`/`ReceiptItem` 테이블은
  `@@map`/`@map`으로 그대로 두고 코드의 이름만 `Transaction`/`TransactionItem`으로 바꿨습니다.
