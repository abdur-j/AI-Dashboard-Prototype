import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import Papa from "papaparse";
import {
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Bell, ChevronDown, TrendingUp, TrendingDown, AlertTriangle, Flame,
  Send, Sparkles, Clock, ChefHat, Radio, Ghost, DatabaseZap, ReceiptText,
  LayoutGrid, UtensilsCrossed, Users, Wallet, Trash2, Plus, CalendarDays, Lock,
  Sun, Moon, Carrot, Boxes, Scale, PackageSearch, Truck, Copy, Check, ClipboardCheck,
  Trash, Target, LineChart as LineChartIcon, Gauge, X, ArrowRight,
  Rss, Play, Pause, RotateCcw, FileText, Server, Upload, Download, MapPin,
} from "lucide-react";

/* Fixed tokens: the ink header bar and its accent cards are always dark,
   regardless of light/dark mode, so they need constants outside the theme swap. */
const BAR = "#1C1B1A";
const BAR_SOFT = "#2A2825";
const CREAM = "#EFEBE1";

const lightColors = {
  ink: "#1C1B1A",
  paper: "#EFEBE1",
  paperDark: "#E4DFD1",
  card: "#F6F3EA",
  brass: "#A8763A",
  brassLight: "#C79456",
  chili: "#B8402A",
  chiliSoft: "#E8CFC6",
  sage: "#5F7350",
  sageSoft: "#DAE2CF",
  amber: "#8A6A1B",
  amberSoft: "#F2E2B8",
  steel: "#6B6560",
  line: "#D8D0BC",
};

const darkColors = {
  ink: "#EFEAE0",
  paper: "#171310",
  paperDark: "#211C17",
  card: "#2A241D",
  brass: "#C08A4A",
  brassLight: "#E0AD70",
  chili: "#E2685A",
  chiliSoft: "#3A2019",
  sage: "#8FAE7C",
  sageSoft: "#22301B",
  amber: "#E8C878",
  amberSoft: "#3A2E14",
  steel: "#9C958A",
  line: "#3A342C",
};

const ThemeContext = createContext(lightColors);

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.live-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; animation: livePulse 1.8s ease-in-out infinite; }
@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(95,115,80,0.55); }
  70% { box-shadow: 0 0 0 5px rgba(95,115,80,0); }
  100% { box-shadow: 0 0 0 0 rgba(95,115,80,0); }
}
.pulse-badge { animation: badgePulse 2s ease-in-out infinite; }
@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
.fade-tick { animation: fadeTick 0.4s ease-out; }
@keyframes fadeTick {
  0% { opacity: 0.4; }
  100% { opacity: 1; }
}
.pl-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; }
.pl-c-12 { grid-column: span 12 / span 12; }
.pl-c-8 { grid-column: span 8 / span 8; }
.pl-c-7 { grid-column: span 7 / span 7; }
.pl-c-6 { grid-column: span 6 / span 6; }
.pl-c-5 { grid-column: span 5 / span 5; }
.pl-c-4 { grid-column: span 4 / span 4; }
.pl-c-3 { grid-column: span 3 / span 3; }
.pl-tiles { display: grid; gap: 12px; }
.pl-tiles-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pl-tiles-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pl-tiles-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.pl-tiles-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.pl-tiles-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.pl-tiles-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
@media (max-width: 900px) {
  .pl-grid { grid-template-columns: 1fr; gap: 20px; }
  .pl-grid > * { grid-column: span 1 / span 1 !important; }
  .pl-tiles-3, .pl-tiles-4, .pl-tiles-5, .pl-tiles-6, .pl-tiles-7 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .pl-tiles-2, .pl-tiles-3, .pl-tiles-4, .pl-tiles-5, .pl-tiles-6, .pl-tiles-7 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.pl-drawer-backdrop {
  position: fixed; inset: 0; z-index: 40; transition: opacity 0.3s ease;
}
.pl-drawer {
  position: fixed; top: 0; right: 0; height: 100%; width: 40%; min-width: 320px;
  overflow-y: auto; padding: 24px; z-index: 41;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -8px 0 24px rgba(0,0,0,0.15);
}
@media (max-width: 700px) {
  .pl-drawer { width: 100%; min-width: 0; }
}
`;

/* ---------- Real data, parsed from the June 2026 POS export ---------- */

const daily = [
  { date: "2026-06-01", revenue: 1236.1, orders: 44, dow: "Mon", label: "1" },
  { date: "2026-06-02", revenue: 2108.22, orders: 67, dow: "Tue", label: "2" },
  { date: "2026-06-03", revenue: 1593.48, orders: 49, dow: "Wed", label: "3" },
  { date: "2026-06-04", revenue: 1834.2, orders: 60, dow: "Thu", label: "4" },
  { date: "2026-06-05", revenue: 2172.9, orders: 67, dow: "Fri", label: "5" },
  { date: "2026-06-06", revenue: 4681.38, orders: 119, dow: "Sat", label: "6" },
  { date: "2026-06-07", revenue: 4171.26, orders: 105, dow: "Sun", label: "7" },
  { date: "2026-06-08", revenue: 1789.11, orders: 64, dow: "Mon", label: "8" },
  { date: "2026-06-09", revenue: 1745.46, orders: 61, dow: "Tue", label: "9" },
  { date: "2026-06-10", revenue: 2411.74, orders: 72, dow: "Wed", label: "10" },
  { date: "2026-06-11", revenue: 2421.08, orders: 69, dow: "Thu", label: "11" },
  { date: "2026-06-12", revenue: 2169.21, orders: 72, dow: "Fri", label: "12" },
  { date: "2026-06-13", revenue: 4253.51, orders: 115, dow: "Sat", label: "13" },
  { date: "2026-06-14", revenue: 4546.07, orders: 137, dow: "Sun", label: "14" },
  { date: "2026-06-15", revenue: 1341.34, orders: 45, dow: "Mon", label: "15" },
  { date: "2026-06-16", revenue: 2024.93, orders: 67, dow: "Tue", label: "16" },
  { date: "2026-06-17", revenue: 1662.89, orders: 53, dow: "Wed", label: "17" },
  { date: "2026-06-18", revenue: 2003.85, orders: 67, dow: "Thu", label: "18" },
  { date: "2026-06-19", revenue: 2760.23, orders: 85, dow: "Fri", label: "19" },
  { date: "2026-06-20", revenue: 3885.82, orders: 92, dow: "Sat", label: "20" },
  { date: "2026-06-21", revenue: 6130.05, orders: 92, dow: "Sun", label: "21" },
  { date: "2026-06-22", revenue: 2033.75, orders: 58, dow: "Mon", label: "22" },
  { date: "2026-06-23", revenue: 1094.93, orders: 38, dow: "Tue", label: "23" },
  { date: "2026-06-24", revenue: 1727.02, orders: 51, dow: "Wed", label: "24" },
  { date: "2026-06-25", revenue: 1895.46, orders: 61, dow: "Thu", label: "25" },
  { date: "2026-06-26", revenue: 2191.2, orders: 51, dow: "Fri", label: "26" },
  { date: "2026-06-27", revenue: 3312.85, orders: 97, dow: "Sat", label: "27" },
  { date: "2026-06-28", revenue: 4151.44, orders: 103, dow: "Sun", label: "28" },
  { date: "2026-06-29", revenue: 1298.82, orders: 41, dow: "Mon", label: "29" },
];

const weekday = [
  { day: "Mon", revenue: 7699.12, orders: 252 },
  { day: "Tue", revenue: 6973.54, orders: 233 },
  { day: "Wed", revenue: 7395.13, orders: 225 },
  { day: "Thu", revenue: 8154.59, orders: 257 },
  { day: "Fri", revenue: 9293.54, orders: 275 },
  { day: "Sat", revenue: 16133.56, orders: 423 },
  { day: "Sun", revenue: 18998.82, orders: 437 },
];

// Real backtest: forecast the last 7 real days (23–29 June) using a seasonal-naive model
// (average of the same weekday from the prior 3 weeks) — same technique as the forecasting
// prototype built earlier, applied here against real held-out data instead of synthetic data.
const forecastBacktest = (() => {
  const prior = daily.slice(0, -7);
  const last7 = daily.slice(-7);
  const dowAvg = {};
  prior.forEach((d) => {
    if (!dowAvg[d.dow]) dowAvg[d.dow] = { sumRev: 0, n: 0 };
    dowAvg[d.dow].sumRev += d.revenue;
    dowAvg[d.dow].n += 1;
  });
  return last7.map((d) => ({
    label: d.label,
    dow: d.dow,
    actual: d.revenue,
    forecast: dowAvg[d.dow] ? dowAvg[d.dow].sumRev / dowAvg[d.dow].n : 0,
  }));
})();
const forecastActualSum = forecastBacktest.reduce((s, d) => s + d.actual, 0);
const forecastPredSum = forecastBacktest.reduce((s, d) => s + d.forecast, 0);
const forecastWAPE = (forecastBacktest.reduce((s, d) => s + Math.abs(d.actual - d.forecast), 0) / forecastActualSum) * 100;

/* ---------- Multi-location data ----------
   Riverside is real, from the June 2026 POS export (same `daily`/`weekday`
   arrays used everywhere else in the app). Bridgeport and Northgate are
   illustrative mock data — clearly labeled wherever they appear — built to
   demonstrate the multi-location comparison working end to end, not to
   represent real sites. */

const daily_bridgeport = [
  { date: "2026-06-01", label: "1", dow: "Mon", revenue: 601.66, orders: 21 },
  { date: "2026-06-02", label: "2", dow: "Tue", revenue: 502.62, orders: 17 },
  { date: "2026-06-03", label: "3", dow: "Wed", revenue: 593.73, orders: 18 },
  { date: "2026-06-04", label: "4", dow: "Thu", revenue: 688.47, orders: 24 },
  { date: "2026-06-05", label: "5", dow: "Fri", revenue: 714.37, orders: 25 },
  { date: "2026-06-06", label: "6", dow: "Sat", revenue: 881.26, orders: 28 },
  { date: "2026-06-07", label: "7", dow: "Sun", revenue: 759.72, orders: 26 },
  { date: "2026-06-08", label: "8", dow: "Mon", revenue: 603.47, orders: 19 },
  { date: "2026-06-09", label: "9", dow: "Tue", revenue: 493.8, orders: 15 },
  { date: "2026-06-10", label: "10", dow: "Wed", revenue: 605.86, orders: 22 },
  { date: "2026-06-11", label: "11", dow: "Thu", revenue: 672.52, orders: 20 },
  { date: "2026-06-12", label: "12", dow: "Fri", revenue: 696.44, orders: 24 },
  { date: "2026-06-13", label: "13", dow: "Sat", revenue: 1094.52, orders: 36 },
  { date: "2026-06-14", label: "14", dow: "Sun", revenue: 777.31, orders: 27 },
  { date: "2026-06-15", label: "15", dow: "Mon", revenue: 637.7, orders: 19 },
  { date: "2026-06-16", label: "16", dow: "Tue", revenue: 588.66, orders: 17 },
  { date: "2026-06-17", label: "17", dow: "Wed", revenue: 560.43, orders: 16 },
  { date: "2026-06-18", label: "18", dow: "Thu", revenue: 593.55, orders: 18 },
  { date: "2026-06-19", label: "19", dow: "Fri", revenue: 803.79, orders: 24 },
  { date: "2026-06-20", label: "20", dow: "Sat", revenue: 1066.94, orders: 33 },
  { date: "2026-06-21", label: "21", dow: "Sun", revenue: 939.84, orders: 33 },
  { date: "2026-06-22", label: "22", dow: "Mon", revenue: 530.36, orders: 17 },
  { date: "2026-06-23", label: "23", dow: "Tue", revenue: 471.05, orders: 16 },
  { date: "2026-06-24", label: "24", dow: "Wed", revenue: 488.04, orders: 16 },
  { date: "2026-06-25", label: "25", dow: "Thu", revenue: 641.07, orders: 21 },
  { date: "2026-06-26", label: "26", dow: "Fri", revenue: 703.01, orders: 24 },
  { date: "2026-06-27", label: "27", dow: "Sat", revenue: 895.21, orders: 25 },
  { date: "2026-06-28", label: "28", dow: "Sun", revenue: 924.83, orders: 28 },
  { date: "2026-06-29", label: "29", dow: "Mon", revenue: 520.52, orders: 15 },
];
const weekday_bridgeport = [
  { day: "Mon", revenue: 2893.71, orders: 91 },
  { day: "Tue", revenue: 2056.13, orders: 65 },
  { day: "Wed", revenue: 2248.06, orders: 72 },
  { day: "Thu", revenue: 2595.61, orders: 83 },
  { day: "Fri", revenue: 2917.61, orders: 97 },
  { day: "Sat", revenue: 3937.93, orders: 122 },
  { day: "Sun", revenue: 3401.7, orders: 114 },
];

const daily_northgate = [
  { date: "2026-06-01", label: "1", dow: "Mon", revenue: 1104.45, orders: 36 },
  { date: "2026-06-02", label: "2", dow: "Tue", revenue: 1300.54, orders: 39 },
  { date: "2026-06-03", label: "3", dow: "Wed", revenue: 1249.49, orders: 37 },
  { date: "2026-06-04", label: "4", dow: "Thu", revenue: 1563.3, orders: 46 },
  { date: "2026-06-05", label: "5", dow: "Fri", revenue: 1910.01, orders: 68 },
  { date: "2026-06-06", label: "6", dow: "Sat", revenue: 3124.38, orders: 104 },
  { date: "2026-06-07", label: "7", dow: "Sun", revenue: 2934.42, orders: 83 },
  { date: "2026-06-08", label: "8", dow: "Mon", revenue: 1367.21, orders: 45 },
  { date: "2026-06-09", label: "9", dow: "Tue", revenue: 1186.88, orders: 38 },
  { date: "2026-06-10", label: "10", dow: "Wed", revenue: 1381.28, orders: 44 },
  { date: "2026-06-11", label: "11", dow: "Thu", revenue: 1317.52, orders: 44 },
  { date: "2026-06-12", label: "12", dow: "Fri", revenue: 2117.28, orders: 70 },
  { date: "2026-06-13", label: "13", dow: "Sat", revenue: 3391.43, orders: 96 },
  { date: "2026-06-14", label: "14", dow: "Sun", revenue: 3116.03, orders: 105 },
  { date: "2026-06-15", label: "15", dow: "Mon", revenue: 1411.87, orders: 44 },
  { date: "2026-06-16", label: "16", dow: "Tue", revenue: 994.83, orders: 35 },
  { date: "2026-06-17", label: "17", dow: "Wed", revenue: 1084.64, orders: 33 },
  { date: "2026-06-18", label: "18", dow: "Thu", revenue: 1541.71, orders: 49 },
  { date: "2026-06-19", label: "19", dow: "Fri", revenue: 1806.77, orders: 58 },
  { date: "2026-06-20", label: "20", dow: "Sat", revenue: 3799.78, orders: 118 },
  { date: "2026-06-21", label: "21", dow: "Sun", revenue: 3667.07, orders: 105 },
  { date: "2026-06-22", label: "22", dow: "Mon", revenue: 1048.46, orders: 31 },
  { date: "2026-06-23", label: "23", dow: "Tue", revenue: 1195.82, orders: 37 },
  { date: "2026-06-24", label: "24", dow: "Wed", revenue: 1142.56, orders: 34 },
  { date: "2026-06-25", label: "25", dow: "Thu", revenue: 1252.31, orders: 40 },
  { date: "2026-06-26", label: "26", dow: "Fri", revenue: 2050.14, orders: 58 },
  { date: "2026-06-27", label: "27", dow: "Sat", revenue: 3680.44, orders: 122 },
  { date: "2026-06-28", label: "28", dow: "Sun", revenue: 3213.56, orders: 109 },
  { date: "2026-06-29", label: "29", dow: "Mon", revenue: 1380.57, orders: 39 },
];
const weekday_northgate = [
  { day: "Mon", revenue: 6312.56, orders: 195 },
  { day: "Tue", revenue: 4678.07, orders: 149 },
  { day: "Wed", revenue: 4857.97, orders: 148 },
  { day: "Thu", revenue: 5674.84, orders: 179 },
  { day: "Fri", revenue: 7884.2, orders: 254 },
  { day: "Sat", revenue: 13996.03, orders: 440 },
  { day: "Sun", revenue: 12931.08, orders: 402 },
];


const categories = [
  { category: "Brunch", val: 16185.5, qty: 1280 },
  { category: "Coffee", val: 10009.7, qty: 2590 },
  { category: "Breakfasts", val: 9264.5, qty: 629 },
  { category: "Sunday Menu", val: 5781.0, qty: 413 },
  { category: "Soft Drinks", val: 4091.0, qty: 1249 },
  { category: "Loaded Hash Browns", val: 3958.0, qty: 443 },
  { category: "Cakes & Pastries", val: 3659.0, qty: 908 },
  { category: "Other (23 categories)", val: 21316.9, qty: 3634 },
];

const topItems = [
  { category: "Coffee", item: "Latte", qty: 950, val: 3705.0 },
  { category: "Brunch", item: "Smoked Salmon, Poached Eggs, Focaccia", qty: 274, val: 3699.0 },
  { category: "Breakfasts", item: "Thyme Kitchen Breakfast", qty: 250, val: 3625.0 },
  { category: "Breakfasts", item: "Big Thyme Kitchen Breakfast", qty: 155, val: 2867.5 },
  { category: "Coffee", item: "Cappuccino", qty: 555, val: 2164.5 },
  { category: "Coffee", item: "Americano", qty: 546, val: 2129.4 },
  { category: "Brunch", item: "Breakfast Naan", qty: 143, val: 2073.5 },
  { category: "Brunch", item: "Roast Chicken Sarnie", qty: 160, val: 1840.0 },
];

const topStaff = [
  { name: "Matty M", hours: 125.6, rate: 13.15, pay: 1651.64 },
  { name: "Lucy Brinull", hours: 117.8, rate: 14.5, pay: 1707.62 },
  { name: "Chesca Chesca", hours: 110.0, rate: 13.15, pay: 1445.84 },
  { name: "Xylee Xylee", hours: 95.0, rate: 12.71, pay: 1207.24 },
  { name: "Johnny Johnny", hours: 94.3, rate: 12.71, pay: 1198.13 },
  { name: "Holly M", hours: 94.2, rate: 12.71, pay: 1197.28 },
  { name: "Dave Dave", hours: 89.0, rate: 12.71, pay: 1130.55 },
  { name: "Caoimhe Caoimhe", hours: 88.5, rate: 12.71, pay: 1124.2 },
];

const ghostNames = ["Freddie Freddie", "Sophie Sophie", "Callam Callam", "BETH BETH", "Nige Nige", "Jack Jack", "Jorja Jorja", "Liv S Liv S", "David David", "Joseph Joseph", "Katie A"];

// Full active hourly roster (from timesheets), excluding salaried staff (rate £0) — used to build the rota
const rosterRates = [
  { name: "Matty M", rate: 13.15 }, { name: "Lucy Brinull", rate: 14.5 }, { name: "Chesca Chesca", rate: 13.15 },
  { name: "Xylee Xylee", rate: 12.71 }, { name: "Johnny Johnny", rate: 12.71 }, { name: "Holly M", rate: 12.71 },
  { name: "Dave Dave", rate: 12.71 }, { name: "Caoimhe Caoimhe", rate: 12.71 }, { name: "Jodie Jodie", rate: 10.0 },
  { name: "Bethany Bethany", rate: 10.0 }, { name: "Verity Verity", rate: 12.71 }, { name: "Laura Laura", rate: 12.71 },
  { name: "Hannah Hannah", rate: 12.71 }, { name: "Sasha Sasha", rate: 8.0 }, { name: "Billie B", rate: 8.0 },
  { name: "Charlie Charlie", rate: 8.0 }, { name: "Meg Meg", rate: 10.0 }, { name: "Harry Harry", rate: 10.85 },
  { name: "Amelia Amelia", rate: 8.0 }, { name: "Ben Ben", rate: 10.0 }, { name: "Callum Callum", rate: 8.0 },
  { name: "Emma Emma", rate: 8.0 }, { name: "Olivia Olivia", rate: 8.0 },
];
const ROTA_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_STATES = [0, 4, 8]; // cycles: off -> half day -> full day -> off
const EST_WEEKLY_REVENUE = Math.round((74648.3 / 29) * 7);

const kpis = [
  { label: "Revenue (June)", value: "£74,648", delta: "2,102 orders", up: null },
  { label: "Avg Order", value: "£35.51", delta: "across period", up: null },
  { label: "Labor Cost", value: "20.0%", delta: "of revenue", up: true },
  { label: "Unpaid Orders", value: "£2,509", delta: "78 orders", up: false },
];

// Real, from the June 2026 POS export — shared across Dashboard, Expenses, and P&L
const REVENUE = 74648.3;
const PAYROLL = 14952.72;

const LOCATIONS = [
  {
    id: "riverside", name: "Riverside Kitchen", real: true,
    daily, weekday,
    revenue: REVENUE, orders: 2102, avgOrder: 35.51,
    laborPct: 20.0, unpaidCount: 78, unpaidValue: 2509,
  },
  {
    id: "bridgeport", name: "Bridgeport", real: false,
    daily: daily_bridgeport, weekday: weekday_bridgeport,
    revenue: daily_bridgeport.reduce((s, d) => s + d.revenue, 0),
    orders: daily_bridgeport.reduce((s, d) => s + d.orders, 0),
    avgOrder: daily_bridgeport.reduce((s, d) => s + d.revenue, 0) / daily_bridgeport.reduce((s, d) => s + d.orders, 0),
    laborPct: 24.5, unpaidCount: 3, unpaidValue: 94,
  },
  {
    id: "northgate", name: "Northgate", real: false,
    daily: daily_northgate, weekday: weekday_northgate,
    revenue: daily_northgate.reduce((s, d) => s + d.revenue, 0),
    orders: daily_northgate.reduce((s, d) => s + d.orders, 0),
    avgOrder: daily_northgate.reduce((s, d) => s + d.revenue, 0) / daily_northgate.reduce((s, d) => s + d.orders, 0),
    laborPct: 19.8, unpaidCount: 12, unpaidValue: 412,
  },
];


const orderMix = [
  { label: "Dine In", value: 71057.47, count: 1835 },
  { label: "To Go", value: 3590.83, count: 267 },
];
const paymentMix = [
  { label: "Card", value: 54997.38, count: 1622 },
  { label: "Split", value: 13977.21, count: 261 },
  { label: "Cash", value: 5673.71, count: 219 },
];

const dataGaps = [
  { title: "No ingredient cost data", detail: "COGS is £0 for every item in the export — profit-by-item can't be calculated until recipe costs are linked to menu items." },
  { title: "No order timestamps", detail: "Orders have a date but no time of day, so hourly sales rhythm and peak-hour staffing recommendations can't be derived from this export." },
  { title: "No live inventory feed", detail: "Stock levels aren't in this export at all — restock alerts and reorder automation need a separate inventory connection." },
  { title: "No per-shift rota detail", detail: "Timesheets are period totals, not per-day — rota efficiency analysis needs shift-level clock in/out data, not just totals." },
];

/* ---------- Shared UI pieces ---------- */

function OdometerDigit({ digit }) {
  return (
    <span style={{ display: "inline-block", height: "1.2em", width: "0.64em", overflow: "hidden", verticalAlign: "bottom" }}>
      <span
        style={{
          display: "block",
          transform: `translateY(-${digit * 1.2}em)`,
          transition: "transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span key={d} style={{ display: "block", height: "1.2em", lineHeight: "1.2em", textAlign: "center" }}>{d}</span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value }) {
  const chars = String(value).split("");
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {chars.map((ch, i) =>
        /\d/.test(ch)
          ? <OdometerDigit key={i} digit={Number(ch)} />
          : <span key={i} style={{ display: "inline-block" }}>{ch}</span>
      )}
    </span>
  );
}

function Ticket({ label, value, delta, up, rotate }) {
  const C = useContext(ThemeContext);
  return (
    <div className="relative px-4 pt-5 pb-4" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, transform: `rotate(${rotate}deg)`, boxShadow: "0 2px 6px rgba(28,27,26,0.08)" }}>
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: C.ink, border: `2px solid ${C.paper}` }} />
      <div className="text-[10px] tracking-widest uppercase mb-2" style={{ fontFamily: "Inter", color: C.steel, letterSpacing: "0.12em" }}>{label}</div>
      <div className="text-2xl mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.ink, fontWeight: 600 }}>{value}</div>
      <div className="flex items-center gap-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: up === null ? C.steel : up ? C.sage : C.chili }}>
        {up === true && <TrendingUp size={12} />}
        {up === false && <TrendingDown size={12} />}
        {delta}
      </div>
      <div className="mt-3 border-t border-dashed" style={{ borderColor: C.line }} />
    </div>
  );
}

function SectionLabel({ eyebrow, title, icon }) {
  const C = useContext(ThemeContext);
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <div>
        <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.brass, letterSpacing: "0.15em" }}>{eyebrow}</div>
        <h2 className="text-lg leading-tight" style={{ fontFamily: "Oswald", fontWeight: 600, color: C.ink, letterSpacing: "0.01em" }}>{title}</h2>
      </div>
    </div>
  );
}

function Card({ children, style, className = "" }) {
  const C = useContext(ThemeContext);
  return <div className={`p-5 rounded ${className}`} style={{ background: C.card, border: `1px solid ${C.line}`, ...style }}>{children}</div>;
}

function BarRow({ name, primary, secondary, pct, color }) {
  const C = useContext(ThemeContext);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-baseline mb-1 gap-3">
        <span className="text-sm truncate" style={{ fontFamily: "Inter", color: C.ink }}>{name}</span>
        <span className="text-xs flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.steel }}>
          {primary} {secondary && <span style={{ color: C.steel }}>· {secondary}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full w-full" style={{ background: C.paperDark }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const DEFAULT_EXPENSE_ROWS = [
  { id: 1, name: "Rent", monthly: 0 },
  { id: 2, name: "Gas", monthly: 0 },
  { id: 3, name: "Electric", monthly: 0 },
  { id: 4, name: "Business rates", monthly: 0 },
  { id: 5, name: "Insurance", monthly: 0 },
];
const DEFAULT_INGREDIENTS = [
  { id: 1, name: "Coffee beans", unit: "kg", cost: 0, stock: 0, threshold: 0, supplier: "" },
  { id: 2, name: "Whole milk", unit: "L", cost: 0, stock: 0, threshold: 0, supplier: "" },
  { id: 3, name: "Eggs", unit: "unit", cost: 0, stock: 0, threshold: 0, supplier: "" },
  { id: 4, name: "Sourdough bread", unit: "unit", cost: 0, stock: 0, threshold: 0, supplier: "" },
  { id: 5, name: "Smoked salmon", unit: "kg", cost: 0, stock: 0, threshold: 0, supplier: "" },
];

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
      { id: "locations", label: "All Locations", icon: MapPin },
    ],
  },
  {
    label: "Sales",
    items: [{ id: "menu", label: "Menu Board", icon: UtensilsCrossed }],
  },
  {
    label: "Operations",
    items: [
      { id: "ingredients", label: "Calculations", icon: Carrot },
      { id: "restock", label: "Restock", icon: Truck },
      { id: "waste", label: "Waste", icon: Trash },
      { id: "staff", label: "Staff Line", icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "expenses", label: "Expenses", icon: Wallet },
      { id: "pl", label: "P&L", icon: Scale },
    ],
  },
  {
    label: "System",
    items: [
      { id: "gaps", label: "Data Gaps", icon: DatabaseZap },
      { id: "livefeed", label: "Live Feed", icon: Rss },
      { id: "krystal", label: "Krystal Live", icon: Server },
      { id: "expo", label: "Ask Expo", icon: Sparkles },
    ],
  },
];
const PAGES = NAV_GROUPS.flatMap((g) => g.items);

/* ---------- Page bodies ---------- */

function SalesForecastCard({ className = "" }) {
  const C = useContext(ThemeContext);
  const deltaPct = ((forecastActualSum - forecastPredSum) / forecastPredSum) * 100;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
        <SectionLabel eyebrow="Real backtest, not a live forecast" title="Sales vs Forecast" icon={<LineChartIcon size={16} color={C.brass} />} />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: C.sageSoft }}>
          <span className="live-dot" style={{ background: C.sage }} />
          <span style={{ fontFamily: "IBM Plex Mono", color: C.sage, fontSize: 10 }}>Model refreshed</span>
        </div>
      </div>
      <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
        Last 7 real days (23–29 Jun) held out and predicted using a seasonal-naive model (avg of the same weekday from the 3 prior weeks) — the same technique from the forecasting design, tested against real data instead of synthetic.
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded" style={{ background: C.paperDark }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Actual (7d)</div>
          <div className="text-base" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{forecastActualSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="p-3 rounded" style={{ background: C.paperDark }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Forecast (7d)</div>
          <div className="text-base" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{forecastPredSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="p-3 rounded" style={{ background: forecastWAPE < 15 ? C.sageSoft : C.amberSoft }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: forecastWAPE < 15 ? C.sage : C.amber }}>Model error (WAPE)</div>
          <div className="text-base" style={{ fontFamily: "IBM Plex Mono", color: forecastWAPE < 15 ? C.sage : C.amber, fontWeight: 600 }}>{forecastWAPE.toFixed(1)}%</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={forecastBacktest} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="label" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={{ stroke: C.line }} tickLine={false} />
          <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: C.steel }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => `£${v}`} />
          <Tooltip contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: CREAM }} formatter={(v) => [`£${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, ""]} cursor={{ fill: C.paperDark }} />
          <Bar dataKey="actual" name="Actual" fill={C.brass} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="forecast" name="Forecast" fill={C.steel} fillOpacity={0.45} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.brass }} />Actual</span>
        <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.steel, opacity: 0.45 }} />Forecast</span>
      </div>
    </Card>
  );
}

function AllLocationsPage() {
  const C = useContext(ThemeContext);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const combinedRevenue = LOCATIONS.reduce((s, l) => s + l.revenue, 0);
  const combinedOrders = LOCATIONS.reduce((s, l) => s + l.orders, 0);
  const maxRevenue = Math.max(...LOCATIONS.map((l) => l.revenue));

  return (
    <div className="pl-grid">
      <Card className="pl-c-12" style={{ background: BAR }}>
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={18} color={C.brassLight} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 600, color: CREAM }} className="text-xl">All Locations — June 2026</h2>
        </div>
        <div className="text-xs" style={{ fontFamily: "Inter", color: C.steel }}>
          <strong style={{ color: C.sage }}>Riverside Kitchen</strong> is real, from the connected POS export — same data as the rest of this app. <strong style={{ color: C.amber }}>Bridgeport</strong> and <strong style={{ color: C.amber }}>Northgate</strong> are illustrative mock data, built to prove multi-location comparison works end to end, not real sites. Click a card to expand it.
        </div>
      </Card>

      <div className="pl-c-12 pl-tiles pl-tiles-2">
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Combined revenue (3 sites)</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{combinedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Combined orders</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{combinedOrders.toLocaleString()}</div>
        </div>
      </div>

      {LOCATIONS.map((loc) => {
        const isOpen = !!expanded[loc.id];
        const weekendRevenue = loc.weekday.filter((w) => w.day === "Sat" || w.day === "Sun").reduce((s, w) => s + w.revenue, 0);
        const weekendPct = (weekendRevenue / loc.revenue) * 100;
        const maxWd = Math.max(...loc.weekday.map((w) => w.revenue));

        return (
          <Card key={loc.id} className="pl-c-12">
            <div className="flex items-center justify-between flex-wrap gap-3 cursor-pointer" onClick={() => toggleExpand(loc.id)}>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} color={C.brass} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontFamily: "Oswald", fontWeight: 600, color: C.ink }} className="text-lg leading-none">{loc.name}</h3>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: loc.real ? C.sageSoft : C.amberSoft, color: loc.real ? C.sage : C.amber }}>
                      {loc.real ? "real data" : "mock data"}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-xs px-2.5 py-1 rounded" style={{ background: C.paperDark, color: C.steel, fontFamily: "Inter" }}>{isOpen ? "Collapse" : "Expand"}</button>
            </div>

            <div className="pl-tiles pl-tiles-5" style={{ marginTop: 16 }}>
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Revenue</div>
                <div className="h-1.5 rounded-full w-full mb-1" style={{ background: C.paperDark }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(loc.revenue / maxRevenue) * 100}%`, background: C.brass }} />
                </div>
                <div className="text-sm" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{loc.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Orders</div>
                <div className="text-sm mt-2" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{loc.orders.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Avg order</div>
                <div className="text-sm mt-2" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{loc.avgOrder.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Labor cost</div>
                <div className="text-sm mt-2" style={{ fontFamily: "IBM Plex Mono", color: loc.laborPct <= 25 ? C.sage : C.chili, fontWeight: 600 }}>{loc.laborPct.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Unpaid orders</div>
                <div className="text-sm mt-2" style={{ fontFamily: "IBM Plex Mono", color: loc.unpaidCount > 0 ? C.chili : C.sage, fontWeight: 600 }}>{loc.unpaidCount} · £{loc.unpaidValue.toLocaleString()}</div>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
                <div className="text-xs mb-3 flex items-center gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
                  <Flame size={12} color={C.chili} /> Weekend (Sat+Sun) is {weekendPct.toFixed(0)}% of this location's June revenue
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={loc.daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`fill-${loc.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.brass} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={C.brass} stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.line} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={{ stroke: C.line }} tickLine={false} interval={3} />
                    <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `£${v}`} />
                    <Tooltip contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: CREAM }} formatter={(v) => [`£${v.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke={C.brass} strokeWidth={2} fill={`url(#fill-${loc.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="pl-tiles pl-tiles-7" style={{ marginTop: 12 }}>
                  {loc.weekday.map((w) => (
                    <div key={w.day} className="text-center">
                      <div className="text-[9px] mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{w.day}</div>
                      <div className="h-12 rounded flex items-end" style={{ background: C.paperDark }}>
                        <div className="w-full rounded" style={{ height: `${(w.revenue / maxWd) * 100}%`, background: C.sage }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function DashboardPage({ expenseRows, simRevenue, simOrders }) {
  const C = useContext(ThemeContext);
  const otherExpenses = expenseRows.reduce((sum, r) => sum + r.monthly, 0);
  const totalCosts = PAYROLL + otherExpenses;
  const netEst = REVENUE - totalCosts;
  const netMargin = ((netEst / REVENUE) * 100).toFixed(1);
  const expensesEntered = otherExpenses > 0;

  // "Today" = the most recent real day in the connected export (29 Jun) — staff and other
  // costs are prorated daily averages since we only have monthly totals for those; COGS is
  // excluded here for the same reason it's excluded elsewhere (not tracked in the POS export).
  const today = daily[daily.length - 1];
  const todayStaffCost = PAYROLL / daily.length;
  const todayOtherExpenses = otherExpenses / 30;
  const todayProfit = today.revenue - todayStaffCost - todayOtherExpenses;

  // Visual-only ticker: nudges the displayed figure up every 10s so the card feels live.
  // Purely cosmetic — doesn't reflect any real incoming data.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + (3 + Math.random() * 6));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  const displayedProfit = todayProfit + tick;

  const insights = [
    { level: "warn", text: "78 orders (£2,509) still marked NOT PAID — reconcile before month-end." },
    { level: "warn", text: "11 staff on the roster have a pay rate but logged zero hours — likely former staff, worth offboarding." },
    { level: "info", text: "Top seller: Latte — 950 sold, £3,705 revenue this month." },
    expensesEntered
      ? { level: netEst >= 0 ? "good" : "warn", text: `Est. net profit is £${netEst.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${netMargin}%) once staff wages and entered expenses are covered — excludes untracked COGS.` }
      : { level: "info", text: "Add your rent, utilities and other fixed costs on the Expenses page to see a real net profit estimate here." },
    simOrders > 0
      ? { level: "good", text: `Live Feed simulation has ingested ${simOrders} order(s) worth £${simRevenue.toFixed(2)} — separate from June's real total, see the ticket above and the Live Feed page.` }
      : null,
  ].filter(Boolean);
  const insightColor = { warn: { bg: C.chiliSoft, text: C.chili }, good: { bg: C.sageSoft, text: C.sage }, info: { bg: C.paperDark, text: C.steel } };

  return (
    <div className="pl-grid">
      <div className="pl-c-12">
        <div className="w-full h-px mb-6" style={{ background: C.steel, opacity: 0.35 }} />
        <div className="pl-tiles pl-tiles-5" style={{ marginTop: -24, paddingTop: 24 }}>
          <Ticket
            {...kpis[0]}
            delta={simOrders > 0 ? `+£${simRevenue.toFixed(0)} live sim` : kpis[0].delta}
            up={simOrders > 0 ? true : kpis[0].up}
            rotate={-1.2}
          />
          <Ticket
            label="Today's Profit"
            value={<Odometer value={`£${Math.round(displayedProfit)}`} />}
            delta={`29 Jun · ex. COGS`}
            up={displayedProfit >= 0}
            rotate={1.2}
          />
          {kpis.slice(1).map((k, i) => <Ticket key={k.label} {...k} rotate={i % 2 === 0 ? -1.2 : 1.2} />)}
        </div>
      </div>

      <Card className="pl-c-8">
        <SectionLabel eyebrow="Station 01 · Real data" title="Daily Takings — June" icon={<Radio size={16} color={C.brass} />} />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.brass} stopOpacity={0.5} />
                <stop offset="100%" stopColor={C.brass} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="label" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={{ stroke: C.line }} tickLine={false} interval={2} />
            <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: C.steel }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => `£${v}`} />
            <Tooltip contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: CREAM }} itemStyle={{ color: C.brassLight }} formatter={(v, n, p) => [`£${v.toLocaleString()} (${p.payload.orders} orders)`, p.payload.dow]} />
            <Area type="monotone" dataKey="revenue" stroke={C.brass} strokeWidth={2} fill="url(#revFill)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: C.steel, fontFamily: "Inter" }}>
          <Flame size={12} color={C.chili} /> 21 June (Sun) peaked at £6,130 — likely Father's Day, ~35% above the next-best Sunday
        </div>
      </Card>

      <Card className="pl-c-4" style={{ background: BAR }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} color={C.brassLight} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 600, color: CREAM }} className="text-base">AI Insights</h2>
        </div>
        <div className="flex flex-col gap-2">
          {insights.map((ins, i) => (
            <div key={i} className="text-xs px-3 py-2 rounded flex items-start gap-1.5" style={{ background: insightColor[ins.level].bg, color: insightColor[ins.level].text, fontFamily: "Inter" }}>
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              {ins.text}
            </div>
          ))}
        </div>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="Station 01b · Real data" title="Revenue by Weekday" icon={<CalendarDays size={16} color={C.brass} />} />
        <div className="pl-tiles pl-tiles-7">
          {weekday.map((w) => (
            <div key={w.day} className="text-center">
              <div className="text-[10px] mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{w.day}</div>
              <div className="h-20 rounded flex items-end" style={{ background: C.paperDark }}>
                <div className="w-full rounded" style={{ height: `${(w.revenue / 18998.82) * 100}%`, background: C.brass }} />
              </div>
              <div className="text-[9px] mt-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>£{Math.round(w.revenue / 1000)}k</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs" style={{ color: C.steel, fontFamily: "Inter" }}>
          Sat + Sun bring in 47% of June's revenue on just 2 of 7 days.
        </div>
      </Card>

      <Card className="pl-c-6">
        <SectionLabel eyebrow="Snapshot" title="Order Mix" icon={<ReceiptText size={16} color={C.brass} />} />
          <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Order type</div>
          {orderMix.map((o) => <BarRow key={o.label} name={o.label} primary={`£${o.value.toLocaleString()}`} secondary={`${o.count} orders`} pct={(o.value / orderMix[0].value) * 100} color={C.brass} />)}
          <div className="text-xs uppercase tracking-widest mb-2 mt-4" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Payment type</div>
          {paymentMix.map((p) => <BarRow key={p.label} name={p.label} primary={`£${p.value.toLocaleString()}`} secondary={`${p.count}`} pct={(p.value / paymentMix[0].value) * 100} color={C.sage} />)}
        </Card>

      <Card className="pl-c-6">
        <SectionLabel eyebrow="From Expenses page" title="Profit Summary" icon={<Wallet size={16} color={C.brass} />} />
          <table className="w-full text-sm" style={{ fontFamily: "Inter" }}>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-1.5" style={{ color: C.steel }}>Total sales</td>
                <td className="py-1.5 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>£{REVENUE.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-1.5" style={{ color: C.steel }}>Cost of goods sold</td>
                <td className="py-1.5 text-right text-xs italic" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>not tracked</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-1.5" style={{ color: C.steel }}>Staff wages</td>
                <td className="py-1.5 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>–£{PAYROLL.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-1.5" style={{ color: C.steel }}>Other expenses</td>
                <td className="py-1.5 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>–£{otherExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium" style={{ color: C.ink }}>Est. net profit</td>
                <td className="py-2 text-right font-medium" style={{ fontFamily: "IBM Plex Mono", color: netEst >= 0 ? C.sage : C.chili }}>
                  £{netEst.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs">({netMargin}%)</span>
                </td>
              </tr>
            </tbody>
          </table>
          {!expensesEntered && <div className="mt-2 text-[11px]" style={{ color: C.steel, fontFamily: "Inter" }}>Add rent, utilities etc. on the Expenses page to sharpen this.</div>}
        </Card>
    </div>
  );
}

function MenuPage() {
  const C = useContext(ThemeContext);
  return (
    <div className="pl-grid">
      <Card className="pl-c-6">
        <SectionLabel eyebrow="Real data" title="Category Mix" icon={<UtensilsCrossed size={16} color={C.brass} />} />
        {categories.map((c) => <BarRow key={c.category} name={c.category} primary={`£${c.val.toLocaleString()}`} secondary={`${c.qty} sold`} pct={(c.val / categories[0].val) * 100} color={C.brass} />)}
      </Card>
      <Card className="pl-c-6">
        <SectionLabel eyebrow="Real data" title="Top Sellers" icon={<TrendingUp size={16} color={C.brass} />} />
        {topItems.map((d) => <BarRow key={d.item} name={`${d.item} · ${d.category}`} primary={`${d.qty} sold`} secondary={`£${d.val.toLocaleString()}`} pct={(d.qty / topItems[0].qty) * 100} color={C.sage} />)}
        <div className="mt-4 p-3 rounded text-xs flex items-start gap-1.5" style={{ background: C.paperDark, color: C.steel, fontFamily: "Inter" }}>
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" color={C.brass} />
          No margin column here from the POS data — it has £0 ingredient cost for every item. Head to the Ingredients page to add real costs and build real margins per dish.
        </div>
      </Card>
    </div>
  );
}

function ShiftPlannerDrawer({ open, onClose }) {
  const C = useContext(ThemeContext);
  return (
    <>
      <div
        onClick={onClose}
        className="pl-drawer-backdrop"
        style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <div className="pl-drawer" style={{ background: C.paper, borderLeft: `1px solid ${C.line}`, transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Mono", color: C.brass, letterSpacing: "0.15em" }}>Quick access</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 22, color: C.ink }}>Shift Planner</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded" style={{ background: C.paperDark, color: C.steel }}><X size={16} /></button>
        </div>
        <RotaSection />
      </div>
    </>
  );
}

function RotaSection() {
  const C = useContext(ThemeContext);
  const emptyShifts = () => Object.fromEntries(rosterRates.map((r) => [r.name, [0, 0, 0, 0, 0, 0, 0]]));
  const [shifts, setShifts] = useState(emptyShifts());
  const [query, setQuery] = useState("");

  const cycle = (name, dayIdx) => {
    setShifts((prev) => {
      const row = [...prev[name]];
      const idx = SHIFT_STATES.indexOf(row[dayIdx]);
      row[dayIdx] = SHIFT_STATES[(idx + 1) % SHIFT_STATES.length];
      return { ...prev, [name]: row };
    });
  };

  const clearAll = () => setShifts(emptyShifts());

  const rows = rosterRates
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    .map((r) => {
      const hrs = shifts[r.name];
      const totalHours = hrs.reduce((a, b) => a + b, 0);
      return { ...r, hrs, totalHours, cost: totalHours * r.rate };
    });

  const grandHours = rosterRates.reduce((sum, r) => sum + shifts[r.name].reduce((a, b) => a + b, 0), 0);
  const grandCost = rosterRates.reduce((sum, r) => sum + shifts[r.name].reduce((a, b) => a + b, 0) * r.rate, 0);
  const laborPct = ((grandCost / EST_WEEKLY_REVENUE) * 100).toFixed(1);

  const cellStyle = (h) => ({
    background: h === 0 ? C.paperDark : h === 4 ? C.brassLight : C.brass,
    color: h === 0 ? C.steel : C.paper,
  });

  return (
    <Card>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <SectionLabel eyebrow="Planning tool · not from POS" title="Rota Builder" icon={<CalendarDays size={16} color={C.brass} />} />
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter staff..."
            className="text-xs px-2.5 py-1.5 rounded outline-none"
            style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}
          />
          <button onClick={clearAll} className="text-xs px-2.5 py-1.5 rounded" style={{ background: C.paperDark, color: C.steel, fontFamily: "Inter" }}>Clear week</button>
        </div>
      </div>

      <div className="text-xs mb-3 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
        This export has no shift-level schedule, so the rota below is a blank planning grid, not historical data — click a cell to cycle Off → Half day (4h) → Full day (8h). Names and hourly rates are real, from the timesheet export.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 sticky left-0" style={{ color: C.steel, background: C.card, fontFamily: "IBM Plex Mono", fontWeight: 400 }}>Staff</th>
              {ROTA_DAYS.map((d) => (
                <th key={d} className="text-center py-2 px-1" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontWeight: 400, width: 44 }}>{d}</th>
              ))}
              <th className="text-right py-2 pl-3" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontWeight: 400 }}>Hrs</th>
              <th className="text-right py-2 pl-3" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontWeight: 400 }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-1.5 pr-3 sticky left-0" style={{ color: C.ink, background: C.card, whiteSpace: "nowrap" }}>{r.name}</td>
                {r.hrs.map((h, i) => (
                  <td key={i} className="text-center py-1.5 px-1">
                    <button onClick={() => cycle(r.name, i)} className="w-8 h-6 rounded text-[10px]" style={{ ...cellStyle(h), fontFamily: "IBM Plex Mono" }}>
                      {h === 0 ? "–" : h}
                    </button>
                  </td>
                ))}
                <td className="text-right pl-3" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>{r.totalHours}h</td>
                <td className="text-right pl-3" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>£{r.cost.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pl-tiles pl-tiles-3" style={{ marginTop: 20 }}>
        <div className="p-3 rounded" style={{ background: C.paperDark }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Scheduled hours</div>
          <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{grandHours}h</div>
        </div>
        <div className="p-3 rounded" style={{ background: C.paperDark }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Projected weekly cost</div>
          <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{grandCost.toFixed(0)}</div>
        </div>
        <div className="p-3 rounded" style={{ background: Number(laborPct) > 30 ? C.chiliSoft : C.sageSoft }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: Number(laborPct) > 30 ? C.chili : C.sage }}>Est. labor % of revenue</div>
          <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: Number(laborPct) > 30 ? C.chili : C.sage, fontWeight: 600 }}>{laborPct}%</div>
        </div>
      </div>
      <div className="text-[11px] mt-2" style={{ fontFamily: "Inter", color: C.steel }}>
        Est. weekly revenue of £{EST_WEEKLY_REVENUE.toLocaleString()} is June's average daily takings × 7 — a rough benchmark, not a forecast.
      </div>
    </Card>
  );
}

function LiveRosterSection() {
  const C = useContext(ThemeContext);
  const initial = rosterRates.slice(0, 6).map((r) => ({ ...r, status: "Off Shift", clockInAt: null }));
  const [staffList, setStaffList] = useState(initial);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cycleStatus = (name) => {
    setStaffList((prev) => prev.map((s) => {
      if (s.name !== name) return s;
      const order = ["Off Shift", "On Shift", "On Break"];
      const idx = order.indexOf(s.status);
      const nextStatus = order[(idx + 1) % order.length];
      let clockInAt = s.clockInAt;
      if (nextStatus === "On Shift") clockInAt = Date.now();
      if (nextStatus === "Off Shift") clockInAt = null;
      return { ...s, status: nextStatus, clockInAt };
    }));
  };

  const liveCost = (s) => {
    if (!s.clockInAt || s.status !== "On Shift") return 0;
    const hours = (tick - s.clockInAt) / 3600000;
    return hours * s.rate;
  };
  const fmtElapsed = (s) => {
    if (!s.clockInAt || s.status !== "On Shift") return "–";
    const mins = Math.floor((tick - s.clockInAt) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const totalLive = staffList.reduce((sum, s) => sum + liveCost(s), 0);
  const statusStyle = { "Off Shift": { bg: C.paperDark, text: C.steel }, "On Shift": { bg: C.sageSoft, text: C.sage }, "On Break": { bg: C.amberSoft, text: C.amber } };

  return (
    <Card style={{ marginBottom: 24 }}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <SectionLabel eyebrow="Simulated · click to try" title="Live Roster" icon={<Clock size={16} color={C.brass} />} />
        <div className="text-right">
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Live labor cost</div>
          <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{totalLive.toFixed(2)}</div>
        </div>
      </div>
      <div className="text-xs mb-3 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
        This export has no live clock events, so this is a working simulation, not real shift data — click a status pill to cycle Off Shift → On Shift → On Break. Names and rates are real.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Name</th>
              <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Rate</th>
              <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Status</th>
              <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Elapsed</th>
              <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Live cost</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((s) => (
              <tr key={s.name} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-2" style={{ color: C.ink }}>{s.name}</td>
                <td className="py-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>£{s.rate}/hr</td>
                <td className="py-2">
                  <button onClick={() => cycleStatus(s.name)} className="text-xs px-2.5 py-1 rounded-full" style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].text, fontFamily: "Inter" }}>
                    {s.status}
                  </button>
                </td>
                <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{fmtElapsed(s)}</td>
                <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>£{liveCost(s).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function StaffPage() {
  const C = useContext(ThemeContext);
  const [plannerOpen, setPlannerOpen] = useState(false);

  // Test data: illustrative only, not calculated from real sales — orders aren't linked to
  // individual staff anywhere in this export, so a genuine per-person figure isn't derivable.
  // These are sample £/hour rates to show what the feature would look like once real
  // per-shift attribution exists.
  const testProfitPerHour = {
    "Matty M": 61.4,
    "Lucy Brinull": 57.8,
    "Chesca Chesca": 44.9,
    "Xylee Xylee": 52.3,
    "Johnny Johnny": 38.6,
    "Holly M": 46.7,
    "Dave Dave": 55.1,
    "Caoimhe Caoimhe": 41.5,
  };

  return (
    <>
      <div className="pl-tiles pl-tiles-3" style={{ marginBottom: 24 }}>
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Payroll (June)</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£14,953</div>
        </div>
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Hours logged</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>1,236</div>
        </div>
        <button onClick={() => setPlannerOpen(true)} className="p-4 rounded text-left" style={{ background: C.brass, border: `1px solid ${C.brass}` }}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: CREAM, letterSpacing: "0.1em" }}>Shift Planner</div>
            <CalendarDays size={14} color={CREAM} />
          </div>
          <div className="flex items-center gap-1 text-sm mt-1" style={{ fontFamily: "Inter", color: CREAM, fontWeight: 600 }}>
            Open planner <ArrowRight size={14} />
          </div>
        </button>
      </div>

      <ShiftPlannerDrawer open={plannerOpen} onClose={() => setPlannerOpen(false)} />

      <LiveRosterSection />

      <div className="pl-grid" style={{ marginBottom: 24 }}>
        <Card className="pl-c-12">
          <SectionLabel eyebrow="Test data · not real sales" title="Top Hours" icon={<Clock size={16} color={C.brass} />} />
          <div className="text-xs mb-4 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
            "Profit while on shift" below is sample data, not calculated from real sales — orders aren't linked to individual staff anywhere in this export, so there's no way to attribute revenue to a specific person yet.
          </div>
          {topStaff.map((s) => {
            const shiftProfit = s.hours * (testProfitPerHour[s.name] || 45);
            return (
              <div key={s.name} className="mb-3 last:mb-0 pb-3 last:pb-0" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm" style={{ fontFamily: "Inter", color: C.ink }}>{s.name}</span>
                  <span className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{s.hours}h · £{s.pay.toLocaleString()} @ £{s.rate}/hr</span>
                </div>
                <div className="h-1.5 rounded-full w-full mb-1.5" style={{ background: C.paperDark }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(s.hours / topStaff[0].hours) * 100}%`, background: C.brass }} />
                </div>
                <div className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: C.sage }}>
                  Profit while on shift (test data): £{shiftProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}

function PLPage({ expenseRows, ingredients, recipes }) {
  const C = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);

  const otherExpenses = expenseRows.reduce((sum, r) => sum + r.monthly, 0);
  const totalOpex = PAYROLL + otherExpenses;

  // Partial COGS: only covers dishes with a saved recipe matched against a real top-selling item.
  const matchedRecipes = recipes.filter((r) => itemDailyQty[r.name]);
  const coveredRevenue = matchedRecipes.reduce((sum, r) => sum + r.price * (topItems.find((t) => t.item === r.name)?.qty || 0), 0);
  const knownCOGS = matchedRecipes.reduce((sum, r) => sum + r.cost * (topItems.find((t) => t.item === r.name)?.qty || 0), 0);
  const coveragePct = REVENUE > 0 ? (coveredRevenue / REVENUE) * 100 : 0;

  const grossProfit = REVENUE - knownCOGS;
  const grossMargin = ((grossProfit / REVENUE) * 100).toFixed(1);
  const netProfit = REVENUE - knownCOGS - totalOpex;
  const netMargin = ((netProfit / REVENUE) * 100).toFixed(1);

  const grossAfterWages = grossProfit - PAYROLL;

  // Waterfall steps: "total" bars sit on the axis; "delta" bars float between running totals.
  const waterfall = [
    { name: "Revenue", base: 0, delta: REVENUE, color: C.brass, display: REVENUE },
    { name: "COGS", base: grossProfit, delta: REVENUE - grossProfit, color: C.chili, display: -(REVENUE - grossProfit) },
    { name: "Gross profit", base: 0, delta: grossProfit, color: C.brassLight, display: grossProfit },
    { name: "Wages", base: grossAfterWages, delta: grossProfit - grossAfterWages, color: C.chili, display: -(grossProfit - grossAfterWages) },
    { name: "Expenses", base: Math.min(netProfit, grossAfterWages), delta: Math.abs(grossAfterWages - netProfit), color: C.chili, display: -(grossAfterWages - netProfit) },
    { name: "Net profit", base: Math.min(0, netProfit), delta: Math.abs(netProfit), color: netProfit >= 0 ? C.sage : C.chili, display: netProfit },
  ];

  const copyStatement = () => {
    const text = [
      "Profit & Loss — June 2026",
      `Revenue: £${REVENUE.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `COGS (partial, ${coveragePct.toFixed(0)}% of revenue covered): £${knownCOGS.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `Gross profit: £${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${grossMargin}%)`,
      `Staff wages: £${PAYROLL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `Other operating expenses: £${otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `Net profit: £${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${netMargin}%)`,
    ].join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
    }
  };

  return (
    <div className="pl-grid">
      <Card className="pl-c-12">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <SectionLabel eyebrow="June 2026" title="Profit &amp; Loss" icon={<ReceiptText size={16} color={C.brass} />} />
          <button onClick={copyStatement} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter" }}>
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy statement</>}
          </button>
        </div>

        <div className="text-xs mb-5 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          {matchedRecipes.length === 0
            ? "COGS is £0 below because no recipe on the Ingredients page is linked to a real top-selling item yet — gross and net profit are currently overstated. Build a few recipes to sharpen this."
            : `COGS only reflects ${matchedRecipes.length} recipe(s) matched to real sales, covering ~${coveragePct.toFixed(0)}% of June revenue by value. The rest of the menu has no linked ingredient cost, so this statement understates true COGS and overstates profit.`}
        </div>

        <table className="w-full text-sm mb-6" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              <td className="py-2" style={{ color: C.steel }}>Revenue</td>
              <td className="py-2 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>£{REVENUE.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              <td className="py-2" style={{ color: C.steel }}>Cost of goods sold <span className="text-[10px]" style={{ color: C.steel }}>({coveragePct.toFixed(0)}% coverage)</span></td>
              <td className="py-2 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>–£{knownCOGS.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              <td className="py-2 font-medium" style={{ color: C.ink }}>Gross profit</td>
              <td className="py-2 text-right font-medium" style={{ fontFamily: "IBM Plex Mono", color: C.sage }}>£{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs">({grossMargin}%)</span></td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              <td className="py-2" style={{ color: C.steel }}>Staff wages <span className="text-[10px]" style={{ color: C.sage }}>real, from timesheets</span></td>
              <td className="py-2 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>–£{PAYROLL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              <td className="py-2" style={{ color: C.steel }}>Other operating expenses <span className="text-[10px]" style={{ color: otherExpenses > 0 ? C.sage : C.steel }}>{otherExpenses > 0 ? "from Expenses page" : "not entered yet"}</span></td>
              <td className="py-2 text-right" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>–£{otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="py-3 font-medium text-base" style={{ color: C.ink }}>Net profit</td>
              <td className="py-3 text-right font-medium text-base" style={{ fontFamily: "IBM Plex Mono", color: netProfit >= 0 ? C.sage : C.chili }}>£{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm">({netMargin}%)</span></td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Waterfall — Revenue to Net Profit</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={waterfall} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
            <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: C.steel }} axisLine={false} tickLine={false} width={55} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
            <Tooltip
              cursor={{ fill: C.paperDark }}
              contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }}
              labelStyle={{ color: CREAM }}
              formatter={(v, key, p) => [`${p.payload.display < 0 ? "–" : ""}£${Math.abs(p.payload.display).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Amount"]}
            />
            <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="delta" stackId="wf" radius={[3, 3, 3, 3]} isAnimationActive={false}>
              {waterfall.map((w, i) => <Cell key={i} fill={w.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.brass }} />Revenue</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.brassLight }} />Subtotal</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.chili }} />Cost</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "Inter", color: C.steel }}><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: C.sage }} />Net profit</span>
        </div>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="What would sharpen this" title="Improve Accuracy" icon={<Scale size={16} color={C.brass} />} />
        <ul className="text-sm space-y-2" style={{ fontFamily: "Inter", color: C.steel }}>
          <li>· Link recipes for more menu items on the Ingredients page — each one converts an estimate into a real cost.</li>
          <li>· Enter real rent, utilities, and other fixed costs on the Expenses page instead of leaving them at £0.</li>
          <li>· Confirm whether Staff wages includes employer NI/pension, or if that needs adding as a separate expense line.</li>
          <li>· The 78 unpaid orders (£2,509) are still counted as revenue here — reconcile those and this statement will move.</li>
        </ul>
      </Card>
    </div>
  );
}

// Reuses the same real menu items and real staff already in the app, so the
// simulation ties back to actual Passline data rather than being fully invented.
const SIM_STAFF = rosterRates.slice(0, 6).map((r) => r.name);
const SIM_ITEMS = topItems.map((t) => ({ name: t.item, price: Number((t.val / t.qty).toFixed(2)) }));
const EXPORT_EVERY = 4;  // seconds — stands in for the real ~5 min export cadence
const INGEST_EVERY = 12; // seconds — stands in for the real 15 min ingestion cadence

// Configurable so this works whether the API is on localhost during dev,
// or a real deployed address later — change this one line, nothing else.
const API_BASE_URL = "http://localhost:8000";

function KrystalLivePage() {
  const C = useContext(ThemeContext);
  const [summary, setSummary] = useState(null);
  const [orderMix, setOrderMix] = useState(null);
  const [revenueByDay, setRevenueByDay] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, mixRes, dayRes, empRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/summary`),
        fetch(`${API_BASE_URL}/api/order-mix`),
        fetch(`${API_BASE_URL}/api/revenue-by-day`),
        fetch(`${API_BASE_URL}/api/employee-summary`),
      ]);
      if (!summaryRes.ok || !mixRes.ok || !dayRes.ok || !empRes.ok) {
        throw new Error(`API responded with an error (status ${summaryRes.status})`);
      }
      setSummary(await summaryRes.json());
      setOrderMix(await mixRes.json());
      setRevenueByDay(await dayRes.json());
      setEmployeeSummary(await empRes.json());
      setLastFetched(new Date());
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? `Couldn't reach the API at ${API_BASE_URL} — is api_server.py running? (python3 -m uvicorn api_server:app --reload --port 8000)`
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxDayRevenue = revenueByDay?.length ? Math.max(...revenueByDay.map((d) => d.revenue)) : 1;
  const maxMixValue = orderMix
    ? Math.max(...orderMix.by_order_type.map((t) => t.revenue), ...orderMix.by_payment_type.map((t) => t.revenue))
    : 1;
  const maxEmpHours = employeeSummary?.employees?.length ? Math.max(...employeeSummary.employees.map((e) => e.hours)) : 1;

  return (
    <div className="pl-grid">
      <Card className="pl-c-12" style={{ background: BAR }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Server size={18} color={C.brassLight} />
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Mono", color: C.brassLight, letterSpacing: "0.15em" }}>
                Genuinely live — from your real Krystal pipeline
              </div>
              <h2 style={{ fontFamily: "Oswald", fontWeight: 600, color: CREAM }} className="text-xl">Krystal Live</h2>
            </div>
          </div>
          <button onClick={loadData} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter", fontWeight: 600 }}>
            <RotateCcw size={13} /> {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="text-xs mt-3" style={{ fontFamily: "Inter", color: C.steel }}>
          This pulls from <code style={{ fontFamily: "IBM Plex Mono" }}>api_server.py</code>, which reads the real database your <code style={{ fontFamily: "IBM Plex Mono" }}>krystal_ingestion_job.py</code> writes to — actual data ingested from your real Krystal FTPS server, not the hardcoded June 2026 export used elsewhere in this app, and not the client-side Live Feed simulation either. Order-level data only for now (revenue, order type, payment type, paid status) — item-level data isn't connected yet.
        </div>
        {lastFetched && !error && (
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ fontFamily: "IBM Plex Mono", color: C.sage }}>
            <span className="live-dot" style={{ background: C.sage }} /> Last fetched {lastFetched.toLocaleTimeString()}
            {summary?.last_synced && ` · database last updated by ingestion job at ${new Date(summary.last_synced).toLocaleString()}`}
          </div>
        )}
      </Card>

      {error && (
        <Card className="pl-c-12">
          <div className="flex items-start gap-2" style={{ fontFamily: "Inter", color: C.chili }}>
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        </Card>
      )}

      {loading && !summary && (
        <Card className="pl-c-12">
          <div className="text-sm text-center py-8" style={{ fontFamily: "Inter", color: C.steel }}>Loading real data from the API...</div>
        </Card>
      )}

      {summary && (
        <>
          <div className="pl-c-12 pl-tiles pl-tiles-4">
            <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Revenue</div>
              <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{summary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Orders</div>
              <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{summary.order_count}</div>
            </div>
            <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Avg order</div>
              <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{summary.avg_order.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded" style={{ background: summary.unpaid_count > 0 ? C.chiliSoft : C.card, border: summary.unpaid_count > 0 ? "none" : `1px solid ${C.line}` }}>
              <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: summary.unpaid_count > 0 ? C.chili : C.steel }}>Unpaid</div>
              <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: summary.unpaid_count > 0 ? C.chili : C.ink, fontWeight: 600 }}>{summary.unpaid_count} · £{summary.unpaid_total.toFixed(2)}</div>
            </div>
          </div>

          {revenueByDay?.length > 0 && (
            <Card className="pl-c-12">
              <SectionLabel eyebrow="Real, from the API" title="Revenue by Day" icon={<Radio size={16} color={C.brass} />} />
              <div className="pl-tiles" style={{ gridTemplateColumns: `repeat(${revenueByDay.length}, minmax(0,1fr))`, marginTop: 8 }}>
                {revenueByDay.map((d) => (
                  <div key={d.date} className="text-center">
                    <div className="text-[9px] mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{d.date.slice(5)}</div>
                    <div className="h-20 rounded flex items-end" style={{ background: C.paperDark }}>
                      <div className="w-full rounded" style={{ height: `${(d.revenue / maxDayRevenue) * 100}%`, background: C.brass }} />
                    </div>
                    <div className="text-[9px] mt-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>£{Math.round(d.revenue)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {orderMix && (
            <Card className="pl-c-12">
              <SectionLabel eyebrow="Real, from the API" title="Order Mix" icon={<ReceiptText size={16} color={C.brass} />} />
              <div className="pl-tiles pl-tiles-2">
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Order type</div>
                  {orderMix.by_order_type.map((t) => (
                    <BarRow key={t.type} name={t.type} primary={`£${t.revenue.toLocaleString()}`} secondary={`${t.count} orders`} pct={(t.revenue / maxMixValue) * 100} color={C.brass} />
                  ))}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Payment type</div>
                  {orderMix.by_payment_type.map((t) => (
                    <BarRow key={t.type} name={t.type} primary={`£${t.revenue.toLocaleString()}`} secondary={`${t.count}`} pct={(t.revenue / maxMixValue) * 100} color={C.sage} />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {employeeSummary && (
            <Card className="pl-c-12">
              <SectionLabel eyebrow="Real, from the API" title="Employee Hours" icon={<Users size={16} color={C.brass} />} />
              {!employeeSummary.has_data ? (
                <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>No employee timesheet data ingested yet.</div>
              ) : (
                <>
                  <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
                    Period {employeeSummary.period_start} to {employeeSummary.period_end} — derived from the file's date, not yet a real field in the export (see <code style={{ fontFamily: "IBM Plex Mono" }}>derive_period()</code>).
                  </div>
                  <div className="pl-tiles pl-tiles-3" style={{ marginBottom: 20 }}>
                    <div className="p-3 rounded" style={{ background: C.paperDark }}>
                      <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Total hours</div>
                      <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{employeeSummary.total_hours.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded" style={{ background: C.paperDark }}>
                      <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Total salary</div>
                      <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{employeeSummary.total_salary.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded" style={{ background: C.paperDark }}>
                      <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Employees</div>
                      <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{employeeSummary.employee_count}</div>
                    </div>
                  </div>
                  {employeeSummary.employees.filter((e) => e.hours > 0).map((e) => (
                    <BarRow key={e.name} name={e.name} primary={`${e.hours.toFixed(1)}h`} secondary={`£${e.salary.toLocaleString()} @ £${e.hourly_rate}/hr`} pct={(e.hours / maxEmpHours) * 100} color={C.brass} />
                  ))}
                </>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function LiveFeedPage({ simRevenue, setSimRevenue, simOrders, setSimOrders, simPerOperator, setSimPerOperator }) {
  const C = useContext(ThemeContext);
  const [running, setRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [runLog, setRunLog] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const pendingQueueRef = useRef([]);
  const pendingFilesRef = useRef(0);

  // Shared by the auto-timer AND the manual "Run ingestion now" button — same
  // logic either way, only what triggers it differs.
  const ingestPending = () => {
    const batch = pendingQueueRef.current;
    const filesThisRun = pendingFilesRef.current;
    pendingQueueRef.current = [];
    pendingFilesRef.current = 0;
    setPendingCount(0);

    if (batch.length === 0) {
      setRunLog((log) => [{ time: new Date(), files: 0, records: 0 }, ...log].slice(0, 8));
      return;
    }
    let addedRevenue = 0;
    const opUpdates = {};
    batch.forEach((o) => {
      addedRevenue += o.total;
      if (!opUpdates[o.operator]) opUpdates[o.operator] = { count: 0, revenue: 0 };
      opUpdates[o.operator].count += 1;
      opUpdates[o.operator].revenue += o.total;
    });
    setSimRevenue((r) => r + addedRevenue);
    setSimOrders((n2) => n2 + batch.length);
    setSimPerOperator((prev2) => {
      const next = { ...prev2 };
      Object.entries(opUpdates).forEach(([name, v]) => {
        next[name] = {
          count: (next[name]?.count || 0) + v.count,
          revenue: (next[name]?.revenue || 0) + v.revenue,
        };
      });
      return next;
    });
    setRunLog((log) => [{ time: new Date(), files: filesThisRun, records: batch.length }, ...log].slice(0, 8));
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsElapsed((prev) => {
        const t = prev + 1;

        // --- Stage 1+2: Cloud dashboard exports a batch to "FTP" ---
        if (t % EXPORT_EVERY === 0) {
          const n = 3 + Math.floor(Math.random() * 6);
          const batch = Array.from({ length: n }, () => {
            const item = SIM_ITEMS[Math.floor(Math.random() * SIM_ITEMS.length)];
            const operator = SIM_STAFF[Math.floor(Math.random() * SIM_STAFF.length)];
            return { item: item.name, total: item.price, operator };
          });
          pendingQueueRef.current.push(...batch);
          pendingFilesRef.current += 1;
          setPendingCount(pendingQueueRef.current.length);
          const fname = `${new Date().toLocaleTimeString(undefined, { hour12: false })}_orders.csv`;
          setRecentFiles((f) => [{ name: fname, n, source: "auto" }, ...f].slice(0, 6));
        }

        // --- Stage 3: AI ingestion job pulls whatever is pending, on schedule ---
        if (t % INGEST_EVERY === 0) ingestPending();

        return t;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const REQUIRED_COLS = ["order_id", "timestamp", "operator_id", "item", "qty", "total", "order_type", "payment_type"];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cols = results.meta.fields || [];
        const missing = REQUIRED_COLS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setUploadError(`Missing column(s): ${missing.join(", ")}. Expected the same schema mock_cloud_dashboard.py writes.`);
          return;
        }
        const rows = results.data
          .filter((r) => r.order_id)
          .map((r) => ({
            item: r.item,
            total: Number(r.total) || 0,
            operator: r.operator_id,
          }));
        if (rows.length === 0) {
          setUploadError("File parsed but contained no valid order rows.");
          return;
        }
        pendingQueueRef.current.push(...rows);
        pendingFilesRef.current += 1;
        setPendingCount(pendingQueueRef.current.length);
        setRecentFiles((f) => [{ name: file.name, n: rows.length, source: "manual" }, ...f].slice(0, 6));
      },
      error: (err) => setUploadError(`Couldn't parse file: ${err.message}`),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportCountdown = EXPORT_EVERY - (secondsElapsed % EXPORT_EVERY);
  const ingestCountdown = INGEST_EVERY - (secondsElapsed % INGEST_EVERY);
  const sortedOperators = Object.entries(simPerOperator).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxOpRevenue = sortedOperators[0]?.[1].revenue || 1;

  const resetSim = () => {
    setRunning(false);
    setSecondsElapsed(0);
    setPendingCount(0);
    setSimRevenue(0);
    setSimOrders(0);
    setSimPerOperator({});
    setRunLog([]);
    setRecentFiles([]);
    setUploadError(null);
    pendingQueueRef.current = [];
    pendingFilesRef.current = 0;
  };

  return (
    <div className="pl-grid">
      <Card className="pl-c-12">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <SectionLabel eyebrow="Runs entirely in your browser" title="Pipeline Simulation" icon={<Server size={16} color={C.brass} />} />
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning((r) => !r)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter", fontWeight: 600 }}>
              {running ? <><Pause size={13} /> Pause auto-export</> : <><Play size={13} /> Start auto-export</>}
            </button>
            <button onClick={resetSim} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.paperDark, color: C.steel, fontFamily: "Inter" }}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
        <div className="text-xs mb-5" style={{ fontFamily: "Inter", color: C.steel }}>
          A live client-side port of <code style={{ fontFamily: "IBM Plex Mono" }}>mock_cloud_dashboard.py</code> + <code style={{ fontFamily: "IBM Plex Mono" }}>ingestion_job.py</code>. Two ways to feed it: let it auto-generate batches on a timer, or upload a real CSV yourself below and trigger ingestion manually — useful since there's no real FTP server yet.
        </div>

        <div className="pl-tiles pl-tiles-4" style={{ marginBottom: 20 }}>
          <div className="p-3 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Next auto-export</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{running ? `${exportCountdown}s` : "—"}</div>
          </div>
          <div className="p-3 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Next auto-ingestion</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>{running ? `${ingestCountdown}s` : "—"}</div>
          </div>
          <div className="p-3 rounded" style={{ background: pendingCount > 0 ? C.amberSoft : C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: pendingCount > 0 ? C.amber : C.steel }}>Pending on "FTP"</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: pendingCount > 0 ? C.amber : C.ink, fontWeight: 600 }}>{pendingCount} orders</div>
          </div>
          <div className="p-3 rounded" style={{ background: C.sageSoft }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.sage }}>Synced revenue</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.sage, fontWeight: 600 }}>£{simRevenue.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="No FTP yet? Do this instead" title="Manual File Drop" icon={<FileText size={16} color={C.brass} />} />
        <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
          Upload a CSV with columns <code style={{ fontFamily: "IBM Plex Mono" }}>order_id, timestamp, operator_id, item, qty, total, order_type, payment_type</code> — exactly what <code style={{ fontFamily: "IBM Plex Mono" }}>mock_cloud_dashboard.py</code> writes. Run that script locally every ~15 minutes, download the file it produces, and drop it here — that's a real stand-in for the FTP step without needing a real server.
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>
            <FileText size={13} /> Choose CSV file
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          <button onClick={ingestPending} disabled={pendingCount === 0} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: pendingCount === 0 ? C.paperDark : C.brass, color: pendingCount === 0 ? C.steel : CREAM, fontFamily: "Inter", fontWeight: 600, opacity: pendingCount === 0 ? 0.6 : 1 }}>
            <Rss size={13} /> Run ingestion now ({pendingCount} pending)
          </button>
        </div>
        {uploadError && (
          <div className="text-xs mt-3 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.chili }}>
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" /> {uploadError}
          </div>
        )}
      </Card>

      <Card className="pl-c-6">
        <SectionLabel eyebrow={`${simOrders} orders synced`} title="Live Per-Operator Revenue" icon={<Users size={16} color={C.brass} />} />
        {sortedOperators.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>No data ingested yet.</div>
        ) : (
          sortedOperators.map(([name, v]) => (
            <BarRow key={name} name={name} primary={`${v.count} orders`} secondary={`£${v.revenue.toFixed(2)}`} pct={(v.revenue / maxOpRevenue) * 100} color={C.brass} />
          ))
        )}
      </Card>

      <Card className="pl-c-6">
        <SectionLabel eyebrow="Stage 3 audit trail" title="Ingestion Run Log" icon={<FileText size={16} color={C.brass} />} />
        {runLog.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>No runs yet.</div>
        ) : (
          runLog.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
              <span className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{r.time.toLocaleTimeString(undefined, { hour12: false })}</span>
              <span className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: r.records > 0 ? C.sage : C.steel }}>
                {r.records > 0 ? `${r.files} file(s) · ${r.records} record(s)` : "no new files"}
              </span>
            </div>
          ))
        )}

        <div className="text-[10px] uppercase tracking-widest mb-2 mt-5" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Recent files on "FTP"</div>
        {recentFiles.length === 0 ? (
          <div className="text-xs" style={{ fontFamily: "Inter", color: C.steel }}>—</div>
        ) : (
          recentFiles.map((f, i) => (
            <div key={i} className="text-xs flex items-center justify-between" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>
              <span>{f.name} ({f.n} orders)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: f.source === "manual" ? C.sageSoft : C.paperDark, color: f.source === "manual" ? C.sage : C.steel }}>{f.source === "manual" ? "manual" : "auto"}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );

}

function GapsPage({ onReset, storageError }) {
  const C = useContext(ThemeContext);
  return (
    <div className="pl-grid">
      <Card className="pl-c-12" style={{ background: BAR }}>
        <div className="flex items-center gap-2 mb-5">
          <DatabaseZap size={18} color={C.brassLight} />
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Mono", color: C.brassLight, letterSpacing: "0.15em" }}>What's blocking deeper analysis</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 600, color: CREAM }} className="text-xl">Data Gaps</h2>
          </div>
        </div>
        <div className="pl-tiles pl-tiles-2">
          {dataGaps.map((g) => (
            <div key={g.title} className="p-4 rounded" style={{ background: BAR_SOFT }}>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} color={C.brassLight} />
                <span className="text-sm" style={{ fontFamily: "Inter", color: CREAM, fontWeight: 500 }}>{g.title}</span>
              </div>
              <div className="text-xs leading-relaxed" style={{ fontFamily: "Inter", color: C.steel }}>{g.detail}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow={storageError ? "Unavailable in this view" : "Working — saved automatically"} title="Saved Data" icon={<Server size={16} color={C.brass} />} />
        {storageError ? (
          <div className="text-sm flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.chili }}>
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            Persistent storage isn't available in this session — ingredients, recipes, waste logs, and expenses will reset if you refresh.
          </div>
        ) : (
          <div className="text-sm mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
            Ingredients, recipes, waste log entries, and expenses are saved automatically as you edit them — this is a mock persistence layer standing in for the real database described in the pipeline plan, so a refresh no longer loses your work. Staff, sales, and menu data stay hardcoded from the June export, same as before.
          </div>
        )}
        <button onClick={onReset} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.chiliSoft, color: C.chili, fontFamily: "Inter", fontWeight: 600 }}>
          <RotateCcw size={13} /> Clear saved data
        </button>
      </Card>
    </div>
  );
}

/* Real average sale price per item, derived from actual June sales (val / qty) — used to
   auto-fill sale price when building a recipe against a real menu item. */
const menuItemOptions = topItems.map((d) => ({ name: d.item, price: Number((d.val / d.qty).toFixed(2)) }));
// Real average daily units sold per item, from the same June export (29 trading days) — the
// demand signal the restock calculator uses.
const itemDailyQty = Object.fromEntries(topItems.map((d) => [d.item, d.qty / 29]));

function IngredientsPage({ ingredients, setIngredients, nextIngId, setNextIngId, recipes, setRecipes }) {
  const C = useContext(ThemeContext);

  const [draftItem, setDraftItem] = useState(menuItemOptions[0].name);
  const [draftCustomName, setDraftCustomName] = useState("");
  const [draftPrice, setDraftPrice] = useState(menuItemOptions[0].price);
  const [draftLines, setDraftLines] = useState([{ ingredientId: ingredients[0]?.id ?? null, qty: 0 }]);
  const [editingName, setEditingName] = useState(null);

  const [importError, setImportError] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const importInputRef = useRef(null);
  const REQUIRED_IMPORT_COLS = ["item_name", "sale_price", "ingredient_name", "unit", "qty_per_serving"];

  const downloadTemplate = () => {
    const sample = [
      ["item_name", "sale_price", "ingredient_name", "unit", "qty_per_serving"],
      ["Latte", "3.90", "Coffee beans", "kg", "0.02"],
      ["Latte", "3.90", "Whole milk", "L", "0.15"],
      ["Cappuccino", "3.90", "Coffee beans", "kg", "0.02"],
      ["Cappuccino", "3.90", "Whole milk", "L", "0.12"],
      ["Roast Chicken Sarnie", "11.50", "Sourdough bread", "unit", "1"],
      ["Roast Chicken Sarnie", "11.50", "Roast chicken", "kg", "0.09"],
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipe_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRecipeImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSummary(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cols = results.meta.fields || [];
        const missing = REQUIRED_IMPORT_COLS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setImportError(`Missing column(s): ${missing.join(", ")}. Download the template below to see the expected format.`);
          return;
        }
        const rows = results.data.filter((r) => r.item_name && r.ingredient_name);
        if (rows.length === 0) {
          setImportError("File parsed but contained no valid rows (need at least item_name and ingredient_name on each row).");
          return;
        }

        const workingIngredients = [...ingredients];
        let nextId = nextIngId;
        const createdIngredientNames = [];

        const findOrCreateIngredient = (name, unit) => {
          const existing = workingIngredients.find((i) => i.name.toLowerCase() === name.toLowerCase());
          if (existing) return existing.id;
          const newIng = { id: nextId, name, unit: unit || "unit", cost: 0, stock: 0, threshold: 0, supplier: "" };
          workingIngredients.push(newIng);
          createdIngredientNames.push(name);
          nextId += 1;
          return newIng.id;
        };

        const groups = {};
        let skippedRows = 0;
        rows.forEach((r) => {
          const key = r.item_name.trim();
          const qty = Number(r.qty_per_serving);
          if (!r.ingredient_name || Number.isNaN(qty)) {
            skippedRows += 1;
            return;
          }
          if (!groups[key]) groups[key] = { price: Number(r.sale_price) || 0, lines: [] };
          const ingId = findOrCreateIngredient(r.ingredient_name.trim(), r.unit?.trim());
          groups[key].lines.push({ ingredientId: ingId, qty });
        });

        const newRecipes = Object.entries(groups).map(([name, g]) => {
          const cost = g.lines.reduce((sum, l) => {
            const ing = workingIngredients.find((i) => i.id === l.ingredientId);
            return sum + (ing ? ing.cost * l.qty : 0);
          }, 0);
          // prefer the real June sale price over whatever the CSV says, when the name matches an actual menu item
          const realMatch = menuItemOptions.find((m) => m.name.toLowerCase() === name.toLowerCase());
          const price = realMatch ? realMatch.price : g.price;
          return { name, price, cost, lines: g.lines, id: Date.now() + Math.random() };
        });

        setRecipes((prev) => {
          const importedNames = new Set(newRecipes.map((r) => r.name));
          return [...prev.filter((r) => !importedNames.has(r.name)), ...newRecipes];
        });
        setIngredients(workingIngredients);
        setNextIngId(nextId);

        setImportSummary({
          recipesImported: newRecipes.length,
          newIngredients: createdIngredientNames,
          skippedRows,
        });
      },
      error: (err) => setImportError(`Couldn't parse file: ${err.message}`),
    });
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const lowStock = ingredients.filter((i) => i.stock <= i.threshold);

  const onSelectMenuItem = (name) => {
    setDraftItem(name);
    const match = menuItemOptions.find((m) => m.name === name);
    if (match) setDraftPrice(match.price);
  };

  const updateLine = (idx, field, value) => {
    setDraftLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: field === "qty" ? Number(value) || 0 : value } : l)));
  };
  const addLine = () => setDraftLines((prev) => [...prev, { ingredientId: ingredients[0]?.id ?? null, qty: 0 }]);
  const removeLine = (idx) => setDraftLines((prev) => prev.filter((_, i) => i !== idx));

  const draftCost = draftLines.reduce((sum, l) => {
    const ing = ingredients.find((i) => i.id === Number(l.ingredientId));
    return sum + (ing ? ing.cost * l.qty : 0);
  }, 0);
  const draftMargin = draftPrice - draftCost;
  const draftMarginPct = draftPrice > 0 ? ((draftMargin / draftPrice) * 100).toFixed(1) : "0.0";

  const saveRecipe = () => {
    const name = draftItem === "__custom__" ? (draftCustomName || "Untitled item") : draftItem;
    setRecipes((prev) => [...prev.filter((r) => r.name !== name && r.name !== editingName), { name, price: draftPrice, cost: draftCost, lines: draftLines, id: Date.now() }]);
    resetDraft();
  };
  const removeRecipe = (id) => setRecipes((prev) => prev.filter((r) => r.id !== id));

  const resetDraft = () => {
    setEditingName(null);
    setDraftItem(menuItemOptions[0].name);
    setDraftCustomName("");
    setDraftPrice(menuItemOptions[0].price);
    setDraftLines([{ ingredientId: ingredients[0]?.id ?? null, qty: 0 }]);
  };

  const editRecipe = (r) => {
    const isReal = menuItemOptions.some((m) => m.name === r.name);
    setEditingName(r.name);
    setDraftItem(isReal ? r.name : "__custom__");
    setDraftCustomName(isReal ? "" : r.name);
    setDraftPrice(r.price);
    setDraftLines(r.lines.map((l) => ({ ...l })));
  };

  // Real ingredient usage & cost — from saved recipes × actual June sales volume for that dish.
  const ingredientUsage = ingredients
    .map((ing) => {
      const usingRecipes = recipes.filter((r) => r.lines.some((l) => Number(l.ingredientId) === ing.id));
      let totalQty = 0;
      let hasRealSales = false;
      usingRecipes.forEach((r) => {
        const item = topItems.find((t) => t.item === r.name);
        if (item) {
          hasRealSales = true;
          const line = r.lines.find((l) => Number(l.ingredientId) === ing.id);
          totalQty += (line ? line.qty : 0) * item.qty;
        }
      });
      return { ...ing, totalQty, totalCost: totalQty * ing.cost, hasRealSales };
    })
    .filter((i) => i.hasRealSales && i.totalQty > 0)
    .sort((a, b) => b.totalCost - a.totalCost);
  const maxUsageCost = ingredientUsage[0]?.totalCost || 1;

  return (
    <div className="pl-grid">
      <Card className="pl-c-12">
        <SectionLabel eyebrow="CSV upload" title="Bulk Import Recipes" icon={<Upload size={16} color={C.brass} />} />
        <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
          One row per ingredient-in-a-recipe — multiple rows per item. Columns: <code style={{ fontFamily: "IBM Plex Mono" }}>item_name, sale_price, ingredient_name, unit, qty_per_serving</code>. Any ingredient not already tracked gets created automatically at £0 cost — head to the Restock page afterward to fill in real costs. If <code style={{ fontFamily: "IBM Plex Mono" }}>item_name</code> matches a real June menu item, its real sale price is used instead of whatever the CSV says.
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>
            <Download size={13} /> Download template
          </button>
          <label className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer" style={{ background: C.brass, color: CREAM, fontFamily: "Inter", fontWeight: 600 }}>
            <Upload size={13} /> Upload recipe CSV
            <input ref={importInputRef} type="file" accept=".csv" onChange={handleRecipeImport} style={{ display: "none" }} />
          </label>
        </div>
        {importError && (
          <div className="text-xs mt-3 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.chili }}>
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" /> {importError}
          </div>
        )}
        {importSummary && (
          <div className="text-xs mt-3 p-3 rounded" style={{ background: C.sageSoft, color: C.sage, fontFamily: "Inter" }}>
            <div className="font-semibold mb-1">Imported {importSummary.recipesImported} recipe{importSummary.recipesImported !== 1 ? "s" : ""}.</div>
            {importSummary.newIngredients.length > 0 && (
              <div>Created {importSummary.newIngredients.length} new ingredient{importSummary.newIngredients.length !== 1 ? "s" : ""} at £0 cost: {importSummary.newIngredients.join(", ")} — visit the Restock page to fill in real costs and stock.</div>
            )}
            {importSummary.skippedRows > 0 && <div className="mt-1" style={{ color: C.amber }}>{importSummary.skippedRows} row(s) skipped (missing ingredient name or invalid quantity).</div>}
          </div>
        )}
      </Card>

      <Card className="pl-c-4">
        <SectionLabel eyebrow="Calculated from sales" title="Most Used Ingredients" icon={<Boxes size={16} color={C.brass} />} />
        <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
          Ranked by cost consumed in June — ingredient quantity per recipe × real units sold of that dish. Only counts ingredients linked to a recipe matched against real sales.
        </div>
        {ingredientUsage.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>Nothing to show yet — link an ingredient to a real menu item in the builder to see it ranked here.</div>
        ) : (
          ingredientUsage.map((i) => (
            <BarRow key={i.id} name={i.name} primary={`${i.totalQty.toFixed(1)}${i.unit}`} secondary={`£${i.totalCost.toFixed(2)}`} pct={(i.totalCost / maxUsageCost) * 100} color={C.brass} />
          ))
        )}
      </Card>

      <Card className="pl-c-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <SectionLabel eyebrow={editingName ? `Editing · ${editingName}` : "Build a recipe"} title="Recipe & Margin Builder" icon={<Scale size={16} color={C.brass} />} />
          {editingName && <button onClick={resetDraft} className="text-xs px-2.5 py-1 rounded" style={{ background: C.paperDark, color: C.steel, fontFamily: "Inter" }}>Cancel edit</button>}
        </div>
        <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
          Link ingredients to a menu item to compute real cost-per-dish and margin. Sale price auto-fills from real June sales data when you pick an actual menu item.
        </div>

        <div className="pl-tiles pl-tiles-2" style={{ marginBottom: 16 }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Menu item</div>
            <select value={draftItem} onChange={(e) => onSelectMenuItem(e.target.value)} className="w-full text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}>
              {menuItemOptions.map((m) => <option key={m.name} value={m.name}>{m.name} (£{m.price})</option>)}
              <option value="__custom__">Custom item...</option>
            </select>
            {draftItem === "__custom__" && (
              <input value={draftCustomName} onChange={(e) => setDraftCustomName(e.target.value)} placeholder="Item name" className="w-full mt-2 text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }} />
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Sale price (£)</div>
            <input type="number" step="0.01" value={draftPrice} onChange={(e) => setDraftPrice(Number(e.target.value) || 0)} className="w-full text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Ingredients used per serving</div>
        {draftLines.map((l, idx) => {
          const ing = ingredients.find((i) => i.id === Number(l.ingredientId));
          return (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <select value={l.ingredientId ?? ""} onChange={(e) => updateLine(idx, "ingredientId", e.target.value)} className="flex-1 text-sm px-2.5 py-1.5 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}>
                {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} (£{i.cost}/{i.unit})</option>)}
              </select>
              <input type="number" step="0.01" value={l.qty} onChange={(e) => updateLine(idx, "qty", e.target.value)} className="w-20 text-sm px-2.5 py-1.5 rounded outline-none text-right" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
              <span className="text-xs w-8" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{ing?.unit || ""}</span>
              <button onClick={() => removeLine(idx)} className="p-1 rounded" style={{ color: C.chili }}><Trash2 size={14} /></button>
            </div>
          );
        })}
        <button onClick={addLine} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded mb-4" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>
          <Plus size={13} /> Add ingredient line
        </button>

        <div className="pl-tiles pl-tiles-3" style={{ marginBottom: 16 }}>
          <div className="p-3 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Cost/serving</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{draftCost.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Margin</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{draftMargin.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded" style={{ background: Number(draftMarginPct) >= 60 ? C.sageSoft : Number(draftMarginPct) >= 40 ? C.amberSoft : C.chiliSoft }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: Number(draftMarginPct) >= 60 ? C.sage : Number(draftMarginPct) >= 40 ? C.amber : C.chili }}>Margin %</div>
            <div className="text-lg" style={{ fontFamily: "IBM Plex Mono", color: Number(draftMarginPct) >= 60 ? C.sage : Number(draftMarginPct) >= 40 ? C.amber : C.chili, fontWeight: 600 }}>{draftMarginPct}%</div>
          </div>
        </div>
        <button onClick={saveRecipe} className="text-xs px-3 py-1.5 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter", fontWeight: 600 }}>{editingName ? "Save changes" : "Save recipe"}</button>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow={`${recipes.length} saved`} title="Recipes" icon={<ClipboardCheck size={16} color={C.brass} />} />
        {recipes.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>No recipes saved yet — build one above to see it here.</div>
        ) : (
          recipes.map((r) => {
            const pct = r.price > 0 ? ((r.price - r.cost) / r.price) * 100 : 0;
            return (
              <div key={r.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div>
                  <div className="text-sm" style={{ fontFamily: "Inter", color: C.ink }}>{r.name}</div>
                  <div className="text-[11px]" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Sale £{r.price.toFixed(2)} · Cost £{r.cost.toFixed(2)} · {r.lines.length} ingredient{r.lines.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ fontFamily: "IBM Plex Mono", color: pct >= 60 ? C.sage : pct >= 40 ? C.amber : C.chili, fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                  <button onClick={() => editRecipe(r)} className="text-xs px-2.5 py-1 rounded" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>Edit</button>
                  <button onClick={() => removeRecipe(r.id)} className="p-1 rounded" style={{ color: C.chili }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      <Card className="pl-c-6">
        <SectionLabel eyebrow={lowStock.length ? "Needs attention" : "All clear"} title="Stock Alerts" icon={<PackageSearch size={16} color={C.brass} />} />
        {lowStock.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>No ingredients at or below their low-stock threshold right now.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {lowStock.map((i) => (
              <div key={i.id} className="text-sm px-3 py-2 rounded flex items-center justify-between" style={{ background: C.chiliSoft, color: C.chili, fontFamily: "Inter" }}>
                <span className="flex items-center gap-1.5"><AlertTriangle size={13} /> {i.name}</span>
                <span style={{ fontFamily: "IBM Plex Mono" }}>{i.stock}{i.unit} left · threshold {i.threshold}{i.unit}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {recipes.length > 0 ? <MarginHealthCard recipes={recipes} className="pl-c-6" /> : (
        <Card className="pl-c-6" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="text-xs text-center" style={{ fontFamily: "Inter", color: C.steel }}>Margin Health appears here once you save a recipe above.</div>
        </Card>
      )}
    </div>
  );
}

function MarginHealthCard({ recipes, className = "" }) {
  const C = useContext(ThemeContext);
  const [target, setTarget] = useState(65);

  const totalPrice = recipes.reduce((s, r) => s + r.price, 0);
  const totalCost = recipes.reduce((s, r) => s + r.cost, 0);
  const actualGP = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;
  const gap = actualGP - target;

  return (
    <Card className={className}>
      <SectionLabel eyebrow="Live · updates as you add recipes" title="Margin Health" icon={<Gauge size={16} color={C.brass} />} />
      <div className="text-xs mb-4" style={{ fontFamily: "Inter", color: C.steel }}>
        Blended actual GP% across all saved recipes, against a target you set — same idea as an actual-vs-theoretical gross profit check.
      </div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Target GP%</span>
        <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value) || 0)} className="w-16 text-sm px-2 py-1 rounded outline-none text-right" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>
          <span>Actual</span><span>{actualGP.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full w-full" style={{ background: C.paperDark }}>
          <div className="h-3 rounded-full" style={{ width: `${Math.min(100, actualGP)}%`, background: actualGP >= target ? C.sage : C.chili }} />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>
          <span>Target</span><span>{target.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full w-full" style={{ background: C.paperDark }}>
          <div className="h-3 rounded-full" style={{ width: `${Math.min(100, target)}%`, background: C.steel, opacity: 0.5 }} />
        </div>
      </div>

      <div className="p-3 rounded flex items-center justify-between" style={{ background: gap >= 0 ? C.sageSoft : C.chiliSoft }}>
        <span className="text-xs" style={{ fontFamily: "IBM Plex Mono", color: gap >= 0 ? C.sage : C.chili }}>Gap vs target</span>
        <span className="text-sm font-semibold" style={{ fontFamily: "IBM Plex Mono", color: gap >= 0 ? C.sage : C.chili }}>{gap >= 0 ? "+" : ""}{gap.toFixed(1)}%</span>
      </div>
    </Card>
  );
}

function RestockPage({ ingredients, setIngredients, nextIngId, setNextIngId, recipes }) {
  const C = useContext(ThemeContext);
  const [leadTime, setLeadTime] = useState(2);
  const [coverDays, setCoverDays] = useState(7);
  const [selected, setSelected] = useState({});
  const [qtyOverride, setQtyOverride] = useState({});
  const [copiedSupplier, setCopiedSupplier] = useState(null);

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: field === "cost" || field === "stock" || field === "threshold" ? Number(value) || 0 : value } : r)));
  };
  const removeIngredient = (id) => setIngredients((prev) => prev.filter((r) => r.id !== id));
  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: nextIngId, name: "New ingredient", unit: "unit", cost: 0, stock: 0, threshold: 0, supplier: "" }]);
    setNextIngId((n) => n + 1);
  };

  // Daily demand per ingredient, derived from saved recipes × real per-item sales rate.
  const computed = ingredients.map((ing) => {
    const usingRecipes = recipes.filter((r) => r.lines.some((l) => Number(l.ingredientId) === ing.id));
    let dailyDemand = 0;
    let hasRealDemand = false;
    usingRecipes.forEach((r) => {
      const rate = itemDailyQty[r.name];
      if (rate) {
        hasRealDemand = true;
        const line = r.lines.find((l) => Number(l.ingredientId) === ing.id);
        dailyDemand += rate * (line ? line.qty : 0);
      }
    });

    let status, daysOfCover, suggestedQty;
    if (hasRealDemand && dailyDemand > 0) {
      daysOfCover = ing.stock / dailyDemand;
      suggestedQty = Math.max(0, dailyDemand * (leadTime + coverDays) - ing.stock);
      status = daysOfCover <= leadTime ? "critical" : daysOfCover <= leadTime + coverDays ? "low" : "ok";
    } else {
      daysOfCover = null;
      suggestedQty = null;
      status = ing.stock <= ing.threshold ? "low" : "ok";
    }
    return { ...ing, dailyDemand, hasRealDemand, daysOfCover, suggestedQty, status };
  });

  const flagged = computed.filter((c) => c.status !== "ok").sort((a, b) => (a.status === "critical" ? -1 : 1) - (b.status === "critical" ? -1 : 1));

  const toggleSelected = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const getQty = (c) => {
    if (qtyOverride[c.id] !== undefined) return qtyOverride[c.id];
    return c.suggestedQty !== null ? Math.ceil(c.suggestedQty * 10) / 10 : c.threshold || 1;
  };
  const setQty = (id, val) => setQtyOverride((prev) => ({ ...prev, [id]: Number(val) || 0 }));

  const selectedItems = flagged.filter((c) => selected[c.id]);
  const bySupplier = selectedItems.reduce((acc, c) => {
    const key = c.supplier || "No supplier set";
    acc[key] = acc[key] || [];
    acc[key].push(c);
    return acc;
  }, {});

  const copyRequest = (supplier, items) => {
    const lines = items.map((c) => `- ${c.name}: ${getQty(c)}${c.unit}`).join("\n");
    const text = `Restock request — ${supplier}\nGenerated ${new Date().toLocaleDateString()}\n\n${lines}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSupplier(supplier);
        setTimeout(() => setCopiedSupplier(null), 1500);
      }).catch(() => {});
    }
  };

  const statusStyle = { critical: { bg: C.chiliSoft, text: C.chili }, low: { bg: C.amberSoft, text: C.amber }, ok: { bg: C.sageSoft, text: C.sage } };

  return (
    <div className="pl-grid">
      <Card className="pl-c-12">
        <SectionLabel eyebrow="Editable · your data" title="Stock" icon={<Boxes size={16} color={C.brass} />} />
        <div className="text-xs mb-4 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          Nothing here comes from the POS export — there's no inventory or ingredient cost data in any file uploaded. Fill in real cost, stock, and threshold to drive the restock suggestions below.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Ingredient</th>
                <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Unit</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Cost/unit (£)</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Stock</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Low at</th>
                <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Supplier</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((r) => {
                const low = r.stock <= r.threshold;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.line}`, background: low ? C.chiliSoft : "transparent" }}>
                    <td className="py-1.5">
                      <input value={r.name} onChange={(e) => updateIngredient(r.id, "name", e.target.value)} className="text-sm px-2 py-1 rounded outline-none w-full" style={{ background: "transparent", fontFamily: "Inter", color: C.ink, border: "1px solid transparent" }} />
                    </td>
                    <td className="py-1.5">
                      <select value={r.unit} onChange={(e) => updateIngredient(r.id, "unit", e.target.value)} className="text-xs px-1.5 py-1 rounded outline-none" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }}>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="unit">unit</option>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                      </select>
                    </td>
                    <td className="text-right py-1.5">
                      <input type="number" step="0.01" value={r.cost} onChange={(e) => updateIngredient(r.id, "cost", e.target.value)} className="text-sm px-2 py-1 rounded outline-none text-right w-20" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
                    </td>
                    <td className="text-right py-1.5">
                      <input type="number" step="0.1" value={r.stock} onChange={(e) => updateIngredient(r.id, "stock", e.target.value)} className="text-sm px-2 py-1 rounded outline-none text-right w-16" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: low ? C.chili : C.ink, border: `1px solid ${C.line}` }} />
                    </td>
                    <td className="text-right py-1.5">
                      <input type="number" step="0.1" value={r.threshold} onChange={(e) => updateIngredient(r.id, "threshold", e.target.value)} className="text-sm px-2 py-1 rounded outline-none text-right w-16" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
                    </td>
                    <td className="py-1.5">
                      <input value={r.supplier} onChange={(e) => updateIngredient(r.id, "supplier", e.target.value)} placeholder="—" className="text-sm px-2 py-1 rounded outline-none w-28" style={{ background: "transparent", fontFamily: "Inter", color: C.ink, border: "1px solid transparent" }} />
                    </td>
                    <td className="text-right py-1.5">
                      <button onClick={() => removeIngredient(r.id)} className="p-1 rounded" style={{ color: C.chili }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={addIngredient} className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>
          <Plus size={13} /> Add ingredient
        </button>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="Auto-calculated" title="Restock Requests" icon={<Truck size={16} color={C.brass} />} />
        <div className="text-xs mb-4 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          Not a live AI call — this is deterministic reorder-point math (avg daily demand × lead time + cover, minus stock on hand), same logic as the forecasting model built earlier. Demand comes from real June sales rates for ingredients linked to a saved recipe; ingredients without a recipe fall back to a simple stock-vs-threshold check with no suggested quantity.
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-5 p-3 rounded" style={{ background: C.paperDark }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Supplier lead time (days)</div>
            <input type="number" min="0" value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value) || 0)} className="w-20 text-sm px-2.5 py-1.5 rounded outline-none" style={{ background: C.card, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Target cover after delivery (days)</div>
            <input type="number" min="0" value={coverDays} onChange={(e) => setCoverDays(Number(e.target.value) || 0)} className="w-20 text-sm px-2.5 py-1.5 rounded outline-none" style={{ background: C.card, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
          </div>
        </div>

        {flagged.length === 0 ? (
          <div className="text-sm" style={{ fontFamily: "Inter", color: C.steel }}>Nothing needs restocking right now, based on current stock, thresholds, and recipe demand.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  <th className="w-8"></th>
                  <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Ingredient</th>
                  <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Status</th>
                  <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Stock</th>
                  <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Days cover</th>
                  <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Suggested qty</th>
                  <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((c) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="py-2">
                      <input type="checkbox" checked={!!selected[c.id]} onChange={() => toggleSelected(c.id)} />
                    </td>
                    <td className="py-2" style={{ color: C.ink }}>{c.name}</td>
                    <td className="py-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full uppercase" style={{ background: statusStyle[c.status].bg, color: statusStyle[c.status].text, fontFamily: "IBM Plex Mono" }}>{c.status}</span>
                    </td>
                    <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{c.stock}{c.unit}</td>
                    <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{c.hasRealDemand ? `${c.daysOfCover.toFixed(1)}d` : "no recipe"}</td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={getQty(c)}
                          onChange={(e) => setQty(c.id, e.target.value)}
                          className="w-20 text-sm px-2 py-1 rounded outline-none text-right"
                          style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }}
                        />
                        <span className="text-[11px]" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{c.unit}</span>
                      </div>
                    </td>
                    <td className="py-2" style={{ fontFamily: "Inter", color: C.steel }}>{c.supplier || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedItems.length > 0 && (
        <Card className="pl-c-12">
          <SectionLabel eyebrow="Ready to send" title="Generated Requests" icon={<ClipboardCheck size={16} color={C.brass} />} />
          <div className="flex flex-col gap-4">
            {Object.entries(bySupplier).map(([supplier, items]) => (
              <div key={supplier} className="p-4 rounded" style={{ background: C.paperDark }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium" style={{ fontFamily: "Inter", color: C.ink }}>{supplier}</div>
                    <div className="text-[11px]" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{new Date().toLocaleDateString()} · {items.length} item{items.length > 1 ? "s" : ""}</div>
                  </div>
                  <button onClick={() => copyRequest(supplier, items)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter" }}>
                    {copiedSupplier === supplier ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy request</>}
                  </button>
                </div>
                <ul className="text-sm" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>
                  {items.map((c) => <li key={c.id} className="py-0.5">· {c.name}: {getQty(c)}{c.unit}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

const WASTE_CATEGORIES = ["Dairy", "Bread & Bakery", "Produce", "Meat & Fish", "Dry Goods", "Beverages", "Other"];
const WASTE_REASONS = ["Broken", "End of day", "Expired", "Theft", "Other"];
const waslteStaffNames = rosterRates.slice(0, 10).map((r) => r.name);
const donutColors = (C) => [C.brass, C.sage, C.chili, C.brassLight, C.steel, C.amber, C.sageSoft];

function WastePage({ wasteLog, setWasteLog }) {
  const C = useContext(ThemeContext);
  const [draft, setDraft] = useState({ item: "", category: WASTE_CATEGORIES[0], qty: "", unit: "kg", value: "", reason: WASTE_REASONS[0], staff: waslteStaffNames[0] });

  const addEntry = () => {
    if (!draft.item || !draft.value) return;
    setWasteLog((prev) => [...prev, { ...draft, id: Date.now(), value: Number(draft.value) || 0, qty: Number(draft.qty) || 0, date: new Date().toLocaleDateString() }]);
    setDraft((d) => ({ ...d, item: "", qty: "", value: "" }));
  };
  const removeEntry = (id) => setWasteLog((prev) => prev.filter((w) => w.id !== id));

  const totalWaste = wasteLog.reduce((sum, w) => sum + w.value, 0);
  const wastePct = REVENUE > 0 ? (totalWaste / REVENUE) * 100 : 0;

  const byCategory = WASTE_CATEGORIES.map((cat) => ({
    name: cat,
    value: wasteLog.filter((w) => w.category === cat).reduce((s, w) => s + w.value, 0),
  })).filter((c) => c.value > 0);

  const byReason = WASTE_REASONS.map((r) => ({
    name: r,
    value: wasteLog.filter((w) => w.reason === r).reduce((s, w) => s + w.value, 0),
  }));

  const byStaff = Object.values(
    wasteLog.reduce((acc, w) => {
      acc[w.staff] = acc[w.staff] || { staff: w.staff, count: 0, value: 0 };
      acc[w.staff].count += 1;
      acc[w.staff].value += w.value;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const colors = donutColors(C);

  return (
    <div className="pl-grid">
      <div className="pl-c-12 pl-tiles pl-tiles-3">
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Total sales (June, real)</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{REVENUE.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Logged waste</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{totalWaste.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded" style={{ background: wastePct > 1 ? C.chiliSoft : C.sageSoft }}>
          <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: wastePct > 1 ? C.chili : C.sage }}>% waste vs sales</div>
          <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: wastePct > 1 ? C.chili : C.sage, fontWeight: 600 }}>{wastePct.toFixed(2)}%</div>
        </div>
      </div>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="Log an entry" title="Waste Log" icon={<Trash size={16} color={C.brass} />} />
        <div className="text-xs mb-4 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          None of this comes from the POS export — waste isn't tracked there. Log real entries below as they happen and the charts and leaderboard build themselves.
        </div>
        <div className="pl-tiles pl-tiles-6" style={{ marginBottom: 16 }}>
          <input value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} placeholder="Item" className="col-span-2 text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }} />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="text-xs px-2 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}>
            {WASTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" step="0.1" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: e.target.value })} placeholder="Qty" className="text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
          <input type="number" step="0.01" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} placeholder="Value £" className="text-sm px-2.5 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }} />
          <select value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} className="text-xs px-2 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}>
            {WASTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={draft.staff} onChange={(e) => setDraft({ ...draft, staff: e.target.value })} className="col-span-2 text-xs px-2 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }}>
            {waslteStaffNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={addEntry} className="col-span-2 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded" style={{ background: C.brass, color: CREAM, fontFamily: "Inter", fontWeight: 600 }}>
            <Plus size={13} /> Log waste
          </button>
        </div>

        {wasteLog.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  <th className="text-left py-1.5" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 400 }}>Item</th>
                  <th className="text-left py-1.5" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 400 }}>Category</th>
                  <th className="text-left py-1.5" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 400 }}>Reason</th>
                  <th className="text-left py-1.5" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 400 }}>Logged by</th>
                  <th className="text-right py-1.5" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 400 }}>Value</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {wasteLog.slice().reverse().map((w) => (
                  <tr key={w.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="py-1.5" style={{ color: C.ink }}>{w.item}</td>
                    <td className="py-1.5" style={{ color: C.steel }}>{w.category}</td>
                    <td className="py-1.5" style={{ color: C.steel }}>{w.reason}</td>
                    <td className="py-1.5" style={{ color: C.steel }}>{w.staff}</td>
                    <td className="text-right py-1.5" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>£{w.value.toFixed(2)}</td>
                    <td className="text-right py-1.5"><button onClick={() => removeEntry(w.id)} style={{ color: C.chili }}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {wasteLog.length > 0 && (
        <div className="pl-c-12 pl-grid">
          <Card className="pl-c-6">
            <SectionLabel eyebrow="Live breakdown" title="Waste by Category" icon={<PackageSearch size={16} color={C.brass} />} />
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {byCategory.map((entry, i) => <Cell key={entry.name} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: CREAM }} formatter={(v) => [`£${v.toFixed(2)}`, "Value"]} />
                <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 11, color: C.steel }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="pl-c-6">
            <SectionLabel eyebrow="Live breakdown" title="Waste by Reason" icon={<AlertTriangle size={16} color={C.brass} />} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byReason} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: C.steel }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: C.steel }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `£${v}`} />
                <Tooltip contentStyle={{ background: BAR, border: "none", borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: CREAM }} formatter={(v) => [`£${v.toFixed(2)}`, "Value"]} cursor={{ fill: C.paperDark }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {byReason.map((entry, i) => <Cell key={entry.name} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {byStaff.length > 0 && (
        <Card className="pl-c-12">
          <SectionLabel eyebrow="Live leaderboard" title="Waste Logs Leaderboard" icon={<Users size={16} color={C.brass} />} />
          <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Team member</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Entries</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Logged value</th>
              </tr>
            </thead>
            <tbody>
              {byStaff.map((s) => (
                <tr key={s.staff} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="py-2" style={{ color: C.ink }}>{s.staff}</td>
                  <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{s.count}</td>
                  <td className="text-right py-2" style={{ fontFamily: "IBM Plex Mono", color: C.chili }}>£{s.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ExpensesPage({ rows, setRows, nextId, setNextId }) {
  const C = useContext(ThemeContext);

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: field === "monthly" ? Number(value) || 0 : value } : r)));
  };
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, name: "New expense", monthly: 0 }]);
    setNextId((n) => n + 1);
  };

  const otherTotal = rows.reduce((sum, r) => sum + r.monthly, 0);
  const totalMonthly = otherTotal + PAYROLL;
  const totalDaily = totalMonthly / 30;
  const operatingProfit = REVENUE - totalMonthly;
  const operatingMargin = ((operatingProfit / REVENUE) * 100).toFixed(1);

  return (
    <div className="pl-grid">
      <Card className="pl-c-12">
        <SectionLabel eyebrow="Editable" title="Operating Expenses" icon={<Wallet size={16} color={C.brass} />} />
        <div className="text-xs mb-4 flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          Only staff wages come from real data below (from the timesheet export). Rent, utilities, and other fixed costs aren't in any file uploaded yet — add your real figures to make the totals meaningful.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "Inter", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <th className="text-left py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Expense</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Monthly (£)</th>
                <th className="text-right py-2" style={{ color: C.steel, fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 400 }}>Daily (£)</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-2.5 flex items-center gap-1.5" style={{ color: C.ink }}>
                  <Lock size={11} color={C.steel} /> Staff wages
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.sageSoft, color: C.sage, fontFamily: "IBM Plex Mono" }}>from POS</span>
                </td>
                <td className="text-right" style={{ fontFamily: "IBM Plex Mono", color: C.ink }}>{PAYROLL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="text-right" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{(PAYROLL / 30).toFixed(2)}</td>
                <td></td>
              </tr>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="py-2">
                    <input
                      value={r.name}
                      onChange={(e) => updateRow(r.id, "name", e.target.value)}
                      className="text-sm px-2 py-1 rounded outline-none w-full"
                      style={{ background: "transparent", fontFamily: "Inter", color: C.ink, border: `1px solid transparent` }}
                    />
                  </td>
                  <td className="text-right">
                    <input
                      type="number"
                      value={r.monthly}
                      onChange={(e) => updateRow(r.id, "monthly", e.target.value)}
                      className="text-sm px-2 py-1 rounded outline-none text-right w-24"
                      style={{ background: C.paperDark, fontFamily: "IBM Plex Mono", color: C.ink, border: `1px solid ${C.line}` }}
                    />
                  </td>
                  <td className="text-right" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>{(r.monthly / 30).toFixed(2)}</td>
                  <td className="text-right">
                    <button onClick={() => removeRow(r.id)} className="p-1 rounded" style={{ color: C.chili }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2.5" style={{ color: C.ink, fontWeight: 600 }}>Total</td>
                <td className="text-right" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="text-right" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{totalDaily.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button onClick={addRow} className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded" style={{ background: C.paperDark, color: C.ink, fontFamily: "Inter" }}>
          <Plus size={13} /> Add expense
        </button>
      </Card>

      <Card className="pl-c-12">
        <SectionLabel eyebrow="Computed" title="Operating Profit Estimate" icon={<TrendingUp size={16} color={C.brass} />} />
        <div className="pl-tiles pl-tiles-3">
          <div className="p-4 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Revenue (June, real)</div>
            <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{REVENUE.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded" style={{ background: C.paperDark }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: C.steel }}>Total expenses</div>
            <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: C.ink, fontWeight: 600 }}>£{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
          </div>
          <div className="p-4 rounded" style={{ background: operatingProfit >= 0 ? C.sageSoft : C.chiliSoft }}>
            <div className="text-[10px] uppercase" style={{ fontFamily: "IBM Plex Mono", color: operatingProfit >= 0 ? C.sage : C.chili }}>Est. operating profit</div>
            <div className="text-xl" style={{ fontFamily: "IBM Plex Mono", color: operatingProfit >= 0 ? C.sage : C.chili, fontWeight: 600 }}>
              £{operatingProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })} <span className="text-sm">({operatingMargin}%)</span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs flex items-start gap-1.5" style={{ fontFamily: "Inter", color: C.steel }}>
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" color={C.brass} />
          This excludes cost of goods sold — ingredient costs aren't tracked in the POS export, so true net profit will be lower than shown here. See Data Gaps.
        </div>
      </Card>
    </div>
  );
}

function ExpoPage() {
  const C = useContext(ThemeContext);
  const [chat, setChat] = useState([
    { from: "expo", text: "June's numbers are in: £74,648 across 2,102 orders, average order £35.51. Labour is running at 20% of revenue — healthy for hospitality. Weekends carry the business: Sat + Sun are 47% of the month's revenue on just 2 of 7 days." },
  ]);
  const [input, setInput] = useState("");
  const presets = ["Is my labour cost healthy?", "Which items sell best?", "What data am I missing?", "Why did 21 June spike?"];
  const replies = {
    "Is my labour cost healthy?": "20% of revenue is on the healthy side — hospitality typically runs 25-35%. Worth checking the Salary column includes NI/pension, or this may be underestimating true cost.",
    "Which items sell best?": "Latte leads on units (950 sold, £3,705), but the Smoked Salmon dish earns nearly as much revenue from just 274 covers — about £13.50 a plate, your strongest per-cover item.",
    "What data am I missing?": "Four gaps block deeper analysis right now: no ingredient costs (blocks margins), no order timestamps (blocks hourly rhythm), no live inventory feed, and no per-shift rota detail. See the Data Gaps page for specifics.",
    "Why did 21 June spike?": "21 June was a Sunday and took £6,130 — about £1,600 above the next-best Sunday. That's Father's Day 2026, most likely, though I can't confirm without a calendar feed.",
  };
  const send = (text) => {
    if (!text.trim()) return;
    setChat((c) => [...c, { from: "user", text }]);
    setInput("");
    setTimeout(() => setChat((c) => [...c, { from: "expo", text: replies[text] || "I can only answer from what's in this export right now — ask about revenue, orders, staff hours, or category mix." }]), 500);
  };
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: 560, maxWidth: 640, margin: "0 auto" }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} color={C.brass} />
        <div>
          <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Mono", color: C.brass, letterSpacing: "0.15em" }}>Expo</div>
          <h2 style={{ fontFamily: "Oswald", fontWeight: 600, color: C.ink }} className="text-lg leading-none">Ask the Pass</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mb-3 flex flex-col gap-2 pr-1">
        {chat.map((m, i) => (
          <div key={i} className="text-sm px-3 py-2 rounded max-w-[85%]" style={{ fontFamily: "Inter", alignSelf: m.from === "user" ? "flex-end" : "flex-start", background: m.from === "user" ? C.brass : C.paperDark, color: m.from === "user" ? CREAM : C.ink }}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {presets.map((p) => <button key={p} onClick={() => send(p)} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: C.paperDark, color: C.steel, fontFamily: "IBM Plex Mono" }}>{p}</button>)}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Ask about June's numbers..." className="flex-1 text-sm px-3 py-2 rounded outline-none" style={{ background: C.paperDark, fontFamily: "Inter", color: C.ink, border: `1px solid ${C.line}` }} />
        <button onClick={() => send(input)} className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: C.brass }}><Send size={15} color={C.paper} /></button>
      </div>
    </Card>
  );
}

/* ---------- App shell ---------- */

export default function PasslineApp() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const clockStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const C = dark ? darkColors : lightColors;

  const [expenseRows, setExpenseRows] = useState(DEFAULT_EXPENSE_ROWS);
  const [nextExpenseId, setNextExpenseId] = useState(6);
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS);
  const [nextIngId, setNextIngId] = useState(6);
  const [recipes, setRecipes] = useState([]);
  const [wasteLog, setWasteLog] = useState([]);

  // Live Feed simulation totals — lifted here so other pages can show them as a
  // clearly-labeled addendum, without blending simulated orders into the real
  // June figures those pages are built on.
  const [simRevenue, setSimRevenue] = useState(0);
  const [simOrders, setSimOrders] = useState(0);
  const [simPerOperator, setSimPerOperator] = useState({});

  // --- Persistence: load saved data once on mount ---
  const [dataLoaded, setDataLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      if (!window.storage) { if (!cancelled) { setDataLoaded(true); setStorageError(true); } return; }
      try {
        const ops = await window.storage.get("operations-data", false).catch(() => null);
        if (ops && !cancelled) {
          const data = JSON.parse(ops.value);
          if (data.ingredients) setIngredients(data.ingredients);
          if (data.nextIngId) setNextIngId(data.nextIngId);
          if (data.recipes) setRecipes(data.recipes);
        }
      } catch (e) { /* nothing saved yet — keep defaults */ }
      try {
        const waste = await window.storage.get("waste-log", false).catch(() => null);
        if (waste && !cancelled) setWasteLog(JSON.parse(waste.value));
      } catch (e) { /* nothing saved yet */ }
      try {
        const exp = await window.storage.get("expenses-data", false).catch(() => null);
        if (exp && !cancelled) {
          const data = JSON.parse(exp.value);
          if (data.expenseRows) setExpenseRows(data.expenseRows);
          if (data.nextExpenseId) setNextExpenseId(data.nextExpenseId);
        }
      } catch (e) { /* nothing saved yet */ }
      if (!cancelled) setDataLoaded(true);
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // --- Persistence: save on change (skipped until initial load completes) ---
  useEffect(() => {
    if (!dataLoaded || !window.storage) return;
    window.storage.set("operations-data", JSON.stringify({ ingredients, nextIngId, recipes }), false).catch(() => setStorageError(true));
  }, [ingredients, nextIngId, recipes, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded || !window.storage) return;
    window.storage.set("waste-log", JSON.stringify(wasteLog), false).catch(() => setStorageError(true));
  }, [wasteLog, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded || !window.storage) return;
    window.storage.set("expenses-data", JSON.stringify({ expenseRows, nextExpenseId }), false).catch(() => setStorageError(true));
  }, [expenseRows, nextExpenseId, dataLoaded]);

  const resetAllData = async () => {
    if (!window.confirm("Clear all saved ingredients, recipes, waste logs, and expenses? This can't be undone.")) return;
    setIngredients(DEFAULT_INGREDIENTS);
    setNextIngId(6);
    setRecipes([]);
    setWasteLog([]);
    setExpenseRows(DEFAULT_EXPENSE_ROWS);
    setNextExpenseId(6);
    if (window.storage) {
      try {
        await window.storage.delete("operations-data", false).catch(() => {});
        await window.storage.delete("waste-log", false).catch(() => {});
        await window.storage.delete("expenses-data", false).catch(() => {});
      } catch (e) {}
    }
  };

  const currentGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.id === page));
  const currentPage = PAGES.find((p) => p.id === page);

  return (
    <ThemeContext.Provider value={C}>
    <div style={{ background: C.paper, minHeight: "100%", fontFamily: "Inter" }}>
      <style>{FONTS}</style>

      {/* Top bar */}
      <div style={{ background: BAR }} className="px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div style={{ background: C.brass }} className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"><ChefHat size={16} color={CREAM} /></div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "Oswald", color: CREAM, letterSpacing: "0.04em" }} className="text-lg font-semibold leading-none">PASSLINE</span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(95,115,80,0.18)" }}>
                <span className="live-dot" style={{ background: C.sage }} />
                <span style={{ fontFamily: "IBM Plex Mono", color: C.sage, fontSize: 9, letterSpacing: "0.08em" }}>LIVE</span>
              </span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.brassLight }} className="text-[10px] tracking-widest">JUNE 2026 · POS EXPORT CONNECTED</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded" style={{ background: BAR_SOFT }}>
            <span className="live-dot" style={{ background: C.sage }} />
            <span style={{ fontFamily: "IBM Plex Mono", color: C.steel, fontSize: 11 }}>Synced {clockStr}</span>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
            style={{ background: BAR_SOFT, color: CREAM, fontFamily: "Inter" }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm" style={{ background: BAR_SOFT, color: CREAM, fontFamily: "Inter" }}>1 Jun – 29 Jun <ChevronDown size={14} /></button>
          <div className="relative">
            <Bell size={18} color={CREAM} />
            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center pulse-badge" style={{ background: C.chili, color: CREAM, fontFamily: "'IBM Plex Mono', monospace" }}>4</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: BAR_SOFT, borderBottom: `1px solid ${BAR_SOFT}` }} className="px-4 py-1 flex items-center gap-1 overflow-x-auto">
        {PAGES.map((p) => {
          const active = page === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              className="px-3 py-2.5 text-sm flex-shrink-0"
              style={{
                fontFamily: "Inter",
                color: active ? C.brassLight : C.steel,
                borderBottom: active ? `2px solid ${C.brass}` : "2px solid transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ fontFamily: "IBM Plex Mono", color: C.brass, letterSpacing: "0.15em" }}>{currentGroup?.label}</div>
            <h1 style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 24, color: C.ink }}>{currentPage?.label}</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: C.sageSoft }}>
            <span className="live-dot" style={{ background: C.sage }} />
            <span style={{ fontFamily: "IBM Plex Mono", color: C.sage, fontSize: 10 }}>Report live as of {clockStr}</span>
          </div>
        </div>
        {!dataLoaded ? (
          <div className="flex items-center gap-2 py-12 justify-center" style={{ fontFamily: "Inter", color: C.steel }}>
            <span className="live-dot" style={{ background: C.brass }} />
            Loading saved data...
          </div>
        ) : (
          <>
            {page === "dashboard" && <DashboardPage expenseRows={expenseRows} simRevenue={simRevenue} simOrders={simOrders} />}
            {page === "locations" && <AllLocationsPage />}
            {page === "menu" && <MenuPage />}
            {page === "ingredients" && <IngredientsPage ingredients={ingredients} setIngredients={setIngredients} nextIngId={nextIngId} setNextIngId={setNextIngId} recipes={recipes} setRecipes={setRecipes} />}
            {page === "restock" && <RestockPage ingredients={ingredients} setIngredients={setIngredients} nextIngId={nextIngId} setNextIngId={setNextIngId} recipes={recipes} />}
            {page === "waste" && <WastePage wasteLog={wasteLog} setWasteLog={setWasteLog} />}
            {page === "staff" && <StaffPage />}
            {page === "expenses" && <ExpensesPage rows={expenseRows} setRows={setExpenseRows} nextId={nextExpenseId} setNextId={setNextExpenseId} />}
            {page === "pl" && <PLPage expenseRows={expenseRows} ingredients={ingredients} recipes={recipes} />}
            {page === "gaps" && <GapsPage onReset={resetAllData} storageError={storageError} />}
            {page === "livefeed" && <LiveFeedPage simRevenue={simRevenue} setSimRevenue={setSimRevenue} simOrders={simOrders} setSimOrders={setSimOrders} simPerOperator={simPerOperator} setSimPerOperator={setSimPerOperator} />}
            {page === "krystal" && <KrystalLivePage />}
            {page === "expo" && <ExpoPage />}
          </>
        )}
      </div>
    </div>
    </ThemeContext.Provider>
  );
}
