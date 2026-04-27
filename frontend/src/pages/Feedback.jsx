import { useMemo, useState, useRef, useEffect } from "react";
import { useLiveData, exportCSV } from "../hooks/useLiveData";
import SentimentBadge from "../components/ui/SentimentBadge";
import Select from "../components/ui/Select";
import DateRangePicker from "../components/ui/DateRangePicker";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Search, X, Download, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SERVICES_LIST, ALL_THEMES } from "../data/mockData";

const PAGE_SIZE = 15;

// Generate and download a PDF from the filtered feedback rows
function exportPDF(rows, filters = {}) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("UniFeedback — Feedback Report", 14, 16);

  // Subtitle / filters applied
  const subtitle = [
    filters.service   && `Service: ${filters.service}`,
    filters.sentiment && `Sentiment: ${filters.sentiment}`,
    filters.theme     && `Theme: ${filters.theme}`,
    filters.dateFrom  && `From: ${filters.dateFrom}`,
    filters.dateTo    && `To: ${filters.dateTo}`,
  ].filter(Boolean).join("  |  ");

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(subtitle, 14, 23);
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Total: ${rows.length} entries`, 14, subtitle ? 29 : 23);

  autoTable(doc, {
    startY: subtitle ? 34 : 28,
    head: [["#", "Service", "Theme", "Feedback", "Sentiment", "Confidence", "Date"]],
    body: rows.map((r, i) => [
      i + 1,
      r.service,
      r.theme,
      r.text.length > 80 ? r.text.slice(0, 80) + "…" : r.text,
      r.sentiment,
      r.confidence > 0 ? `${(r.confidence * 100).toFixed(0)}%` : "—",
      r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10 },
      3: { cellWidth: 80 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 24 },
    },
    alternateRowStyles: { fillColor: [248, 248, 255] },
  });

  doc.save(`feedback_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function Feedback() {
  const [dates, setDates]                     = useState({ dateFrom: "", dateTo: "" });
  const { feedback, loading, isLive }         = useLiveData(dates);
  const [search, setSearch]                   = useState("");
  const [serviceFilter, setServiceFilter]     = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [themeFilter, setThemeFilter]         = useState("");
  const [page, setPage]                       = useState(1);
  const [exporting, setExporting]             = useState(false);
  const [showExportMenu, setShowExportMenu]   = useState(false);
  const exportRef                             = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const serviceOptions  = useMemo(() => SERVICES_LIST, []);
  const themeOptions    = useMemo(() => [...new Set(ALL_THEMES)].sort(), []);
  const sentimentOptions = ["positive", "neutral", "negative"];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return feedback.filter(f => {
      if (serviceFilter  && f.service   !== serviceFilter)  return false;
      if (sentimentFilter && f.sentiment !== sentimentFilter) return false;
      if (themeFilter    && f.theme     !== themeFilter)    return false;
      if (q && !f.text.toLowerCase().includes(q) && !f.theme.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [feedback, search, serviceFilter, sentimentFilter, themeFilter]);

  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleFilter = setter => val => { setter(val); setPage(1); };
  const clearFilters = () => { setSearch(""); setServiceFilter(""); setSentimentFilter(""); setThemeFilter(""); setPage(1); };
  const hasFilters = search || serviceFilter || sentimentFilter || themeFilter;

  const handleExportCSV = async () => {
    setShowExportMenu(false);
    setExporting(true);
    try {
      await exportCSV({
        dateFrom: dates.dateFrom,
        dateTo: dates.dateTo,
        service: serviceFilter,
        sentiment: sentimentFilter,
        theme: themeFilter,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    exportPDF(filtered, {
      service:   serviceFilter,
      sentiment: sentimentFilter,
      theme:     themeFilter,
      dateFrom:  dates.dateFrom,
      dateTo:    dates.dateTo,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-6 py-4 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search feedback..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            />
          </div>
          <Select value={serviceFilter}   onChange={handleFilter(setServiceFilter)}   options={serviceOptions}   placeholder="All Services" />
          <Select value={sentimentFilter} onChange={handleFilter(setSentimentFilter)} options={sentimentOptions} placeholder="All Sentiments" />
          <Select value={themeFilter}     onChange={handleFilter(setThemeFilter)}     options={themeOptions}     placeholder="All Themes" />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {/* Date range + export */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 flex-wrap">
            <DateRangePicker dateFrom={dates.dateFrom} dateTo={dates.dateTo} onChange={setDates} />
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filtered.length} of {feedback.length} entries
              </p>
              <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
                ${isLive
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                }`}>
                <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isLive ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu(v => !v)}
              disabled={exporting}
              title={!isLive ? "Connect backend to enable CSV export" : "Export feedback"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download size={16} />
              {exporting ? "Exporting..." : "Export"}
              <ChevronDown size={14} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                <button
                  onClick={handleExportCSV}
                  disabled={!isLive}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Download CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-800"
                >
                  <FileText size={16} className="text-rose-600 dark:text-rose-400" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Service</th>
                <th className="px-6 py-3 font-medium">Theme</th>
                <th className="px-6 py-3 font-medium">Feedback</th>
                <th className="px-6 py-3 font-medium">Sentiment</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    No feedback matches your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs">{item.id ?? (page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {item.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-500 whitespace-nowrap">{item.theme}</td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-300 max-w-xs">
                      <p className="line-clamp-2">{item.text}</p>
                    </td>
                    <td className="px-6 py-4"><SentimentBadge sentiment={item.sentiment} /></td>
                    <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-medium transition-colors ${p === page ? "bg-violet-600 text-white" : "text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
