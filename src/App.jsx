import React, { useMemo, useRef, useState } from "react";

const DEFAULT_VAT_PERCENT = 18;

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function isoFromDate(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return `₪${Number(value || 0).toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(dateStr + "T12:00:00"));
}

function monthTitle(dateStr) {
  return new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(new Date(dateStr + "T12:00:00"));
}

function moveMonth(dateStr, offset) {
  const date = new Date(dateStr + "T12:00:00");
  date.setMonth(date.getMonth() + offset);
  return isoFromDate(date);
}

function getCalendarDays(dateStr) {
  const base = new Date(dateStr + "T12:00:00");
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevDays - i, muted: true, value: isoFromDate(new Date(year, month - 1, prevDays - i)) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ day, muted: false, value: isoFromDate(new Date(year, month, day)) });
  }
  while (days.length % 7 !== 0) {
    const day = days.length - startDay - daysInMonth + 1;
    days.push({ day, muted: true, value: isoFromDate(new Date(year, month + 1, day)) });
  }
  return days;
}

const colors = [
  { id: "orange", name: "כתום", dot: "bg-orange-400", chip: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "green", name: "ירוק", dot: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "pink", name: "ורוד", dot: "bg-pink-400", chip: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "blue", name: "כחול", dot: "bg-sky-400", chip: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "purple", name: "סגול", dot: "bg-violet-400", chip: "bg-violet-50 text-violet-700 border-violet-200" },
  { id: "yellow", name: "צהוב", dot: "bg-amber-400", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "red", name: "אדום", dot: "bg-red-400", chip: "bg-red-50 text-red-700 border-red-200" },
  { id: "teal", name: "טורקיז", dot: "bg-teal-400", chip: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "gray", name: "אפור", dot: "bg-slate-400", chip: "bg-slate-50 text-slate-700 border-slate-200" },
];

const weekDays = [
  { id: "sun", label: "א׳" },
  { id: "mon", label: "ב׳" },
  { id: "tue", label: "ג׳" },
  { id: "wed", label: "ד׳" },
  { id: "thu", label: "ה׳" },
  { id: "fri", label: "ו׳" },
  { id: "sat", label: "ש׳" },
];

function colorById(id) {
  return colors.find((c) => c.id === id) || colors[8] || colors[0];
}



function clientById(clients, id) {
  if (id === GENERAL_CLIENT_ID) return generalClient;
  return clients.find((c) => c.id === id);
}

const GENERAL_CLIENT_ID = "general";
const generalClient = { id: GENERAL_CLIENT_ID, name: "שוטף", retainer: 0, color: "gray", isGeneral: true };

const initialClients = [
  { id: "c1", name: "Lusso", retainer: 3200, color: "orange" },
  { id: "c2", name: "אייל אבי", retainer: 5800, color: "green" },
  { id: "c3", name: "איריס ותומוב", retainer: 3200, color: "pink" },
  { id: "c4", name: "פילטר אאוטלט", retainer: 3200, color: "blue" },
];

const initialTasks = [
  {
    id: 1,
    title: "מעקב קמפיינים אייל אבי",
    description: "בדיקת ביצועים, תקציב ועלות לליד",
    clientId: "c2",
    due: todayISO(),
    assignee: "Tal Morad",
    link: "https://ads.google.com",
    completed: false,
    recurringType: "weekly",
    recurringDays: ["sun", "tue", "thu"],
    recurringDayOfMonth: "",
    subtasks: [
      { id: 101, title: "לבדוק תקציב יומי", completed: false },
      { id: 102, title: "לעבור על עלות לליד", completed: true },
    ],
  },
  {
    id: 2,
    title: "שליחת דוח חודשי לאיריס ותומוב",
    description: "סיכום חודש, תובנות והמלצות להמשך",
    clientId: "c3",
    due: addDaysISO(5),
    assignee: "Tal Morad",
    link: "https://lookerstudio.google.com",
    completed: false,
    recurringType: "monthly",
    recurringDays: [],
    recurringDayOfMonth: "5",
    subtasks: [
      { id: 201, title: "לייצא נתוני לידים", completed: false },
      { id: 202, title: "לכתוב המלצות", completed: false },
    ],
  },
  {
    id: 3,
    title: "בדיקת קמפיינים Lusso",
    description: "מעקב דוחות ותיקוני מודעות",
    clientId: "c1",
    due: addDaysISO(-1),
    assignee: "Tal Morad",
    link: "https://business.facebook.com",
    completed: false,
    recurringType: "weekly",
    recurringDays: ["mon", "wed"],
    recurringDayOfMonth: "",
    subtasks: [],
  },
  {
    id: 4,
    title: "בדיקת CTR ופילוח קהלים",
    description: "משימה שכבר הושלמה לדוגמה",
    clientId: "c4",
    due: todayISO(),
    assignee: "Tal Morad",
    link: "https://ads.google.com",
    completed: true,
    recurringType: "weekly",
    recurringDays: ["sun", "mon", "tue", "wed", "thu"],
    recurringDayOfMonth: "",
    subtasks: [
      { id: 401, title: "בדיקת CTR", completed: true },
      { id: 402, title: "בדיקת CPL", completed: true },
    ],
  },
];

function emptyTask(clientId) {
  return {
    title: "",
    description: "",
    clientId: clientId || "",

    due: todayISO(),
    assignee: "Tal Morad",
    link: "",
    completed: false,
    recurringType: "none",
    recurringDays: [],
    recurringDayOfMonth: "1",
    subtasks: [],
  };
}

function recurringLabel(task) {
  if (task.recurringType === "daily") return "יומי";
  if (task.recurringType === "weekly") {
    const labels = task.recurringDays.map((d) => weekDays.find((w) => w.id === d)?.label).filter(Boolean).join(" · ");
    return labels ? `שבועי: ${labels}` : "שבועי";
  }
  if (task.recurringType === "monthly") return `חודשי: ${task.recurringDayOfMonth} בחודש`;
  return "חד פעמי";
}

function nextRecurringDate(task) {
  if (task.recurringType === "daily") return addDaysISO(1);
  if (task.recurringType === "monthly") {
    const now = new Date();
    const day = Math.max(1, Math.min(31, Number(task.recurringDayOfMonth || 1)));
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
    return isoFromDate(next);
  }
  if (task.recurringType === "weekly" && task.recurringDays.length) {
    const map = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const today = new Date();
    const current = today.getDay();
    const targets = task.recurringDays.map((d) => map[d]).sort((a, b) => a - b);
    let diff = targets.find((d) => d > current);
    diff = diff === undefined ? 7 - current + targets[0] : diff - current;
    const next = new Date();
    next.setDate(today.getDate() + diff);
    return isoFromDate(next);
  }
  return todayISO();
}

export default function App() {
  
  const [view, setView] = useState("dashboard");
  const [clients, setClients] = useState(initialClients);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myTasksTab, setMyTasksTab] = useState("active");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientDraft, setClientDraft] = useState({ name: "", retainer: "", color: "orange" });
  const [vatPercent, setVatPercent] = useState(DEFAULT_VAT_PERCENT);
  const [inlineTask, setInlineTask] = useState(emptyTask(""));
  const sidebarItems = [generalClient, ...clients];
  const [inlineDetailsOpen, setInlineDetailsOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const client = clientById(clients, task.clientId);
      const matchesText = `${task.title} ${task.description} ${client?.name || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? !task.completed : task.completed);
      const matchesClient = selectedClientId === "all" || task.clientId === selectedClientId;
      return matchesText && matchesStatus && matchesClient;
    });
  }, [tasks, clients, search, statusFilter, selectedClientId]);

  const dashboardTasks = filteredTasks.filter((task) => !task.completed && task.due <= todayISO()).sort((a, b) => a.due.localeCompare(b.due));
  const completedMyTasks = filteredTasks.filter((task) => task.completed).sort((a, b) => b.due.localeCompare(a.due));
  const totalNet = clients.reduce((sum, client) => sum + Number(client.retainer || 0), 0);
  const vatRate = Number(vatPercent || 0) / 100;
  const totalGross = totalNet * (1 + vatRate);

  function resetInline(clientId) {
    setInlineTask({
      ...emptyTask(clientId || (selectedClientId !== "all" ? selectedClientId : clients[0]?.id)),
      subtasks: [{ id: Date.now(), title: "", completed: false }],
    });
    setInlineDetailsOpen(false);
  }

  function addInlineTask(clientId) {
    const task = { ...inlineTask, clientId: clientId || inlineTask.clientId };
    if (!task.title.trim() || !task.clientId) return;
    const payload = {
      ...task,
      title: task.title.trim(),
      recurringDays: task.recurringType === "weekly" ? task.recurringDays : [],
      recurringDayOfMonth: task.recurringType === "monthly" ? task.recurringDayOfMonth : "",
      subtasks: (task.subtasks || []).filter((s) => s.title.trim()).map((s) => ({ ...s, title: s.title.trim() })),
      id: Date.now(),
      completed: false,
    };
    setTasks((prev) => [payload, ...prev]);
    resetInline(clientId);
  }

  function updateTask(taskId, patch) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...patch } : task)));
  }

  function openNewClient() {
    setEditingClientId(null);
    setClientDraft({ name: "", retainer: "", color: "orange" });
    setClientModalOpen(true);
  }

  function openEditClient(client) {
    setEditingClientId(client.id);
    setClientDraft({ name: client.name, retainer: client.retainer, color: client.color });
    setClientModalOpen(true);
  }

  function saveClient() {
    if (!clientDraft.name.trim()) return;
    const payload = { name: clientDraft.name.trim(), retainer: Number(clientDraft.retainer || 0), color: clientDraft.color };
    if (editingClientId) setClients((prev) => prev.map((client) => (client.id === editingClientId ? { ...client, ...payload } : client)));
    else setClients((prev) => [...prev, { ...payload, id: `c${Date.now()}` }]);
    setClientModalOpen(false);
  }

  function toggleTask(task) {
    if (!task.completed) {
      setTasks((prev) => {
        const updated = prev.map((item) => (item.id === task.id ? { ...item, completed: true } : item));
        if (task.recurringType !== "none") {
          updated.unshift({
            ...task,
            id: Date.now() + Math.random(),
            due: nextRecurringDate(task),
            completed: false,
            subtasks: (task.subtasks || []).map((sub) => ({ ...sub, completed: false })),
          });
        }
        return updated;
      });
    } else {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, completed: false } : item)));
    }
  }

  function toggleSubtask(taskId, subtaskId) {
    setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, subtasks: (task.subtasks || []).map((sub) => sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub) } : task));
  }

  function addSubtask(taskId, title) {
    const clean = title.trim();
    if (!clean) return;
    setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, subtasks: [...(task.subtasks || []), { id: Date.now() + Math.random(), title: clean, completed: false }] } : task));
  }

  function deleteSubtask(taskId, subtaskId) {
    setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, subtasks: (task.subtasks || []).filter((sub) => sub.id !== subtaskId) } : task));
  }

  function duplicateTask(task) {
    const copy = {
      ...task,
      id: Date.now() + Math.random(),
      title: `${task.title} - עותק`,
      completed: false,
      subtasks: (task.subtasks || []).map((sub) => ({ ...sub, id: Date.now() + Math.random(), completed: false })),
    };
    setTasks((prev) => [copy, ...prev]);
  }

  function deleteTask(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function deleteClient(clientId) {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
    setTasks((prev) => prev.filter((task) => task.clientId !== clientId));
    if (selectedClientId === clientId) setSelectedClientId("all");
    setInlineTask((prev) => ({ ...prev, clientId: clients.find((client) => client.id !== clientId)?.id || "" }));
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 text-slate-900" dir="rtl">
      <aside className="hidden w-72 shrink-0 bg-slate-950 p-5 text-white xl:block">
        <NavButton active={view === "dashboard"} onClick={() => { setView("dashboard"); setSelectedClientId("all"); }}>☑️ המשימות שלי</NavButton>
        <NavButton active={view === "clients" && selectedClientId === "all"} onClick={() => { setView("clients"); setSelectedClientId("all"); }}>👥 לקוחות</NavButton>
        <NavButton active={view === "retainers"} onClick={() => { setView("retainers"); setSelectedClientId("all"); }}>💰 ריטיינרים</NavButton>
        <NavButton active={view === "settings"} onClick={() => { setView("settings"); setSelectedClientId("all"); }}>⚙️ הגדרות מערכת</NavButton>

        <div className="mb-3 mt-8 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>לקוחות</span>
          <button onClick={openNewClient} className="rounded-lg px-2 py-1 text-lg leading-none text-slate-300 hover:bg-white/10">+</button>
        </div>
        <div className="space-y-2">
          {sidebarItems.map((client) => {
            const color = colorById(client.color);
            return (
              <button key={client.id} onClick={() => { setView("clients"); setSelectedClientId(client.id); resetInline(client.id); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${selectedClientId === client.id ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10"}`}>
                <span className={`h-3 w-3 rounded-full ${color.dot}`} />
                <span>{client.name}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{view === "settings" ? "הגדרות מערכת" : view === "retainers" ? "מעקב ריטיינרים" : view === "dashboard" ? "המשימות שלי" : selectedClientId === "all" ? "לקוחות ומשימות" : clientById(clients, selectedClientId)?.name}</h1>
            <p className="text-sm text-slate-500">משימות, לקוחות, subtasks, משימות חוזרות וריטיינרים.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetInline(selectedClientId !== "all" ? selectedClientId : clients[0]?.id);
                setInlineDetailsOpen(true);
              }}
              className="w-fit rounded-xl bg-[#5E17EB] px-4 py-2 text-sm text-white hover:bg-[#4b12c4]"
            >
              משימה חדשה
            </button>
            <button onClick={openNewClient} className="w-fit rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50">לקוח חדש</button>
          </div>
        </header>

        {view !== "retainers" && view !== "settings" && (
          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_170px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש משימות או לקוחות" className="rounded-xl border bg-white px-3 py-2 text-sm" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm">
              <option value="all">כל הסטטוסים</option>
              <option value="active">פעילות</option>
              <option value="completed">הושלמו</option>
            </select>
          </div>
        )}

        {view === "dashboard" && (
          <Panel title="המשימות שלי" subtitle="משימות שהוגדרו להיום או לפני, ובנפרד משימות שבוצעו">
            <div className="mb-4 flex gap-2">
              <button onClick={() => setMyTasksTab("active")} className={`rounded-xl px-4 py-2 text-sm ${myTasksTab === "active" ? "bg-[#5E17EB] text-white" : "border bg-white"}`}>משימות</button>
              <button onClick={() => setMyTasksTab("completed")} className={`rounded-xl px-4 py-2 text-sm ${myTasksTab === "completed" ? "bg-[#5E17EB] text-white" : "border bg-white"}`}>בוצע</button>
            </div>
            {myTasksTab === "active" && (
              <>
                <InlineTaskRow clients={clients} draft={inlineTask} setDraft={setInlineTask} detailsOpen={inlineDetailsOpen} setDetailsOpen={setInlineDetailsOpen} onSave={() => addInlineTask()} />
                {dashboardTasks.length === 0 ? <Empty label="אין משימות להיום או באיחור" /> : dashboardTasks.map((task) => (
                  <TaskCard key={task.id} task={task} clients={clients} client={clientById(clients, task.clientId)} onToggle={() => toggleTask(task)} onUpdate={(patch) => updateTask(task.id, patch)} onDelete={() => deleteTask(task.id)} onToggleSubtask={(sid) => toggleSubtask(task.id, sid)} onAddSubtask={(title) => addSubtask(task.id, title)} onDeleteSubtask={(sid) => deleteSubtask(task.id, sid)} onDuplicate={() => duplicateTask(task)} />
                ))}
              </>
            )}
            {myTasksTab === "completed" && (completedMyTasks.length === 0 ? <Empty label="אין משימות שבוצעו" /> : completedMyTasks.map((task) => (
              <TaskCard key={task.id} task={task} clients={clients} client={clientById(clients, task.clientId)} onToggle={() => toggleTask(task)} onUpdate={(patch) => updateTask(task.id, patch)} onDelete={() => deleteTask(task.id)} onToggleSubtask={(sid) => toggleSubtask(task.id, sid)} onAddSubtask={(title) => addSubtask(task.id, title)} onDeleteSubtask={(sid) => deleteSubtask(task.id, sid)} onDuplicate={() => duplicateTask(task)} />
            )))}
          </Panel>
        )}

        {view === "clients" && (
          <div className="space-y-6">
            {sidebarItems.filter((client) => selectedClientId === "all" ? !client.isGeneral : selectedClientId === client.id).map((client) => {
              const clientTasks = filteredTasks.filter((task) => task.clientId === client.id);
              const active = clientTasks.filter((task) => !task.completed);
              const completed = clientTasks.filter((task) => task.completed);
              const color = colorById(client.color);
              return (
                <Panel key={client.id} title={<span className="flex items-center gap-2"><span className={`h-4 w-4 rounded-full ${color.dot}`} />{client.name}</span>} action={!client.isGeneral && <div className="flex gap-2"><button type="button" onClick={(e) => { e.stopPropagation(); openEditClient(client); }} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">ערוך לקוח</button><button type="button" onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">הסר לקוח</button></div>}>
                  <Section title="משימות">
                    <InlineTaskRow clients={clients} draft={{ ...inlineTask, clientId: client.id }} setDraft={(next) => setInlineTask({ ...next, clientId: client.id })} detailsOpen={inlineDetailsOpen} setDetailsOpen={setInlineDetailsOpen} onSave={() => addInlineTask(client.id)} hideClient />
                    {active.length === 0 ? <Empty label="אין משימות פעילות" /> : active.map((task) => (
                      <TaskCard key={task.id} task={task} clients={clients} client={client} onToggle={() => toggleTask(task)} onUpdate={(patch) => updateTask(task.id, patch)} onDelete={() => deleteTask(task.id)} onToggleSubtask={(sid) => toggleSubtask(task.id, sid)} onAddSubtask={(title) => addSubtask(task.id, title)} onDeleteSubtask={(sid) => deleteSubtask(task.id, sid)} onDuplicate={() => duplicateTask(task)} />
                    ))}
                  </Section>
                  <Section title="בוצע">
                    {completed.length === 0 ? <Empty label="אין משימות שהושלמו" /> : completed.map((task) => (
                      <TaskCard key={task.id} task={task} clients={clients} client={client} onToggle={() => toggleTask(task)} onUpdate={(patch) => updateTask(task.id, patch)} onDelete={() => deleteTask(task.id)} onToggleSubtask={(sid) => toggleSubtask(task.id, sid)} onAddSubtask={(title) => addSubtask(task.id, title)} onDeleteSubtask={(sid) => deleteSubtask(task.id, sid)} onDuplicate={() => duplicateTask(task)} />
                    ))}
                  </Section>
                </Panel>
              );
            })}
          </div>
        )}

        {view === "retainers" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Stat title="סה״כ ללא מע״מ" value={formatCurrency(totalNet)} />
              <Stat title="סה״כ כולל מע״מ" value={formatCurrency(totalGross)} />
              
            </div>
            <Panel title="לקוחות וריטיינרים" subtitle="אפשר לערוך לכל לקוח את סכום הריטיינר, שם וצבע">
              {clients.map((client) => {
                const color = colorById(client.color);
                const gross = Number(client.retainer || 0) * (1 + vatRate);
                return (
                  <div key={client.id} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_160px_160px_auto] md:items-center">
                    <div className="flex items-center gap-2"><span className={`h-4 w-4 rounded-full ${color.dot}`} /><b>{client.name}</b></div>
                    <div><div className="text-xs text-slate-500">ללא מע״מ</div><b>{formatCurrency(client.retainer)}</b></div>
                    <div><div className="text-xs text-slate-500">כולל מע״מ</div><b>{formatCurrency(gross)}</b></div>
                    <div className="flex gap-2"><button type="button" onClick={(e) => { e.stopPropagation(); openEditClient(client); }} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">ערוך לקוח</button><button type="button" onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">הסר לקוח</button></div>
                  </div>
                );
              })}
            </Panel>
          </div>
        )}

        {view === "settings" && (
          <Panel title="הגדרות מערכת" subtitle="הגדרות כלליות שמשפיעות על חישובי המערכת">
            <div className="grid gap-4 md:max-w-md">
              <Form label="אחוז מע״מ">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="0.1" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} className="input" />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </Form>

              

              

              

              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                חישובי הריטיינרים משתמשים במע״מ של <b>{vatPercent}%</b>
              </div>
            </div>
          </Panel>
        )}
      </main>

      {clientModalOpen && (
        <Modal title={editingClientId ? "עריכת לקוח" : "לקוח חדש"} onClose={() => setClientModalOpen(false)}>
          <Form label="שם לקוח"><input value={clientDraft.name} onChange={(e) => setClientDraft({ ...clientDraft, name: e.target.value })} className="input" /></Form>
          <Form label="ריטיינר חודשי ללא מע״מ"><input type="number" value={clientDraft.retainer} onChange={(e) => setClientDraft({ ...clientDraft, retainer: e.target.value })} className="input" /></Form>
          <Form label="צבע לקוח"><select value={clientDraft.color} onChange={(e) => setClientDraft({ ...clientDraft, color: e.target.value })} className="input">{colors.map((color) => <option key={color.id} value={color.id}>{color.name}</option>)}</select></Form>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">כולל מע״מ: <b>{formatCurrency(Number(clientDraft.retainer || 0) * (1 + vatRate))}</b></div>
          <div className="flex gap-2 pt-2"><button onClick={saveClient} className="rounded-xl bg-[#5E17EB] px-4 py-2 text-sm text-white">שמור</button><button onClick={() => setClientModalOpen(false)} className="rounded-xl border px-4 py-2 text-sm">ביטול</button></div>
        </Modal>
      )}
    </div>
  );
}

function DateRecurringPicker({ task, onChange }) {
  const [open, setOpen] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);

  function update(patch) {
    onChange({ ...task, ...patch });
  }

  function toggleDay(dayId) {
    const current = task.recurringDays || [];
    update({ recurringDays: current.includes(dayId) ? current.filter((d) => d !== dayId) : [...current, dayId] });
  }

  return (
    <div className="relative inline-block">
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="rounded-lg border bg-white px-2 py-1 text-xs hover:bg-slate-50">
        {formatDate(task.due)} {task.recurringType !== "none" ? "🔁" : ""}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setOpen(false)} aria-label="סגור לוח שנה" />
          <div className="absolute left-0 top-8 z-50 w-64 rounded-2xl border bg-white p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <button type="button" onClick={() => update({ due: moveMonth(task.due, -1) })} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">‹</button>
              <div className="text-xs font-bold text-slate-800">{monthTitle(task.due)}</div>
              <button type="button" onClick={() => update({ due: moveMonth(task.due, 1) })} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">›</button>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">{weekDays.map((day) => <div key={day.id}>{day.label}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {getCalendarDays(task.due).map((item) => {
                const selected = item.value === task.due;
                const isToday = item.value === todayISO();
                return (
                  <button key={item.value} type="button" onClick={() => update({ due: item.value })} className={`h-7 rounded-lg transition ${selected ? "bg-[#5E17EB] font-semibold text-white" : isToday ? "bg-violet-50 text-[#5E17EB]" : item.muted ? "text-slate-300 hover:bg-slate-50" : "text-slate-700 hover:bg-slate-100"}`}>{item.day}</button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex gap-1"><button type="button" onClick={() => update({ due: todayISO() })} className="rounded-full border px-2 py-1 text-[11px] hover:bg-slate-50">היום</button><button type="button" onClick={() => update({ due: addDaysISO(1) })} className="rounded-full border px-2 py-1 text-[11px] hover:bg-slate-50">מחר</button></div>
              <button type="button" onClick={() => setShowRecurring(!showRecurring)} className="rounded-lg border px-2 py-1 text-[11px] hover:bg-slate-50">🔁</button>
            </div>
            {showRecurring && (
              <div className="mt-2 space-y-2 border-t pt-2">
                <select value={task.recurringType} onChange={(e) => update({ recurringType: e.target.value })} className="w-full rounded-lg border px-2 py-1 text-xs">
                  <option value="none">ללא חזרתיות</option>
                  <option value="daily">יומית</option>
                  <option value="weekly">שבועית</option>
                  <option value="monthly">חודשית</option>
                </select>
                {task.recurringType === "weekly" && <div className="flex flex-wrap gap-1">{weekDays.map((day) => <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={`rounded-full border px-2 py-1 text-[11px] ${task.recurringDays.includes(day.id) ? "bg-[#5E17EB] text-white" : "bg-white"}`}>{day.label}</button>)}</div>}
                {task.recurringType === "monthly" && <input type="number" min="1" max="31" value={task.recurringDayOfMonth} onChange={(e) => update({ recurringDayOfMonth: e.target.value })} className="w-full rounded-lg border px-2 py-1 text-xs" />}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InlineTaskRow({ clients, draft, setDraft, onSave, hideClient, detailsOpen, setDetailsOpen }) {
  const rowRef = useRef(null);

  function saveIfNeeded() {
    if (draft.title.trim()) onSave();
  }

  return (
    <div
      ref={rowRef}
      onBlurCapture={() => {
        setTimeout(() => {
          if (rowRef.current && !rowRef.current.contains(document.activeElement)) saveIfNeeded();
        }, 0);
      }}
      className="border-b bg-white"
    >
      <div className="grid min-h-[40px] grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-1.5 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-slate-400">+</span>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
            placeholder="הוסף משימה..."
            className="border-0 bg-transparent text-sm outline-none w-full"
          />
        </div>
        {!hideClient && <select value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })} className="rounded-lg border bg-white px-2 py-1 text-xs">
          <option value="">בחר לקוח</option>
          <option value={GENERAL_CLIENT_ID}>שוטף</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>}
        <DateRecurringPicker task={draft} onChange={setDraft} />
        <button type="button" onClick={() => setDetailsOpen(!detailsOpen)} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">פרטים</button>
      </div>
      {detailsOpen && (
        <div className="grid gap-2 border-t bg-slate-50 p-3 text-xs">
          <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="תיאור" className="rounded-lg border bg-white px-3 py-2" />
          <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="לינק" className="rounded-lg border bg-white px-3 py-2" />
          <SubtasksDraftEditor draft={draft} setDraft={setDraft} />
          <button onClick={onSave} className="w-fit rounded-xl bg-[#5E17EB] px-4 py-2 text-xs text-white hover:bg-[#4b12c4]">שמור משימה</button>
        </div>
      )}
    </div>
  );
}

function SubtasksDraftEditor({ draft, setDraft }) {
  function addEmpty() {
    setDraft({ ...draft, subtasks: [...(draft.subtasks || []), { id: Date.now() + Math.random(), title: "", completed: false }] });
  }
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-500">Subtasks</div>
      {(draft.subtasks || []).map((subtask, index) => (
        <div key={subtask.id} className="flex items-center gap-2">
          <button type="button" onClick={() => setDraft({ ...draft, subtasks: draft.subtasks.map((s) => s.id === subtask.id ? { ...s, completed: !s.completed } : s) })} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${subtask.completed ? "border-[#5E17EB] bg-[#5E17EB] text-white" : "border-slate-300 bg-white text-transparent"}`}>✓</button>
          <input value={subtask.title} onChange={(e) => setDraft({ ...draft, subtasks: draft.subtasks.map((s) => s.id === subtask.id ? { ...s, title: e.target.value } : s) })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmpty(); setTimeout(() => { const inputs = document.querySelectorAll("input[data-subtask-draft]"); if (inputs.length) inputs[inputs.length - 1].focus(); }, 0); } }} data-subtask-draft placeholder={`תת משימה ${index + 1}`} className={`w-full rounded-lg border bg-white px-3 py-2 text-xs ${subtask.completed ? "line-through text-slate-400" : ""}`} />
          <button type="button" onClick={() => setDraft({ ...draft, subtasks: draft.subtasks.filter((s) => s.id !== subtask.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">הסר</button>
        </div>
      ))}
      <button type="button" onClick={addEmpty} className="rounded-lg border px-3 py-1 text-xs hover:bg-white">+ הוסף subtask</button>
    </div>
  );
}

function TaskCard({ task, clients = [], client, onToggle, onUpdate, onDelete, onToggleSubtask, onAddSubtask, onDeleteSubtask, onDuplicate }) {
  const [open, setOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const cardRef = useRef(null);
  const color = colorById(client?.color);

  React.useEffect(() => {
    if (!open && !contextMenu) return undefined;
    function handleOutsideClick(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setOpen(false);
        setContextMenu(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [open, contextMenu]);

  return (
    <div ref={cardRef} className="border-b bg-white text-sm">
      <div
        onClick={() => setOpen((value) => !value)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        className="grid min-h-[38px] cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-1.5 hover:bg-slate-50"
      >
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs transition ${
              task.completed
                ? "border-[#5E17EB] bg-[#5E17EB] text-white"
                : "border-slate-300 bg-white text-transparent hover:border-[#5E17EB]"
            }`}
          >
            ✓
          </span>
          <span className={task.completed ? "line-through text-slate-400" : ""}>{task.title}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg bg-[#5E17EB] px-2 py-1 text-white hover:bg-[#4b12c4]"
            >
              פתח לינק
            </a>
          )}
          <span className={`rounded border px-2 py-0.5 ${color.chip}`}>{client?.name}</span>
          <DateRecurringPicker task={task} onChange={(next) => onUpdate(next)} />
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[999] w-44 overflow-hidden rounded-xl border bg-white py-1 text-sm shadow-2xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onDuplicate();
              setContextMenu(null);
            }}
            className="block w-full px-4 py-2 text-right hover:bg-slate-50"
          >
            שכפל משימה
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setContextMenu(null);
            }}
            className="block w-full px-4 py-2 text-right text-red-600 hover:bg-red-50"
          >
            מחק משימה
          </button>
        </div>
      )}

      {open && (
        <div className="space-y-3 border-t bg-slate-50 px-4 py-3 text-sm text-slate-600" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.clientId}
            onChange={(e) => onUpdate({ clientId: e.target.value })}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value={GENERAL_CLIENT_ID}>שוטף</option>
            {clients.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="תיאור"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          />
          <input
            value={task.link}
            onChange={(e) => onUpdate({ link: e.target.value })}
            placeholder="לינק"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          />
          <button onClick={onDelete} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
            מחק
          </button>

          <div>
            <div className="mb-2 text-base font-semibold text-slate-800">Subtasks</div>
            {(task.subtasks || []).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between gap-3 rounded-lg py-1 text-[15px]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleSubtask(sub.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs transition ${
                      sub.completed
                        ? "border-[#5E17EB] bg-[#5E17EB] text-white"
                        : "border-slate-300 bg-white text-transparent hover:border-[#5E17EB]"
                    }`}
                  >
                    ✓
                  </button>
                  <span className={sub.completed ? "line-through text-slate-400" : "text-slate-700"}>{sub.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteSubtask(sub.id)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  מחק
                </button>
              </div>
            ))}

            <div className="mt-2 flex gap-1">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onAddSubtask(newSubtask);
                    setNewSubtask("");
                  }
                }}
                className="rounded-lg border px-2 py-1 text-xs"
                placeholder="הוסף subtask"
              />
              <button
                onClick={() => {
                  onAddSubtask(newSubtask);
                  setNewSubtask("");
                }}
                className="rounded-lg border px-3 py-1 text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 w-full rounded-xl px-3 py-3 text-right text-sm transition ${
        active ? "bg-[#5E17EB] text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-0 overflow-visible rounded-xl border">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-3 text-sm font-semibold text-slate-700">{title}</div>
      <div className="overflow-visible rounded-xl border">{children}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <div className="grid gap-4">{children}</div>
      </div>
    </div>
  );
}

function Form({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Empty({ label }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500">{label}</div>;
}

if (typeof document !== "undefined" && !document.getElementById("agency-os-style")) {
  const style = document.createElement("style");
  style.id = "agency-os-style";
  style.textContent = `.input{width:100%;border:1px solid #e2e8f0;border-radius:.75rem;padding:.5rem .75rem;font-size:.875rem;outline:none;background:#fff;color:#0f172a}`;
  document.head.appendChild(style);
}
