/**
 * useLiveData — fetches feedback + stats from the backend API with JWT auth.
 * Falls back to mock data if the API is not running or token is missing.
 */
import { useState, useEffect } from "react";
import API from "../config";

// Mock data for when backend is not available
const mockFeedback = [
  { id: 1, service: "Teaching/Learning Process", theme: "Clarity of instruction", text: "The lectures are very clear and well-structured. I understand the concepts easily.", sentiment: "positive", confidence: 0.95, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, service: "Library Service", theme: "Availability of materials", text: "Not enough copies of required textbooks. Always have to wait.", sentiment: "negative", confidence: 0.88, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, service: "ICT/Internet Services", theme: "Internet speed", text: "Internet is very slow during peak hours. Cannot access online resources.", sentiment: "negative", confidence: 0.92, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, service: "Cafeteria Services", theme: "Food quality", text: "The food quality has improved significantly this semester.", sentiment: "positive", confidence: 0.87, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, service: "Dormitory/Housing Services", theme: "Cleanliness", text: "The dormitory is generally clean but needs more frequent maintenance.", sentiment: "neutral", confidence: 0.75, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 6, service: "Registrar & Records Services", theme: "System reliability", text: "The online registration system keeps crashing during enrollment period.", sentiment: "negative", confidence: 0.91, created_at: new Date().toISOString() },
  { id: 7, service: "Teaching/Learning Process", theme: "Instructor support and interaction", text: "Professor is always available during office hours and responds to emails quickly.", sentiment: "positive", confidence: 0.93, created_at: new Date().toISOString() },
  { id: 8, service: "Library Service", theme: "Study space", text: "Library has excellent study spaces with good lighting and comfortable seating.", sentiment: "positive", confidence: 0.89, created_at: new Date().toISOString() },
  { id: 9, service: "ICT/Internet Services", theme: "Technical support", text: "IT support team is helpful but response time could be faster.", sentiment: "neutral", confidence: 0.72, created_at: new Date().toISOString() },
  { id: 10, service: "Cafeteria Services", theme: "Hygiene", text: "Cafeteria hygiene standards need improvement. Tables are often dirty.", sentiment: "negative", confidence: 0.85, created_at: new Date().toISOString() },
];

function authHeaders() {
  const token = sessionStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useLiveData({ dateFrom = "", dateTo = "" } = {}) {
  const [feedback, setFeedback]         = useState([]);
  const [stats, setStats]               = useState(null);
  const [serviceStats, setServiceStats] = useState([]);
  const [themeStats, setThemeStats]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isLive, setIsLive]             = useState(false);

  useEffect(() => {
    setLoading(true);
    const headers = authHeaders();

    // Build query string cleanly
    const buildQS = (extra = {}) => {
      const p = new URLSearchParams();
      if (dateFrom) p.set("date_from", dateFrom);
      if (dateTo)   p.set("date_to",   dateTo);
      Object.entries(extra).forEach(([k, v]) => v && p.set(k, v));
      const s = p.toString();
      return s ? `?${s}` : "";
    };

    Promise.all([
      fetch(`${API}/api/feedback${buildQS({ limit: 500 })}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/stats${buildQS()}`,              { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/stats/services${buildQS()}`,     { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/stats/themes${buildQS()}`,       { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([fb, st, svc, th]) => {
      if (fb && Array.isArray(fb)) {
        setFeedback(fb);
        setIsLive(true);
      } else {
        setFeedback(mockFeedback);
        setIsLive(false);
      }      if (st?.total !== undefined) setStats(st);
      if (Array.isArray(svc) && svc.length > 0) setServiceStats(svc);
      if (Array.isArray(th)  && th.length  > 0) setThemeStats(th);
      setLoading(false);
    });
  }, [dateFrom, dateTo]);

  const feedbackSource = feedback;

  const derivedStats = stats || (() => {
    const total    = feedbackSource.length;
    const positive = feedbackSource.filter(f => f.sentiment === "positive").length;
    const neutral  = feedbackSource.filter(f => f.sentiment === "neutral").length;
    const negative = feedbackSource.filter(f => f.sentiment === "negative").length;
    return { total, positive, neutral, negative };
  })();

  const derivedServiceStats = serviceStats.length > 0 ? serviceStats : (() => {
    const map = {};
    feedbackSource.forEach(({ service, sentiment }) => {
      if (!map[service]) map[service] = { service, positive: 0, neutral: 0, negative: 0, total: 0 };
      if (map[service][sentiment] !== undefined) map[service][sentiment]++;
      map[service].total++;
    });
    return Object.values(map);
  })();

  const derivedThemeStats = themeStats.length > 0 ? themeStats : (() => {
    const map = {};
    feedbackSource.forEach(({ theme, sentiment }) => {
      if (!map[theme]) map[theme] = { theme, positive: 0, neutral: 0, negative: 0, total: 0 };
      if (map[theme][sentiment] !== undefined) map[theme][sentiment]++;
      map[theme].total++;
    });
    return Object.values(map);
  })();

  return {
    feedback: feedbackSource,
    stats: derivedStats,
    serviceStats: derivedServiceStats,
    themeStats: derivedThemeStats,
    loading,
    isLive,
  };
}

export async function exportCSV({ dateFrom = "", dateTo = "", service = "", sentiment = "", theme = "" } = {}) {
  const p = new URLSearchParams();
  if (dateFrom)  p.set("date_from", dateFrom);
  if (dateTo)    p.set("date_to",   dateTo);
  if (service)   p.set("service",   service);
  if (sentiment) p.set("sentiment", sentiment);
  if (theme)     p.set("theme",     theme);

  const res = await fetch(`${API}/api/feedback/export?${p}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Export failed — make sure you are logged in and the backend is running.");

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
