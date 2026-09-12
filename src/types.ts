export type TxType = 'income' | 'expense' | 'allowance' | 'card_expense';
export type PaymentMethod = 'cash' | 'bank' | 'card';

export type Attachment = {
  uri: string;
  name?: string;
  source: 'camera' | 'gallery';
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  date: string;
  sourceOrPerson?: string;
  paymentMethod?: PaymentMethod;
  cardId?: string;
  statementKey?: string;
  attachment?: Attachment;
};

export type CreditCard = {
  id: string;
  bank: string;
  name: string;
  holder?: string;
  last4?: string;
  statementDay: number;
  dueDay: number;
  active: boolean;
  paidMonths?: string[];
};

export type Bill = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  owner?: string;
  paymentMethod?: PaymentMethod;
  cardId?: string;
  attachment?: Attachment;
};

export type FixedExpense = {
  id: string;
  title: string;
  amount: number;
  dayOfMonth: number;
  active: boolean;
  startMonth: string;
  mode: 'this_month' | 'from_now';
  paidMonths?: string[];
};

export type Reminder = {
  id: string;
  title: string;
  date: string;
  kind: 'bill' | 'card' | 'fixed' | 'custom';
  done: boolean;
};

export type HaneState = {
  version: 5;
  selectedMonth: string;
  transactions: Transaction[];
  cards: CreditCard[];
  bills: Bill[];
  fixedExpenses: FixedExpense[];
  reminders: Reminder[];
  remindersEnabled: boolean;
  alarmDaysBefore: number;
};

export const emptyState = (): HaneState => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  return {
    version: 5,
    selectedMonth: month,
    transactions: [],
    cards: [],
    bills: [],
    fixedExpenses: [],
    reminders: [],
    remindersEnabled: true,
    alarmDaysBefore: 3
  };
};
