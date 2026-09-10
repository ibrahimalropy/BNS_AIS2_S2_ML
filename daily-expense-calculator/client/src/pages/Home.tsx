import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpLeft,
  BarChart3,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Coffee,
  CreditCard,
  Filter,
  Home as HomeIcon,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils,
  WalletCards,
  Zap,
} from "lucide-react";

type Category = "food" | "transport" | "shopping" | "bills" | "home";
type Expense = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
};

const categoryMeta: Record<
  Category,
  { label: string; icon: typeof Coffee; color: string; soft: string }
> = {
  food: { label: "أكل ومشروبات", icon: Utensils, color: "#60a5fa", soft: "#172554" },
  transport: { label: "مواصلات", icon: Zap, color: "#a78bfa", soft: "#2e1065" },
  shopping: { label: "تسوق", icon: ShoppingBag, color: "#fbbf24", soft: "#451a03" },
  bills: { label: "فواتير", icon: CreditCard, color: "#34d399", soft: "#052e2b" },
  home: { label: "البيت", icon: HomeIcon, color: "#fb7185", soft: "#4c0519" },
};
const categoryOptions = Object.entries(categoryMeta) as [Category, (typeof categoryMeta)[Category]][];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

const initialExpenses: Expense[] = [
  { id: "1", title: "قهوة الصباح", amount: 18, category: "food", date: localDate() },
  { id: "2", title: "مشوار المكتب", amount: 32, category: "transport", date: localDate() },
  { id: "3", title: "مشتريات البيت", amount: 86, category: "home", date: localDate() },
  { id: "4", title: "اشتراك الإنترنت", amount: 120, category: "bills", date: localDate() },
];

const currency = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 });
const formatAmount = (amount: number) => currency.format(amount).replace("ر.س.‏", "ر.س");
const formatDate = (date: string) => new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
const formatTime = (id: string) => {
  const minutes = 9 * 60 + (Number(id.replace(/\D/g, "")) || 2) * 37;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

function IconBox({ category, size = "md" }: { category: Category; size?: "sm" | "md" }) {
  const meta = categoryMeta[category];
  const Icon = meta.icon;
  return <span className={`icon-box icon-box-${size}`} style={{ background: meta.soft, color: meta.color }}><Icon size={size === "sm" ? 16 : 19} strokeWidth={2.2} /></span>;
}

function StatCard({ label, value, helper, icon, tone }: { label: string; value: string; helper: string; icon: React.ReactNode; tone: "blue" | "green" | "purple" }) {
  return <article className={`stat-card stat-${tone}`}><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{helper}</span></div></article>;
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { return JSON.parse(localStorage.getItem("yawmi-expenses") || "null") || initialExpenses; } catch { return initialExpenses; }
  });
  const [selectedDate, setSelectedDate] = useState(localDate());
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { localStorage.setItem("yawmi-expenses", JSON.stringify(expenses)); }, [expenses]);

  const dayExpenses = useMemo(() => expenses.filter((expense) => expense.date === selectedDate), [expenses, selectedDate]);
  const visibleExpenses = useMemo(() => {
    const filtered = filter === "all" ? dayExpenses : dayExpenses.filter((expense) => expense.category === filter);
    return showAll ? filtered : filtered.slice(0, 5);
  }, [dayExpenses, filter, showAll]);
  const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budget = 1000;
  const remaining = Math.max(budget - total, 0);
  const budgetProgress = Math.min((total / budget) * 100, 100);
  const categories = useMemo(() => categoryOptions.map(([key, meta]) => ({ key, ...meta, total: dayExpenses.filter((item) => item.category === key).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.total > 0), [dayExpenses]);

  function addExpense(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim()) { toast.error("اكتب وصفاً بسيطاً للمصروف أولاً"); return; }
    if (!numericAmount || numericAmount <= 0) { toast.error("أدخل مبلغاً أكبر من صفر"); return; }
    const newExpense: Expense = { id: `${Date.now()}`, title: title.trim(), amount: numericAmount, category, date: selectedDate };
    setExpenses((current) => [newExpense, ...current]);
    setTitle(""); setAmount("");
    toast.success("تمت إضافة المصروف", { description: `${formatAmount(numericAmount)} — ${categoryMeta[category].label}` });
  }

  function removeExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    toast.success("تم حذف المصروف");
  }

  function changeDate(offset: number) {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    setSelectedDate([date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"));
    setShowAll(false);
  }

  return <main className="app-shell" dir="rtl">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <div className="app-container">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><WalletCards size={20} /></span><div><strong>يومي</strong><span>وضوح أكثر. مصاريف أقل.</span></div></div>
        <div className="topbar-actions"><button className="icon-button" aria-label="المساعدة"><CircleHelp size={19} /></button><button className="profile-button" aria-label="حسابك"><span>م</span><ChevronDown size={14} /></button></div>
      </header>

      <section className="welcome-row"><div><p className="eyebrow"><span className="live-dot" /> ملخص اليوم</p><h1>أهلاً، محمد <span className="wave">✦</span></h1><p className="subheading">خلّك قريب من أرقامك، خطوة صغيرة كل يوم تصنع فرقاً.</p></div><div className="date-switcher"><button onClick={() => changeDate(1)} aria-label="اليوم التالي"><ArrowDownLeft size={17} /></button><div><CalendarDays size={16} /><span>{selectedDate === localDate() ? "اليوم" : formatDate(selectedDate)}</span></div><button onClick={() => changeDate(-1)} aria-label="اليوم السابق"><ArrowUpLeft size={17} /></button></div></section>

      <section className="stats-grid" aria-label="ملخص المصروفات"><StatCard label="إجمالي اليوم" value={formatAmount(total)} helper="من مصاريفك المسجلة" icon={<Banknote size={21} />} tone="blue" /><StatCard label="المتبقي من الميزانية" value={formatAmount(remaining)} helper={`${Math.round(100 - budgetProgress)}% مساحة متاحة`} icon={<ArrowDownLeft size={21} />} tone="green" /><StatCard label="عدد العمليات" value={String(dayExpenses.length).padStart(2, "0")} helper="عملية اليوم" icon={<BarChart3 size={21} />} tone="purple" /></section>

      <div className="dashboard-grid">
        <section className="panel add-panel"><div className="panel-heading"><div><span className="section-kicker">إضافة سريعة</span><h2>سجّل مصروفك</h2></div><span className="sparkle"><Sparkles size={17} /></span></div><p className="panel-intro">أضف المصروف في ثوانٍ، وخلي الصورة أوضح بكرة.</p>
          <form onSubmit={addExpense} className="expense-form"><label>ما الذي صرفت عليه؟<div className="input-wrap"><Coffee size={18} /><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: غداء العمل" aria-label="وصف المصروف" /></div></label><div className="form-row"><label>المبلغ<div className="input-wrap amount-input"><input type="number" min="1" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" aria-label="مبلغ المصروف" /><span>ر.س</span></div></label><label>التصنيف<div className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value as Category)} aria-label="تصنيف المصروف">{categoryOptions.map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select><ChevronDown size={16} /></div></label></div><button className="primary-button" type="submit"><Plus size={19} /> إضافة المصروف <span className="shortcut">Enter</span></button></form>
          <div className="budget-line"><div><span>ميزانية اليوم</span><strong>{formatAmount(budget)}</strong></div><span>{formatAmount(total)} مستخدم</span></div><div className="progress-track"><span style={{ width: `${budgetProgress}%` }} /></div>
        </section>

        <section className="panel categories-panel"><div className="panel-heading"><div><span className="section-kicker">أين تذهب أموالك؟</span><h2>التوزيع اليومي</h2></div><button className="more-button" aria-label="المزيد"><MoreHorizontal size={20} /></button></div><div className="category-list">{categories.length ? categories.map((item) => { const Icon = item.icon; const percent = total ? Math.round((item.total / total) * 100) : 0; return <button className="category-row" key={item.key} onClick={() => setFilter(filter === item.key ? "all" : item.key)}><span className="category-icon" style={{ background: item.soft, color: item.color }}><Icon size={18} /></span><span className="category-copy"><strong>{item.label}</strong><small>{percent}% من الإجمالي</small></span><span className="category-bar"><span style={{ width: `${percent}%`, background: item.color }} /></span><b>{formatAmount(item.total)}</b></button>; }) : <div className="empty-category"><BarChart3 size={24} /><span>أضف أول مصروف لترى التوزيع هنا</span></div>}</div><div className="category-footer"><span><span className="legend-dot" /> اضغط على أي تصنيف لتصفية القائمة</span><button onClick={() => setFilter("all")}>عرض الكل <ArrowUpLeft size={14} /></button></div></section>
      </div>

      <section className="panel activity-panel"><div className="activity-heading"><div><span className="section-kicker">سجل اليوم</span><h2>آخر المصروفات <span>{dayExpenses.length}</span></h2></div><div className="activity-actions"><button className={`filter-button ${filter !== "all" ? "active" : ""}`} onClick={() => setFilter(filter === "all" ? "food" : "all")}><Filter size={16} /> {filter === "all" ? "تصفية" : categoryMeta[filter].label}</button><button className="all-button" onClick={() => setShowAll(!showAll)}>{showAll ? "إخفاء" : "عرض الكل"} <ArrowUpLeft size={15} /></button></div></div><div className="expense-list">{visibleExpenses.length ? visibleExpenses.map((expense) => <article className="expense-item" key={expense.id}><IconBox category={expense.category} /><div className="expense-name"><strong>{expense.title}</strong><span>{categoryMeta[expense.category].label} <i /> {formatTime(expense.id)}</span></div><strong className="expense-amount">{formatAmount(expense.amount)}</strong><button className="delete-button" onClick={() => removeExpense(expense.id)} aria-label={`حذف ${expense.title}`}><Trash2 size={16} /></button></article>) : <div className="empty-state"><span className="empty-icon"><Check size={22} /></span><h3>لا توجد مصروفات هنا</h3><p>ابدأ بإضافة مصروفك الأول لهذا اليوم.</p></div>}</div></section>
      <footer className="footer"><span>يومي © 2024</span><span>مصمم لمساعدتك على الإنفاق بوعي <Sparkles size={13} /></span><span>بياناتك محفوظة على جهازك فقط</span></footer>
    </div>
  </main>;
}
