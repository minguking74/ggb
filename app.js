(() => {
  "use strict";

  const STORAGE_KEY = "ggb.transactions";

  const CATEGORIES = {
    expense: ["식비", "교통", "생활", "문화/여가", "의료", "교육", "주거", "기타"],
    income: ["급여", "용돈", "부수입", "이자/투자", "기타"],
  };

  /** @type {{id:string, type:'income'|'expense', date:string, category:string, amount:number, memo:string}[]} */
  let transactions = loadTransactions();
  let currentType = "expense";
  let viewDate = new Date();
  viewDate.setDate(1);

  // --- Elements ---
  const form = document.getElementById("txForm");
  const dateInput = document.getElementById("date");
  const categorySelect = document.getElementById("category");
  const amountInput = document.getElementById("amount");
  const memoInput = document.getElementById("memo");
  const tabs = document.querySelectorAll(".tab");
  const txListEl = document.getElementById("txList");
  const emptyMsgEl = document.getElementById("emptyMsg");
  const txCountEl = document.getElementById("txCount");
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpenseEl = document.getElementById("totalExpense");
  const totalBalanceEl = document.getElementById("totalBalance");
  const currentMonthEl = document.getElementById("currentMonth");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  // --- Init ---
  function init() {
    dateInput.value = toDateInputValue(new Date());
    renderCategoryOptions();
    renderMonthLabel();
    render();

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        currentType = tab.dataset.type;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        renderCategoryOptions();
      });
    });

    form.addEventListener("submit", onSubmit);
    prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => changeMonth(1));
    txListEl.addEventListener("click", onListClick);
  }

  function changeMonth(delta) {
    viewDate.setMonth(viewDate.getMonth() + delta);
    renderMonthLabel();
    render();
  }

  function renderMonthLabel() {
    currentMonthEl.textContent = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;
  }

  function renderCategoryOptions() {
    const cats = CATEGORIES[currentType];
    categorySelect.innerHTML = cats
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
      .join("");
  }

  function onSubmit(e) {
    e.preventDefault();
    const amount = Number(amountInput.value);
    if (!amount || amount <= 0) return;

    const tx = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      type: currentType,
      date: dateInput.value || toDateInputValue(new Date()),
      category: categorySelect.value,
      amount,
      memo: memoInput.value.trim(),
    };

    transactions.push(tx);
    saveTransactions();

    // jump view to the month of the added transaction
    const added = new Date(tx.date);
    viewDate = new Date(added.getFullYear(), added.getMonth(), 1);
    renderMonthLabel();

    amountInput.value = "";
    memoInput.value = "";
    render();
  }

  function onListClick(e) {
    const btn = e.target.closest(".tx-delete");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!confirm("이 내역을 삭제할까요?")) return;
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    render();
  }

  function getMonthTransactions() {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function render() {
    const monthTx = getMonthTransactions();

    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    totalIncomeEl.textContent = formatWon(income);
    totalExpenseEl.textContent = formatWon(expense);
    totalBalanceEl.textContent = formatWon(income - expense);

    txCountEl.textContent = monthTx.length ? `${monthTx.length}건` : "";
    emptyMsgEl.hidden = monthTx.length > 0;

    txListEl.innerHTML = monthTx
      .map((t) => {
        const sign = t.type === "income" ? "+" : "-";
        const dateLabel = formatDateLabel(t.date);
        const metaParts = [dateLabel, t.category];
        if (t.memo) metaParts.push(t.memo);
        return `
        <li class="tx-item">
          <div class="tx-left">
            <span class="tx-cat">${escapeHtml(t.category)}</span>
            <span class="tx-meta">${escapeHtml(metaParts.join(" · "))}</span>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${t.type}">${sign}${formatWon(t.amount)}</span>
            <button class="tx-delete" data-id="${t.id}" aria-label="삭제" type="button">✕</button>
          </div>
        </li>`;
      })
      .join("");
  }

  // --- Storage ---
  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error("저장 실패:", e);
    }
  }

  // --- Helpers ---
  function toDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDateLabel(isoDate) {
    const d = new Date(isoDate);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function formatWon(n) {
    return `${n.toLocaleString("ko-KR")}원`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  init();
})();
