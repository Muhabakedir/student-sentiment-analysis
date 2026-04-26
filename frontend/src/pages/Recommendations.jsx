import { useMemo } from "react";
import { useLiveData } from "../hooks/useLiveData";
import { AlertTriangle, CheckCircle, Info, ArrowRight } from "lucide-react";

const RULES = [
  // ── Teaching / Learning Process ──────────────────────────────
  { theme: "Clarity of instruction", threshold: 3, priority: "high", recommendation: "Provide instructor training on clear communication and structured lesson delivery.", action: "Schedule pedagogical workshops for all teaching staff this semester." },
  { theme: "Instructor support and interaction", threshold: 3, priority: "high", recommendation: "Mandate regular office hours and enforce response time policies for student queries.", action: "Implement a 48-hour response policy for student emails and questions." },
  { theme: "Learning materials", threshold: 3, priority: "medium", recommendation: "Review and update course materials to ensure relevance and completeness.", action: "Conduct annual curriculum review with faculty to update outdated resources." },
  { theme: "Classroom/learning environment", threshold: 3, priority: "medium", recommendation: "Improve classroom facilities including seating, lighting, and acoustics.", action: "Audit all classrooms and prioritize upgrades for the worst-rated spaces." },
  { theme: "Student engagement", threshold: 3, priority: "medium", recommendation: "Implement interactive teaching methods to boost student participation.", action: "Train faculty on active learning techniques and introduce clicker/polling tools in lectures." },
  { theme: "Use of technology in teaching", threshold: 3, priority: "high", recommendation: "Invest in educational technology and train faculty on digital pedagogy.", action: "Deploy a learning management system and mandate technology integration workshops." },
  { theme: "Fairness of assessment", threshold: 3, priority: "high", recommendation: "Establish a transparent grading rubric and review assessment design.", action: "Introduce peer review of exam papers and publish grading criteria to students." },
  { theme: "Practically supported teaching environment", threshold: 3, priority: "high", recommendation: "Invest in practical lab facilities and hands-on learning resources.", action: "Audit all lab equipment, replace outdated tools, and schedule regular practical sessions alongside theory." },
  { theme: "Other teaching/learning issues", threshold: 3, priority: "medium", recommendation: "Establish a dedicated feedback review committee for unresolved teaching concerns.", action: "Form a student-faculty committee to review and act on miscellaneous teaching issues each term." },

  // ── Library Service ──────────────────────────────────────────
  { theme: "Availability of materials", threshold: 3, priority: "high", recommendation: "Increase library budget to acquire more copies of high-demand textbooks.", action: "Conduct a demand analysis and procure additional copies of top-requested titles." },
  { theme: "Study space", threshold: 3, priority: "medium", recommendation: "Expand and improve study areas with better seating, lighting, and quiet zones.", action: "Convert underutilized library sections into dedicated study zones with power outlets." },
  { theme: "Cleanliness", threshold: 3, priority: "high", recommendation: "Increase cleaning frequency and establish hygiene standards across campus facilities.", action: "Hire additional cleaning staff and introduce daily inspection logs for all common areas." },
  { theme: "Staff behavior", threshold: 3, priority: "high", recommendation: "Implement staff training on professional conduct and customer service.", action: "Launch a mandatory service excellence training program with quarterly evaluations." },
  { theme: "Opening hours", threshold: 3, priority: "medium", recommendation: "Extend library operating hours, especially during exam periods.", action: "Pilot 24/7 access during finals week and evaluate feasibility for permanent extension." },
  { theme: "Internet access", threshold: 3, priority: "critical", recommendation: "Expand WiFi coverage to all campus areas including libraries and study spaces.", action: "Install additional access points and ensure minimum 10 Mbps per user in study areas." },
  { theme: "Other library issues", threshold: 3, priority: "medium", recommendation: "Conduct a comprehensive library service review addressing all unresolved concerns.", action: "Commission an annual library satisfaction survey and act on top 5 issues within 60 days." },

  // ── ICT / Internet Services ──────────────────────────────────
  { theme: "Internet speed", threshold: 3, priority: "critical", recommendation: "Upgrade network infrastructure to support higher bandwidth demands.", action: "Procure a higher-tier ISP plan and install additional access points across campus." },
  { theme: "Network stability", threshold: 3, priority: "critical", recommendation: "Invest in redundant network systems to eliminate frequent outages.", action: "Deploy failover connections and conduct monthly network stability audits." },
  { theme: "Computer lab availability", threshold: 3, priority: "high", recommendation: "Increase the number of available computers or implement a booking system.", action: "Install an online lab booking system and expand lab capacity by 30%." },
  { theme: "Access to systems/platforms", threshold: 3, priority: "high", recommendation: "Ensure all academic platforms are accessible and reliably available.", action: "Implement SSO for all platforms and maintain 99.5% uptime SLA with vendors." },
  { theme: "Technical support", threshold: 3, priority: "high", recommendation: "Hire additional IT support staff and establish a ticketing system.", action: "Deploy a helpdesk ticketing platform with SLA-based response time tracking." },
  { theme: "Equipment quality", threshold: 3, priority: "high", recommendation: "Audit and replace outdated computer and lab equipment across campus.", action: "Create a 3-year equipment replacement cycle and budget for annual upgrades." },

  // ── Registrar & Records Services ─────────────────────────────
  { theme: "System reliability", threshold: 3, priority: "critical", recommendation: "Upgrade the student information system to prevent crashes during peak periods.", action: "Migrate to a cloud-based SIS with auto-scaling capabilities before next enrollment." },
  { theme: "Waiting time", threshold: 3, priority: "high", recommendation: "Digitize registrar processes to reduce in-person queuing.", action: "Launch an online appointment booking system for all registrar services." },
  { theme: "Staff support", threshold: 3, priority: "medium", recommendation: "Improve staff responsiveness and support quality at registrar offices.", action: "Implement a customer service training program and set maximum wait-time standards." },
  { theme: "Information clarity", threshold: 3, priority: "medium", recommendation: "Improve communication of policies, procedures, and requirements to students.", action: "Publish a student-friendly FAQ portal and simplify all official correspondence." },
  { theme: "Process speed", threshold: 3, priority: "high", recommendation: "Streamline administrative processes to reduce turnaround times.", action: "Digitize paper-based workflows and set a 3-day processing SLA for standard requests." },
  { theme: "Error handling", threshold: 3, priority: "high", recommendation: "Establish a dedicated error correction team with clear resolution timelines.", action: "Create a student records error portal with a guaranteed 5-business-day resolution SLA." },

  // ── Cafeteria Services ───────────────────────────────────────
  { theme: "Food quality", threshold: 3, priority: "high", recommendation: "Conduct regular food quality audits and replace underperforming vendors.", action: "Introduce monthly food quality inspections and a student feedback rating system." },
  { theme: "Price", threshold: 3, priority: "high", recommendation: "Review cafeteria pricing policy and introduce subsidized meal plans for students.", action: "Partner with student government to design an affordable meal plan starting next term." },
  { theme: "Hygiene", threshold: 3, priority: "critical", recommendation: "Enforce strict hygiene standards and conduct surprise health inspections.", action: "Hire a dedicated food safety officer and schedule bi-weekly kitchen inspections." },
  { theme: "Variety of food", threshold: 3, priority: "medium", recommendation: "Diversify the menu to include more dietary options including vegetarian and halal.", action: "Survey students on dietary preferences and update menu quarterly." },
  { theme: "Seating space", threshold: 3, priority: "medium", recommendation: "Expand seating capacity in dining areas to reduce overcrowding.", action: "Redesign cafeteria layout for optimal space use and add outdoor seating options." },

  // ── Dormitory / Housing Services ─────────────────────────────
  { theme: "Water availability", threshold: 3, priority: "critical", recommendation: "Repair water infrastructure and install backup water storage systems.", action: "Conduct emergency plumbing audit and install 10,000L reserve tanks per dormitory block." },
  { theme: "Safety/security", threshold: 3, priority: "critical", recommendation: "Increase security personnel and install CCTV coverage across all dormitory areas.", action: "Deploy 24/7 security patrols and install access control systems at all entry points." },
  { theme: "Maintenance", threshold: 3, priority: "high", recommendation: "Establish a responsive maintenance request system with guaranteed response times.", action: "Launch a mobile maintenance request app with 48-hour resolution guarantee." },
  { theme: "Room space", threshold: 3, priority: "medium", recommendation: "Address overcrowding in dormitory rooms and review occupancy limits.", action: "Conduct a space audit and reduce maximum occupancy to meet international standards." },
  { theme: "Sanitation facilities", threshold: 3, priority: "critical", recommendation: "Increase cleaning frequency and ensure adequate sanitation supplies at all times.", action: "Hire additional cleaning staff and implement hourly bathroom inspection logs." },
];

const PRIORITY_CONFIG = {
  critical: { label: "Critical", icon: AlertTriangle, bg: "bg-rose-500/15 dark:bg-rose-500/15", border: "border-rose-500/30 dark:border-rose-500/30", badge: "bg-rose-500/20 dark:bg-rose-500/20 text-rose-400 dark:text-rose-400", iconColor: "text-rose-400" },
  high:     { label: "High Priority", icon: AlertTriangle, bg: "bg-orange-500/15 dark:bg-orange-500/15", border: "border-orange-500/30 dark:border-orange-500/30", badge: "bg-orange-500/20 dark:bg-orange-500/20 text-orange-400 dark:text-orange-400", iconColor: "text-orange-400" },
  medium:   { label: "Medium", icon: Info, bg: "bg-amber-500/15 dark:bg-amber-500/15", border: "border-amber-500/30 dark:border-amber-500/30", badge: "bg-amber-500/20 dark:bg-amber-500/20 text-amber-400 dark:text-amber-400", iconColor: "text-amber-400" },
};

export default function Recommendations() {
  const { feedback, loading, isLive } = useLiveData();

  // Count negative feedback per theme from live/mock data
  const negativeByTheme = useMemo(() => {
    const map = {};
    feedback.filter(f => f.sentiment === "negative")
      .forEach(({ theme }) => { map[theme] = (map[theme] || 0) + 1; });
    return map;
  }, [feedback]);

  const activeRecs = useMemo(() => {
    return RULES
      .filter(rule => (negativeByTheme[rule.theme] || 0) >= rule.threshold)
      .map(rule => ({ ...rule, count: negativeByTheme[rule.theme] || 0 }))
      .sort((a, b) => ({ critical: 0, high: 1, medium: 2 }[a.priority] - { critical: 0, high: 1, medium: 2 }[b.priority]));
  }, [negativeByTheme]);

  const criticalCount = activeRecs.filter(r => r.priority === "critical").length;
  const highCount     = activeRecs.filter(r => r.priority === "high").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-slate-400 dark:text-slate-400">Total Recommendations</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
              ${isLive
                ? "bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-400 dark:text-emerald-400"
                : "bg-amber-500/20 dark:bg-amber-500/20 text-amber-400 dark:text-amber-400"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
          <p className="text-2xl font-bold text-white dark:text-white">{activeRecs.length}</p>
        </div>
        <div className="bg-rose-500/15 dark:bg-rose-500/15 rounded-2xl p-5 border border-rose-500/30 dark:border-rose-500/30">
          <p className="text-sm text-rose-400 dark:text-rose-400">Critical Issues</p>
          <p className="text-2xl font-bold text-rose-300 dark:text-rose-300">{criticalCount}</p>
        </div>
        <div className="bg-orange-500/15 dark:bg-orange-500/15 rounded-2xl p-5 border border-orange-500/30 dark:border-orange-500/30">
          <p className="text-sm text-orange-400 dark:text-orange-400">High Priority</p>
          <p className="text-2xl font-bold text-orange-300 dark:text-orange-300">{highCount}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-violet-500/15 dark:bg-violet-500/15 border border-violet-500/30 dark:border-violet-500/30 rounded-2xl px-5 py-4 flex gap-3">
        <Info size={16} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-sm text-violet-300 dark:text-violet-300">
          Recommendations are generated from {isLive ? "live BERT-analyzed" : "submitted"} feedback data.
          Thresholds trigger when a theme receives 3+ negative responses.
        </p>
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-violet-500/20 dark:bg-violet-500/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeRecs.length === 0 ? (
        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-10 text-center border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
          <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-sm font-medium text-slate-200 dark:text-slate-200">No issues detected</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">All themes are below the negative feedback threshold.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeRecs.map((rec, i) => {
            const config = PRIORITY_CONFIG[rec.priority];
            const Icon = config.icon;
            return (
              <div key={i} className={`rounded-2xl border p-5 ${config.bg} ${config.border} hover:shadow-md transition-all`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className={`p-2 rounded-xl bg-violet-900/40 dark:bg-violet-900/40 shrink-0 ${config.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}>{config.label}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-400 bg-violet-900/40 dark:bg-violet-900/40 px-2 py-0.5 rounded-full border border-violet-500/20 dark:border-violet-500/20">{rec.theme}</span>
                      <span className="text-xs text-rose-400 dark:text-rose-400">{rec.count} negative responses</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 dark:text-slate-200 mb-1">{rec.recommendation}</p>
                    <div className="flex items-start gap-1.5 mt-2">
                      <ArrowRight size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 dark:text-slate-400">{rec.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
