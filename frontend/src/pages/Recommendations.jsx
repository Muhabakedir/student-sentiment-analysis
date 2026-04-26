import { useMemo, useState } from "react";
import { useLiveData } from "../hooks/useLiveData";
import {
  AlertTriangle, CheckCircle, Info, ArrowRight, Clock,
  Shield, Target, TrendingUp, FileText, ChevronDown, ChevronUp,
  Printer, BarChart3, Zap,
} from "lucide-react";

const RULES = [
  // ── Teaching / Learning Process ──────────────────────────────
  { theme: "Clarity of instruction", service: "Teaching & Learning", threshold: 3, priority: "high", recommendation: "Provide instructor training on clear communication and structured lesson delivery.", action: "Schedule pedagogical workshops for all teaching staff this semester.", timeline: "1–2 months", impact: "High" },
  { theme: "Instructor support and interaction", service: "Teaching & Learning", threshold: 3, priority: "high", recommendation: "Mandate regular office hours and enforce response time policies for student queries.", action: "Implement a 48-hour response policy for student emails and questions.", timeline: "2–4 weeks", impact: "High" },
  { theme: "Learning materials", service: "Teaching & Learning", threshold: 3, priority: "medium", recommendation: "Review and update course materials to ensure relevance and completeness.", action: "Conduct annual curriculum review with faculty to update outdated resources.", timeline: "3–6 months", impact: "Medium" },
  { theme: "Classroom/learning environment", service: "Teaching & Learning", threshold: 3, priority: "medium", recommendation: "Improve classroom facilities including seating, lighting, and acoustics.", action: "Audit all classrooms and prioritize upgrades for the worst-rated spaces.", timeline: "6–12 months", impact: "Medium" },
  { theme: "Student engagement", service: "Teaching & Learning", threshold: 3, priority: "medium", recommendation: "Implement interactive teaching methods to boost student participation.", action: "Train faculty on active learning techniques and introduce clicker/polling tools in lectures.", timeline: "1–3 months", impact: "Medium" },
  { theme: "Use of technology in teaching", service: "Teaching & Learning", threshold: 3, priority: "high", recommendation: "Invest in educational technology and train faculty on digital pedagogy.", action: "Deploy a learning management system and mandate technology integration workshops.", timeline: "3–6 months", impact: "High" },
  { theme: "Fairness of assessment", service: "Teaching & Learning", threshold: 3, priority: "high", recommendation: "Establish a transparent grading rubric and review assessment design.", action: "Introduce peer review of exam papers and publish grading criteria to students.", timeline: "1–2 months", impact: "High" },
  { theme: "Practically supported teaching environment", service: "Teaching & Learning", threshold: 3, priority: "high", recommendation: "Invest in practical lab facilities and hands-on learning resources.", action: "Audit all lab equipment, replace outdated tools, and schedule regular practical sessions alongside theory.", timeline: "6–12 months", impact: "High" },
  { theme: "Other teaching/learning issues", service: "Teaching & Learning", threshold: 3, priority: "medium", recommendation: "Establish a dedicated feedback review committee for unresolved teaching concerns.", action: "Form a student-faculty committee to review and act on miscellaneous teaching issues each term.", timeline: "1–3 months", impact: "Medium" },

  // ── Library Service ──────────────────────────────────────────
  { theme: "Availability of materials", service: "Library", threshold: 3, priority: "high", recommendation: "Increase library budget to acquire more copies of high-demand textbooks.", action: "Conduct a demand analysis and procure additional copies of top-requested titles.", timeline: "2–4 months", impact: "High" },
  { theme: "Study space", service: "Library", threshold: 3, priority: "medium", recommendation: "Expand and improve study areas with better seating, lighting, and quiet zones.", action: "Convert underutilized library sections into dedicated study zones with power outlets.", timeline: "3–6 months", impact: "Medium" },
  { theme: "Cleanliness", service: "Library", threshold: 3, priority: "high", recommendation: "Increase cleaning frequency and establish hygiene standards across campus facilities.", action: "Hire additional cleaning staff and introduce daily inspection logs for all common areas.", timeline: "2–4 weeks", impact: "High" },
  { theme: "Staff behavior", service: "Library", threshold: 3, priority: "high", recommendation: "Implement staff training on professional conduct and customer service.", action: "Launch a mandatory service excellence training program with quarterly evaluations.", timeline: "1–3 months", impact: "High" },
  { theme: "Opening hours", service: "Library", threshold: 3, priority: "medium", recommendation: "Extend library operating hours, especially during exam periods.", action: "Pilot 24/7 access during finals week and evaluate feasibility for permanent extension.", timeline: "1–2 months", impact: "Medium" },
  { theme: "Internet access", service: "Library", threshold: 3, priority: "critical", recommendation: "Expand WiFi coverage to all campus areas including libraries and study spaces.", action: "Install additional access points and ensure minimum 10 Mbps per user in study areas.", timeline: "1–3 months", impact: "Critical" },
  { theme: "Other library issues", service: "Library", threshold: 3, priority: "medium", recommendation: "Conduct a comprehensive library service review addressing all unresolved concerns.", action: "Commission an annual library satisfaction survey and act on top 5 issues within 60 days.", timeline: "3–6 months", impact: "Medium" },

  // ── ICT / Internet Services ──────────────────────────────────
  { theme: "Internet speed", service: "ICT & Internet", threshold: 3, priority: "critical", recommendation: "Upgrade network infrastructure to support higher bandwidth demands.", action: "Procure a higher-tier ISP plan and install additional access points across campus.", timeline: "1–3 months", impact: "Critical" },
  { theme: "Network stability", service: "ICT & Internet", threshold: 3, priority: "critical", recommendation: "Invest in redundant network systems to eliminate frequent outages.", action: "Deploy failover connections and conduct monthly network stability audits.", timeline: "2–4 months", impact: "Critical" },
  { theme: "Computer lab availability", service: "ICT & Internet", threshold: 3, priority: "high", recommendation: "Increase the number of available computers or implement a booking system.", action: "Install an online lab booking system and expand lab capacity by 30%.", timeline: "3–6 months", impact: "High" },
  { theme: "Access to systems/platforms", service: "ICT & Internet", threshold: 3, priority: "high", recommendation: "Ensure all academic platforms are accessible and reliably available.", action: "Implement SSO for all platforms and maintain 99.5% uptime SLA with vendors.", timeline: "2–4 months", impact: "High" },
  { theme: "Technical support", service: "ICT & Internet", threshold: 3, priority: "high", recommendation: "Hire additional IT support staff and establish a ticketing system.", action: "Deploy a helpdesk ticketing platform with SLA-based response time tracking.", timeline: "1–3 months", impact: "High" },
  { theme: "Equipment quality", service: "ICT & Internet", threshold: 3, priority: "high", recommendation: "Audit and replace outdated computer and lab equipment across campus.", action: "Create a 3-year equipment replacement cycle and budget for annual upgrades.", timeline: "6–12 months", impact: "High" },

  // ── Registrar & Records Services ─────────────────────────────
  { theme: "System reliability", service: "Registrar & Records", threshold: 3, priority: "critical", recommendation: "Upgrade the student information system to prevent crashes during peak periods.", action: "Migrate to a cloud-based SIS with auto-scaling capabilities before next enrollment.", timeline: "6–12 months", impact: "Critical" },
  { theme: "Waiting time", service: "Registrar & Records", threshold: 3, priority: "high", recommendation: "Digitize registrar processes to reduce in-person queuing.", action: "Launch an online appointment booking system for all registrar services.", timeline: "2–4 months", impact: "High" },
  { theme: "Staff support", service: "Registrar & Records", threshold: 3, priority: "medium", recommendation: "Improve staff responsiveness and support quality at registrar offices.", action: "Implement a customer service training program and set maximum wait-time standards.", timeline: "1–3 months", impact: "Medium" },
  { theme: "Information clarity", service: "Registrar & Records", threshold: 3, priority: "medium", recommendation: "Improve communication of policies, procedures, and requirements to students.", action: "Publish a student-friendly FAQ portal and simplify all official correspondence.", timeline: "1–2 months", impact: "Medium" },
  { theme: "Process speed", service: "Registrar & Records", threshold: 3, priority: "high", recommendation: "Streamline administrative processes to reduce turnaround times.", action: "Digitize paper-based workflows and set a 3-day processing SLA for standard requests.", timeline: "2–4 months", impact: "High" },
  { theme: "Error handling", service: "Registrar & Records", threshold: 3, priority: "high", recommendation: "Establish a dedicated error correction team with clear resolution timelines.", action: "Create a student records error portal with a guaranteed 5-business-day resolution SLA.", timeline: "1–3 months", impact: "High" },

  // ── Cafeteria Services ───────────────────────────────────────
  { theme: "Food quality", service: "Cafeteria", threshold: 3, priority: "high", recommendation: "Conduct regular food quality audits and replace underperforming vendors.", action: "Introduce monthly food quality inspections and a student feedback rating system.", timeline: "1–2 months", impact: "High" },
  { theme: "Price", service: "Cafeteria", threshold: 3, priority: "high", recommendation: "Review cafeteria pricing policy and introduce subsidized meal plans for students.", action: "Partner with student government to design an affordable meal plan starting next term.", timeline: "2–4 months", impact: "High" },
  { theme: "Hygiene", service: "Cafeteria", threshold: 3, priority: "critical", recommendation: "Enforce strict hygiene standards and conduct surprise health inspections.", action: "Hire a dedicated food safety officer and schedule bi-weekly kitchen inspections.", timeline: "Immediate", impact: "Critical" },
  { theme: "Variety of food", service: "Cafeteria", threshold: 3, priority: "medium", recommendation: "Diversify the menu to include more dietary options including vegetarian and halal.", action: "Survey students on dietary preferences and update menu quarterly.", timeline: "1–3 months", impact: "Medium" },
  { theme: "Seating space", service: "Cafeteria", threshold: 3, priority: "medium", recommendation: "Expand seating capacity in dining areas to reduce overcrowding.", action: "Redesign cafeteria layout for optimal space use and add outdoor seating options.", timeline: "3–6 months", impact: "Medium" },

  // ── Dormitory / Housing Services ─────────────────────────────
  { theme: "Water availability", service: "Dormitory & Housing", threshold: 3, priority: "critical", recommendation: "Repair water infrastructure and install backup water storage systems.", action: "Conduct emergency plumbing audit and install 10,000L reserve tanks per dormitory block.", timeline: "Immediate", impact: "Critical" },
  { theme: "Safety/security", service: "Dormitory & Housing", threshold: 3, priority: "critical", recommendation: "Increase security personnel and install CCTV coverage across all dormitory areas.", action: "Deploy 24/7 security patrols and install access control systems at all entry points.", timeline: "1–3 months", impact: "Critical" },
  { theme: "Maintenance", service: "Dormitory & Housing", threshold: 3, priority: "high", recommendation: "Establish a responsive maintenance request system with guaranteed response times.", action: "Launch a mobile maintenance request app with 48-hour resolution guarantee.", timeline: "2–4 months", impact: "High" },
  { theme: "Room space", service: "Dormitory & Housing", threshold: 3, priority: "medium", recommendation: "Address overcrowding in dormitory rooms and review occupancy limits.", action: "Conduct a space audit and reduce maximum occupancy to meet international standards.", timeline: "6–12 months", impact: "Medium" },
  { theme: "Sanitation facilities", service: "Dormitory & Housing", threshold: 3, priority: "critical", recommendation: "Increase cleaning frequency and ensure adequate sanitation supplies at all times.", action: "Hire additional cleaning staff and implement hourly bathroom inspection logs.", timeline: "Immediate", impact: "Critical" },
];

const PRIORITY_CONFIG = {
  critical: { label: "Critical", icon: AlertTriangle, bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-300 dark:border-rose-800", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300", iconColor: "text-rose-500", accent: "bg-rose-500" },
  high:     { label: "High", icon: Target, bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-300 dark:border-orange-800", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300", iconColor: "text-orange-500", accent: "bg-orange-500" },
  medium:   { label: "Medium", icon: Info, bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-300 dark:border-amber-800", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300", iconColor: "text-amber-500", accent: "bg-amber-500" },
};

const SERVICE_ICONS = {
  "Teaching & Learning": BarChart3,
  "Library": FileText,
  "ICT & Internet": Zap,
  "Registrar & Records": Shield,
  "Cafeteria": Target,
  "Dormitory & Housing": AlertTriangle,
};

export default function Recommendations() {
  const { feedback, stats, loading, isLive } = useLiveData();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filterPriority, setFilterPriority] = useState("all");

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

  const groupedRecs = useMemo(() => {
    const filtered = filterPriority === "all" ? activeRecs : activeRecs.filter(r => r.priority === filterPriority);
    const groups = {};
    filtered.forEach(rec => {
      if (!groups[rec.service]) groups[rec.service] = [];
      groups[rec.service].push(rec);
    });
    return groups;
  }, [activeRecs, filterPriority]);

  const criticalCount = activeRecs.filter(r => r.priority === "critical").length;
  const highCount     = activeRecs.filter(r => r.priority === "high").length;
  const mediumCount   = activeRecs.filter(r => r.priority === "medium").length;
  const totalNegative = Object.values(negativeByTheme).reduce((a, b) => a + b, 0);
  const riskScore     = Math.min(100, (criticalCount * 25) + (highCount * 10) + (mediumCount * 3));

  const toggleGroup = (service) => setExpandedGroups(prev => ({ ...prev, [service]: !prev[service] }));

  const handlePrint = () => window.print();

  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      {/* ── Executive Header ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-gray-900 dark:to-gray-900 px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-white/80" size={24} />
                <h1 className="text-xl font-bold text-white">Actionable Recommendations Report</h1>
              </div>
              <p className="text-sm text-white/70">University Student Feedback Analysis — BERT-Powered Sentiment Engine</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
                ${isLive
                  ? "bg-green-500/20 text-green-100 border border-green-400/40"
                  : "bg-amber-500/20 text-amber-100 border border-amber-400/40"
                }`}>
                <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
                {isLive ? "Live Data" : "Offline"}
              </span>
              <button onClick={handlePrint} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors" title="Print Report">
                <Printer size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-600 border-b border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1.5"><Clock size={12} /> {reportDate} at {reportTime}</span>
          <span className="flex items-center gap-1.5"><BarChart3 size={12} /> {stats.total || 0} total feedback analyzed</span>
          <span className="flex items-center gap-1.5"><AlertTriangle size={12} /> {totalNegative} negative responses detected</span>
          <span>Threshold: 3+ negative responses per theme</span>
        </div>
      </div>

      {/* ── Risk Score & KPI Summary ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-3">Institutional Risk Score</p>
          <div className="flex items-end gap-3">
            <p className={`text-4xl font-bold ${riskScore >= 60 ? "text-rose-600 dark:text-rose-400" : riskScore >= 30 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {riskScore}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 pb-1">/100</p>
          </div>
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${riskScore >= 60 ? "bg-rose-500" : riskScore >= 30 ? "bg-orange-500" : "bg-emerald-500"}`} style={{ width: `${riskScore}%` }} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">{riskScore >= 60 ? "Immediate action required" : riskScore >= 30 ? "Action recommended" : "Within acceptable range"}</p>
        </div>

        {/* Critical */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">Critical</p>
          </div>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{criticalCount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Requires immediate intervention</p>
        </div>

        {/* High */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">High Priority</p>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{highCount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Action within 1–3 months</p>
        </div>

        {/* Medium */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">Medium</p>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{mediumCount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Plan within 3–6 months</p>
        </div>
      </div>

      {/* ── Priority Filter ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mr-1">Filter:</span>
        {["all", "critical", "high", "medium"].map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
              ${filterPriority === p
                ? "bg-violet-100 text-violet-700 border-violet-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-black dark:text-gray-600 dark:border-gray-800 dark:hover:bg-gray-900"
              }`}
          >
            {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-600 ml-2">{Object.values(groupedRecs).flat().length} recommendations</span>
      </div>

      {/* ── Recommendations by Service ───────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeRecs.length === 0 ? (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-300">All Systems Performing Within Acceptable Thresholds</p>
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2 max-w-md mx-auto">
            No themes have exceeded the negative feedback threshold of 3 responses. Continue monitoring to detect emerging issues early.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRecs).map(([service, recs]) => {
            const ServiceIcon = SERVICE_ICONS[service] || FileText;
            const isExpanded = expandedGroups[service] !== false;
            const serviceCritical = recs.filter(r => r.priority === "critical").length;
            const serviceHigh = recs.filter(r => r.priority === "high").length;

            return (
              <div key={service} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                {/* Service Header */}
                <button
                  onClick={() => toggleGroup(service)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-gray-800 flex items-center justify-center">
                      <ServiceIcon size={16} className="text-violet-600 dark:text-gray-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300">{service}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-600">{recs.length} recommendation{recs.length !== 1 ? "s" : ""} · {recs.reduce((a, r) => a + r.count, 0)} negative responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {serviceCritical > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">{serviceCritical} Critical</span>
                    )}
                    {serviceHigh > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{serviceHigh} High</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Service Recommendations */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                    {recs.map((rec, i) => {
                      const config = PRIORITY_CONFIG[rec.priority];
                      const Icon = config.icon;
                      return (
                        <div key={i} className={`px-6 py-5 ${config.bg} transition-all`}>
                          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            {/* Left: Priority + Theme */}
                            <div className="flex items-start gap-3 lg:w-64 shrink-0">
                              <div className={`p-2 rounded-lg ${config.badge} shrink-0`}>
                                <Icon size={14} />
                              </div>
                              <div>
                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge} mb-1`}>{config.label}</span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">{rec.theme}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5">{rec.count} negative response{rec.count !== 1 ? "s" : ""}</p>
                              </div>
                            </div>

                            {/* Right: Recommendation + Action */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-1">Recommendation</p>
                              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{rec.recommendation}</p>

                              <div className="mt-3 bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <ArrowRight size={12} className="text-violet-500 dark:text-gray-500" />
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">Action Step</p>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{rec.action}</p>
                              </div>

                              <div className="flex items-center gap-4 mt-3">
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-600">
                                  <Clock size={11} /> {rec.timeline}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-600">
                                  <TrendingUp size={11} /> Impact: {rec.impact}
                                </span>
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
          })}
        </div>
      )}

      {/* ── Methodology Footer ────────────────────────────────────── */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-violet-600 dark:text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300">Methodology & Disclaimer</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-600 space-y-2 leading-relaxed">
          <p>
            This report is generated from {isLive ? "live BERT-analyzed" : "submitted"} student feedback data using the
            <span className="font-medium text-gray-700 dark:text-gray-400"> {isLive ? "muhabakedir880/student-sentiment-analysis" : "lexicon-based fallback"} </span>
            sentiment classification model. Recommendations are triggered when a specific theme accumulates 3 or more negative sentiment responses.
          </p>
          <p>
            The <span className="font-medium text-gray-700 dark:text-gray-400">Institutional Risk Score</span> is calculated as: (Critical × 25) + (High × 10) + (Medium × 3), capped at 100.
            Scores ≥60 indicate immediate action is required; 30–59 suggest planned intervention; &lt;30 is within acceptable range.
          </p>
          <p>
            All recommendations are advisory and should be reviewed by the appropriate administrative body before implementation.
            Student identities remain anonymous — feedback is linked only via hashed session identifiers.
          </p>
        </div>
      </div>
    </div>
  );
}
