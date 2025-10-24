import React, { useEffect, useMemo, useState } from "react";

/** ---------- Config ---------- **/
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** ---------- Types ---------- **/
export type JobStage = "APPLIED" | "UNDER_REVIEW" | "OA" | "INTERVIEW" | "OFFER";
export type JobDecision = "PENDING" | "REJECTED" | "OFFER_ACCEPTED" | "WITHDRAWN";
export interface Job {
  id: number;
  company_name: string;
  role_title: string;
  location?: string | null;
  source?: string | null;
  apply_url?: string | null;
  stage: JobStage;
  decision: JobDecision;
  priority: number;
  notes?: string | null;
  applied_at?: string | null;
  last_status_at?: string | null;
  created_at: string;
  updated_at: string;
}
const STAGES: JobStage[] = ["APPLIED","UNDER_REVIEW","OA","INTERVIEW","OFFER"];
const DECISIONS: JobDecision[] = ["PENDING","REJECTED","OFFER_ACCEPTED","WITHDRAWN"];

/** ---------- Utils ---------- **/
const cx = (...xs: Array<string | false | undefined>) => xs.filter(Boolean).join(" ");
const fmtDate = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
};

/** ---------- UI bits ---------- **/
function Badge({ decision, stage }: { decision: JobDecision; stage: JobStage }) {
  // pastel on light, translucent brights on dark
  let light = "bg-slate-200 text-slate-900";
  if (decision === "REJECTED") light = "bg-rose-200 text-rose-900";
  else if (decision === "OFFER_ACCEPTED") light = "bg-emerald-200 text-emerald-900";
  else if (decision === "WITHDRAWN") light = "bg-zinc-200 text-zinc-900";
  else {
    if (stage === "UNDER_REVIEW") light = "bg-amber-200 text-amber-900";
    else if (stage === "OA") light = "bg-sky-200 text-sky-900";
    else if (stage === "INTERVIEW") light = "bg-indigo-200 text-indigo-900";
    else if (stage === "OFFER") light = "bg-purple-200 text-purple-900";
  }

  // dark variants (soft tint bg + light text)
  const darkMap: Record<string, string> = {
    REJECTED: "bg-rose-500/20 text-rose-200",
    OFFER_ACCEPTED: "bg-emerald-500/20 text-emerald-200",
    WITHDRAWN: "bg-zinc-500/20 text-zinc-200",
    UNDER_REVIEW: "bg-amber-500/20 text-amber-200",
    OA: "bg-sky-500/20 text-sky-200",
    INTERVIEW: "bg-indigo-500/20 text-indigo-200",
    OFFER: "bg-purple-500/20 text-purple-200",
    default: "bg-slate-500/20 text-slate-200",
  };
  const dark =
    decision === "PENDING"
      ? darkMap[stage] || darkMap.default
      : darkMap[decision] || darkMap.default;

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        light,
        `dark:${dark.split(" ").join(" dark:")}` // apply both dark classes
      )}
    >
      {decision === "PENDING" ? stage : decision}
    </span>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }
) {
  const { className = "", variant = "secondary", ...rest } = props;
  const map: Record<BtnVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  return <button className={cx(map[variant], className)} {...rest} />;
}

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-1 text-3xl font-semibold leading-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Field({ label, children, required }: React.PropsWithChildren<{ label: string; required?: boolean }>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}{required && <span className="text-rose-600 dark:text-rose-400"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }: React.PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border bg-white p-6 shadow-xl dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/** ---------- Main App ---------- **/
export default function App() {
  // theme (explicit toggle between light / dark)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  // data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [filterStage, setFilterStage] = useState<string>("");
  const [filterDecision, setFilterDecision] = useState<string>("");
  const [searchCompany, setSearchCompany] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "priority" | "company">("recent");

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<Job>>({
    priority: 3, stage: "APPLIED", decision: "PENDING"
  });

  // transition modal
  const [transitionTarget, setTransitionTarget] = useState<Job | null>(null);
  const [transitionForm, setTransitionForm] = useState<{ stage?: JobStage; decision?: JobDecision; note?: string }>({});
  const [transitioning, setTransitioning] = useState(false);

  const fetchJobs = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStage) params.set("stage", filterStage);
      if (filterDecision) params.set("decision", filterDecision);
      if (searchCompany) params.set("company", searchCompany);
      const res = await fetch(`${API_BASE}/applications?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobs(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchJobs(); /* eslint-disable-next-line */ }, [filterStage, filterDecision]);

  const sorted = useMemo(() => {
    const c = [...jobs];
    if (sortBy === "recent") c.sort((a, b) => (new Date(b.last_status_at ?? 0).getTime()) - (new Date(a.last_status_at ?? 0).getTime()));
    if (sortBy === "priority") c.sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));
    if (sortBy === "company") c.sort((a, b) => a.company_name.localeCompare(b.company_name));
    return c;
  }, [jobs, sortBy]);

  const stats = useMemo(() => {
    const byDecision: Record<JobDecision, number> = { PENDING: 0, REJECTED: 0, OFFER_ACCEPTED: 0, WITHDRAWN: 0 };
    for (const j of jobs) byDecision[j.decision] = (byDecision[j.decision] || 0) + 1;
    return { total: jobs.length, byDecision };
  }, [jobs]);

  const submitCreate = async () => {
    setCreating(true);
    try {
      const payload = {
        company_name: (createForm.company_name || "").trim(),
        role_title: (createForm.role_title || "").trim(),
        location: (createForm.location || "").trim() || null,
        source: (createForm.source || "").trim() || null,
        apply_url: createForm.apply_url || null,
        stage: (createForm.stage as JobStage) || "APPLIED",
        decision: (createForm.decision as JobDecision) || "PENDING",
        priority: Number(createForm.priority ?? 3),
        notes: createForm.notes || null,
      };
      const res = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowCreate(false);
      setCreateForm({ priority: 3, stage: "APPLIED", decision: "PENDING" });
      await fetchJobs();
    } catch (e: any) { alert(`Create failed: ${e?.message || e}`); }
    finally { setCreating(false); }
  };

  const openTransition = (job: Job) => {
    setTransitionTarget(job);
    setTransitionForm({ stage: job.stage, decision: job.decision, note: "" });
  };
  const submitTransition = async () => {
    if (!transitionTarget) return;
    setTransitioning(true);
    try {
      const res = await fetch(`${API_BASE}/applications/${transitionTarget.id}/transition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transitionForm),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTransitionTarget(null);
      setTransitionForm({});
      await fetchJobs();
    } catch (e: any) { alert(`Update failed: ${e?.message || e}`); }
    finally { setTransitioning(false); }
  };
  const del = async (job: Job) => {
    if (!confirm(`Delete ${job.company_name} – ${job.role_title}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/applications/${job.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      await fetchJobs();
    } catch (e: any) { alert(`Delete failed: ${e?.message || e}`); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      {/* Decorative band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-200/70 to-transparent dark:from-slate-800/60" />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 dark:border-slate-800/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white grid place-items-center text-lg font-bold shadow dark:bg-slate-100 dark:text-slate-900">J</div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Jobby</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">A clean tracker for your applications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleTheme}>Theme</Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>+ New application</Button>
            <Button variant="secondary" onClick={fetchJobs}>Refresh</Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-5">
          <section className="card">
            <div className="mb-4 text-sm font-semibold">Filters</div>
            <div className="space-y-4">
              <Field label="Stage">
                <select className="form-select" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                  <option value="">All</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Decision">
                <select className="form-select" value={filterDecision} onChange={(e) => setFilterDecision(e.target.value)}>
                  <option value="">All</option>
                  {DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Company search">
                <div className="flex gap-2">
                  <input className="form-control" placeholder="e.g., Google, Emerson, SAP" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)} />
                  <Button variant="secondary" onClick={fetchJobs}>Apply</Button>
                </div>
              </Field>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <Card title="Total" value={stats.total} />
            <Card title="Pending" value={stats.byDecision.PENDING || 0} />
            <Card title="Rejected" value={stats.byDecision.REJECTED || 0} />
            <Card title="Offers" value={stats.byDecision.OFFER_ACCEPTED || 0} />
          </section>
        </aside>

        {/* Table */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {loading ? "Loading…" : error ? <span className="text-rose-600 dark:text-rose-400">{error}</span> : `${sorted.length} result${sorted.length === 1 ? "" : "s"}`}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by</span>
              <select className="form-select text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="recent">Most recent update</option>
                <option value="priority">Priority (low→high)</option>
                <option value="company">Company A→Z</option>
              </select>
            </div>
          </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200/20 dark:border-slate-700/30 shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              {/* Scrollable content */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600/70">
                <table className="min-w-full table-auto border-collapse text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold w-[18%] rounded-tl-2xl">Company</th>
                      <th className="px-4 py-3 text-left font-semibold w-[18%]">Role</th>
                      <th className="px-4 py-3 text-left font-semibold w-[20%] hidden md:table-cell">Source</th>
                      <th className="px-4 py-3 text-left font-semibold w-[8%] hidden md:table-cell">Priority</th>
                      <th className="px-4 py-3 text-left font-semibold w-[14%]">Status</th>
                      <th className="px-4 py-3 text-left font-semibold w-[12%] hidden md:table-cell whitespace-nowrap">Last update</th>
                      <th className="px-4 py-3 text-right font-semibold w-[10%] rounded-tr-2xl">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sorted.map((j) => (
                      <tr
                        key={j.id}
                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{j.company_name}</td>
                        <td className="px-4 py-3">{j.role_title}</td>
                        <td className="px-4 py-3 hidden md:table-cell max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {j.source ? (
                            <a
                              href={j.apply_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title={j.source}
                            >
                              {j.source}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-center">{j.priority ?? 3}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge decision={j.decision} stage={j.stage} />
                            {j.apply_url && (
                              <a
                                href={j.apply_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs underline text-slate-400 hover:text-slate-200 transition-colors"
                              >
                                link
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-sm whitespace-nowrap">
                          {fmtDate(j.last_status_at)}
                        </td>
                        <td className="px-4 py-3 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="secondary" onClick={() => openTransition(j)}>
                              Update
                            </Button>
                            <Button variant="danger" onClick={() => del(j)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center">
                          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            No applications match the current filters.
                          </div>
                          <div className="mt-3">
                            <Button variant="primary" onClick={() => setShowCreate(true)}>
                              Add your first application
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Smooth right edge fade */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l from-slate-950/70 via-slate-950/20 to-transparent rounded-r-2xl" />
            </div>
        </section>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="New application" onClose={() => setShowCreate(false)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Company" required><input className="form-control" value={createForm.company_name || ""} onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })} /></Field>
            <Field label="Role" required><input className="form-control" value={createForm.role_title || ""} onChange={(e) => setCreateForm({ ...createForm, role_title: e.target.value })} /></Field>
            <Field label="Location"><input className="form-control" value={createForm.location || ""} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} /></Field>
            <Field label="Source"><input className="form-control" placeholder="e.g., LinkedIn, Referral" value={createForm.source || ""} onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })} /></Field>
            <Field label="Apply URL"><input className="form-control" placeholder="https://…" value={createForm.apply_url || ""} onChange={(e) => setCreateForm({ ...createForm, apply_url: e.target.value })} /></Field>
            <Field label="Priority"><input type="number" min={1} max={5} className="form-control" value={createForm.priority as any} onChange={(e) => setCreateForm({ ...createForm, priority: Number(e.target.value) })} /></Field>
            <Field label="Stage"><select className="form-select" value={(createForm.stage as JobStage) || "APPLIED"} onChange={(e) => setCreateForm({ ...createForm, stage: e.target.value as JobStage })}>{STAGES.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="Decision"><select className="form-select" value={(createForm.decision as JobDecision) || "PENDING"} onChange={(e) => setCreateForm({ ...createForm, decision: e.target.value as JobDecision })}>{DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Notes"><textarea className="form-textarea" rows={4} value={createForm.notes || ""} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} /></Field></div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" disabled={creating} onClick={submitCreate}>{creating ? "Creating…" : "Create"}</Button>
          </div>
        </Modal>
      )}

      {/* Transition Modal */}
      {transitionTarget && (
        <Modal title={`Update: ${transitionTarget.company_name}`} onClose={() => setTransitionTarget(null)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Stage"><select className="form-select" value={transitionForm.stage || transitionTarget.stage} onChange={(e) => setTransitionForm({ ...transitionForm, stage: e.target.value as JobStage })}>{STAGES.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="Decision"><select className="form-select" value={transitionForm.decision || transitionTarget.decision} onChange={(e) => setTransitionForm({ ...transitionForm, decision: e.target.value as JobDecision })}>{DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Note (optional)"><textarea className="form-textarea" rows={4} placeholder="e.g., HR email; scheduled phone screen" value={transitionForm.note || ""} onChange={(e) => setTransitionForm({ ...transitionForm, note: e.target.value })} /></Field></div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTransitionTarget(null)}>Cancel</Button>
            <Button variant="primary" disabled={transitioning} onClick={submitTransition}>{transitioning ? "Saving…" : "Save"}</Button>
          </div>
        </Modal>
      )}

      <footer className="mx-auto mt-10 max-w-7xl px-6 pb-10 text-center text-xs text-slate-500 dark:text-slate-400">
        Built with FastAPI + React + Tailwind
      </footer>
    </div>
  );
}
