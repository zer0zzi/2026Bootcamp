import type { Category, PaymentMethod, TransactionType } from "./categories";
import { daysInMonth, shiftMonth, todayString } from "./dates";
import type { SavedBudget, SavedTransaction } from "./schemas";

/** [품목명, 가격, 카테고리, 수량(생략하면 1)] */
type ItemSpec = [name: string, price: number, category: Category, quantity?: number];

type Template = {
  /** 그 달의 며칠에 일어나는 거래인지 */
  day: number;
  title: string;
  type: TransactionType;
  paymentMethod: PaymentMethod | "";
  memo?: string;
  items: ItemSpec[];
  /** true면 매달 같은 금액(월급, 월세 등). 아니면 달마다 조금씩 달라진다. */
  fixed?: boolean;
  /** 몇 달 전인지(0=이번 달)를 받아 그 달에 포함할지 정한다. 생략하면 매달. */
  when?: (monthsAgo: number) => boolean;
};

const MONTHS = 6;

const TEMPLATES: Template[] = [
  { day: 1, title: "월세", type: "EXPENSE", paymentMethod: "계좌이체", fixed: true, items: [["월세", 450000, "주거/통신"]] },
  { day: 3, title: "하나로마트", type: "EXPENSE", paymentMethod: "카드", items: [["쌀 10kg", 28000, "식비"], ["계란", 6500, "식비"], ["주방세제", 9800, "생활"]] },
  { day: 5, title: "교통카드 충전", type: "EXPENSE", paymentMethod: "카드", items: [["교통카드 충전", 30000, "교통"]] },
  { day: 7, title: "김밥천국", type: "EXPENSE", paymentMethod: "카드", items: [["참치김밥", 4500, "식비", 2]] },
  { day: 8, title: "카페", type: "EXPENSE", paymentMethod: "카드", items: [["아메리카노", 4500, "식비"], ["치즈케이크", 6500, "식비"]] },
  { day: 10, title: "통신비", type: "EXPENSE", paymentMethod: "카드", fixed: true, items: [["휴대폰 요금", 55000, "주거/통신"]] },
  { day: 12, title: "프리랜서 외주", type: "INCOME", paymentMethod: "", when: (m) => m % 2 === 0, items: [["외주 수입", 150000, "부수입"]] },
  { day: 14, title: "영화관", type: "EXPENSE", paymentMethod: "카드", memo: "친구와", items: [["영화 2매", 24000, "문화/여가"]] },
  { day: 15, title: "약국", type: "EXPENSE", paymentMethod: "현금", items: [["감기약", 7500, "의료/건강"]] },
  { day: 17, title: "온라인 쇼핑", type: "EXPENSE", paymentMethod: "카드", items: [["운동화", 59000, "쇼핑"]], when: (m) => m % 3 === 0 },
  { day: 17, title: "온라인 쇼핑", type: "EXPENSE", paymentMethod: "카드", items: [["티셔츠", 25000, "쇼핑"], ["양말 세트", 8900, "쇼핑"]], when: (m) => m % 3 !== 0 },
  { day: 18, title: "교보문고", type: "EXPENSE", paymentMethod: "카드", when: (m) => m % 2 === 1, items: [["프로그래밍 책", 33000, "교육"]] },
  { day: 20, title: "하나로마트", type: "EXPENSE", paymentMethod: "카드", items: [["삼겹살", 18000, "식비"], ["채소 모음", 7200, "식비"], ["휴지", 12500, "생활"]] },
  { day: 22, title: "고깃집", type: "EXPENSE", paymentMethod: "카드", memo: "가족 외식", items: [["삼겹살 외식", 42000, "식비"]] },
  { day: 24, title: "축의금", type: "EXPENSE", paymentMethod: "현금", when: (m) => m % 4 === 1, items: [["결혼식 축의금", 50000, "경조사"]] },
  { day: 25, title: "월급", type: "INCOME", paymentMethod: "", fixed: true, items: [["월급", 2800000, "급여"]] },
  { day: 27, title: "용돈", type: "INCOME", paymentMethod: "", when: (m) => m % 3 === 2, items: [["부모님 용돈", 100000, "용돈"]] },
  { day: 28, title: "택시", type: "EXPENSE", paymentMethod: "카드", items: [["택시", 12800, "교통"]] },
];

/** 항상 같은 입력이면 같은 값을 돌려주는 "달마다 조금 다른" 금액. 기준 금액의 ±12% 안에서 100원 단위로 흔든다. */
function vary(base: number, seed: number): number {
  const offset = ((seed * 37) % 9) - 4; // -4 ~ +4
  return Math.round((base * (1 + offset * 0.03)) / 100) * 100;
}

/**
 * 오늘 날짜 기준 최근 6개월의 샘플 거래를 만든다. 미래 날짜의 거래는 만들지 않는다.
 * 같은 날짜로 부르면 항상 같은 결과이고, 날짜가 바뀌면 "이번 달"이 따라 움직여 데모가 비어 보이지 않는다.
 */
export function createDemoTransactions(today: string = todayString()): SavedTransaction[] {
  const thisMonth = today.slice(0, 7);
  const transactions: Omit<SavedTransaction, "id">[] = [];

  for (let monthsAgo = MONTHS - 1; monthsAgo >= 0; monthsAgo--) {
    const month = shiftMonth(thisMonth, -monthsAgo);
    TEMPLATES.forEach((template, index) => {
      if (template.when && !template.when(monthsAgo)) return;
      if (template.day > daysInMonth(month)) return;

      const date = `${month}-${String(template.day).padStart(2, "0")}`;
      if (date > today) return;

      const items = template.items.map(([name, price, category, quantity = 1]) => ({
        name,
        quantity,
        price: template.fixed ? price * quantity : vary(price * quantity, monthsAgo * 31 + template.day + index),
        category,
      }));

      transactions.push({
        type: template.type,
        date,
        title: template.title,
        total: items.reduce((sum, item) => sum + item.price, 0),
        paymentMethod: template.paymentMethod,
        memo: template.memo ?? "",
        createdAt: `${date}T09:00:00.000Z`,
        items,
      });
    });
  }

  // 오래된 것부터 id를 매기고, 화면에서는 최신순으로 쓴다. (실제 DB 조회와 같은 순서)
  return transactions
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t, index) => ({ ...t, id: index + 1 }))
    .reverse();
}

export function createDemoBudgets(): SavedBudget[] {
  return [
    { category: "전체", amount: 1500000 },
    { category: "식비", amount: 450000 },
    { category: "교통", amount: 100000 },
    { category: "문화/여가", amount: 100000 },
  ];
}
