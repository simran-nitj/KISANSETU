import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  CreditCard,
  Headphones,
  Languages,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tractor,
  TrendingUp,
  Wallet,
  Wheat,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import mascot from "../assets/mascot.png";
import heroImage from "../assets/hero.png";

const equipment = [
  {
    name: "Mahindra 575 DI Tractor",
    category: "Tractor",
    location: "Ludhiana, Punjab",
    price: "Rs 1,450/day",
    rating: "4.9",
    status: "Available today",
    tags: ["KYC verified", "Insured", "GPS ready"]
  },
  {
    name: "Sonalika Rotavator",
    category: "Soil preparation",
    location: "Karnal, Haryana",
    price: "Rs 650/hour",
    rating: "4.8",
    status: "Next slot 4 PM",
    tags: ["Owner pickup", "Low usage", "Top rated"]
  },
  {
    name: "Drone Sprayer XAG P100",
    category: "Drone rental",
    location: "Patiala, Punjab",
    price: "Rs 420/acre",
    rating: "4.7",
    status: "2 pilots online",
    tags: ["Pilot included", "Weather synced", "Fast booking"]
  }
];

const stats = [
  ["18K+", "Farmers onboarded"],
  ["4,800+", "Verified machines"],
  ["72", "Districts connected"],
  ["Rs 2.4Cr", "Owner income tracked"]
];

const workflows = [
  ["Search nearby", "Filter by crop, price, distance, availability, rating and verified status."],
  ["Book securely", "Pay advance and deposit through Razorpay-ready transaction flows."],
  ["Track and chat", "Coordinate with the owner using real-time booking updates and support chat."],
  ["Settle fast", "Wallet, refunds, invoices, GST fields and platform commission are recorded."]
];

const modules = [
  ["Owner Dashboard", BarChart3, "Revenue, bookings, calendars, equipment health and income analytics."],
  ["Customer Rentals", CalendarDays, "Current rentals, past bookings, wishlists, invoices and returns."],
  ["Admin Control", ShieldCheck, "KYC review, listing approval, reports, moderation and audit logs."],
  ["Call Center", Headphones, "Executive booking, farmer lookup, support tickets and assisted workflows."],
  ["AI Recommendations", Bot, "Seasonal, crop-based, popularity and nearby machine suggestions."],
  ["Weather Advisory", CloudSun, "Rental planning with weather-aware crop and equipment guidance."]
];

const schemes = ["PM Kisan", "Subsidy Finder", "Crop Insurance", "Agri Loans"];

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-900/10 bg-[#f8fbf4]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a className="flex items-center gap-3" href="#home" aria-label="Kisan Setu home">
          <img src={mascot} className="h-12 w-12 object-contain" alt="" />
          <div>
            <p className="text-xl font-black leading-none text-emerald-950">
              Kisan<span className="text-emerald-600">Setu</span>
            </p>
            <p className="text-xs font-bold uppercase text-stone-500">Connect Share Grow</p>
          </div>
        </a>

        <div className="hidden items-center gap-7 text-sm font-bold text-stone-600 lg:flex">
          <a href="#marketplace">Marketplace</a>
          <a href="#dashboards">Dashboards</a>
          <a href="#schemes">Schemes</a>
          <a href="#support">Support</a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-md border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 sm:block"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/10"
          >
            List Equipment
          </Link>
          <button
            className="rounded-md border border-stone-300 p-2 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-emerald-900/10 bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-bold text-stone-600">
            <a href="#marketplace" onClick={() => setMenuOpen(false)}>Marketplace</a>
            <a href="#dashboards" onClick={() => setMenuOpen(false)}>Dashboards</a>
            <a href="#schemes" onClick={() => setMenuOpen(false)}>Schemes</a>
            <a href="#support" onClick={() => setMenuOpen(false)}>Support</a>
            <Link to="/login" className="font-black text-emerald-700" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function SearchPanel() {
  return (
    <div className="mt-8 grid gap-3 rounded-lg border border-emerald-900/10 bg-white p-3 shadow-2xl shadow-emerald-950/10 md:grid-cols-[1.4fr_1fr_1fr_auto]">
      <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
        <Search className="text-emerald-700" size={20} />
        <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Search tractor, drone, harvester..." />
      </label>
      <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
        <MapPin className="text-emerald-700" size={20} />
        <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="District or pincode" />
      </label>
      <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
        <CalendarDays className="text-emerald-700" size={20} />
        <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Rental date" />
      </label>
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white">
        Find
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function EquipmentCard({ item }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
          <Tractor />
        </div>
        <span className="rounded-md bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">{item.status}</span>
      </div>
      <p className="mt-5 text-xs font-black uppercase text-stone-500">{item.category}</p>
      <h3 className="mt-1 text-xl font-black text-emerald-950">{item.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-600">
        <MapPin size={16} />
        {item.location}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <p className="text-lg font-black text-emerald-800">{item.price}</p>
        <p className="flex items-center gap-1 text-sm font-black text-amber-600">
          <Star size={16} fill="currentColor" />
          {item.rating}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-stone-200 px-2 py-1 text-xs font-bold text-stone-600">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center text-stone-900">
      <p className="text-sm font-black uppercase text-emerald-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-emerald-950 md:text-5xl">{title}</h2>
      <p className="mt-4 text-base font-medium text-stone-600">{copy}</p>
    </div>
  );
}

export default function KisanSetuApp() {
  return (
    <main className="min-h-screen bg-[#f8fbf4] text-stone-900">
      <Nav />

      <section id="home" className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-800"
          >
            <Leaf size={18} />
            India's farm equipment rental operating system
          </motion.div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight text-emerald-950 md:text-7xl">
            Rent verified machinery from nearby farmers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium text-stone-600">
            Kisan Setu connects farmer owners and customers with secure bookings, chat and field-ready support workflows.
          </p>
          <SearchPanel />
          <div className="mt-6 flex flex-wrap gap-3">
            {["Hindi", "Punjabi", "English", "Voice search", "Offline-ready PWA"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-md border border-emerald-900/10 bg-white px-3 py-2 text-sm font-bold text-stone-700">
                <CheckCircle2 size={16} className="text-emerald-700" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative min-h-[520px] overflow-hidden rounded-lg bg-emerald-900 p-6 text-white shadow-2xl shadow-emerald-950/20"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(20,83,45,0.94), rgba(21,128,61,0.86)), url(${heroImage})`
            }}
          />
          <div className="relative z-10 flex h-full min-h-[470px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-white/15 px-3 py-2 text-sm font-black backdrop-blur">Live operations</span>
              <span className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-emerald-900">
                <Bell size={16} />
                27 new bookings
              </span>
            </div>
            <img src={mascot} className="mx-auto h-64 object-contain drop-shadow-2xl md:h-80" alt="Kisan Setu mascot" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 text-emerald-950">
                <p className="text-sm font-bold text-stone-500">Next payout</p>
                <p className="mt-1 text-3xl font-black">Rs 18,420</p>
              </div>
              <div className="rounded-lg bg-lime-300 p-4 text-emerald-950">
                <p className="text-sm font-bold">Equipment utilization</p>
                <p className="mt-1 text-3xl font-black">86%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-emerald-900/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-black text-emerald-800">{value}</p>
              <p className="text-sm font-bold text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-7xl px-5 py-20">
        <SectionTitle
          eyebrow="Marketplace"
          title="Search, compare and book equipment in minutes"
          copy="A farmer can discover nearby machines, review trust signals, request booking slots and complete payment from a single responsive flow."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {equipment.map((item) => <EquipmentCard key={item.name} item={item} />)}
        </div>
      </section>

      <section className="bg-emerald-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle
            eyebrow="Booking Engine"
            title="Built for the whole rental lifecycle"
            copy="Requests, approvals, rescheduling and settlement records are part of the operational model."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {workflows.map(([title, copy], index) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-5">
                <p className="flex h-10 w-10 items-center justify-center rounded-md bg-lime-300 font-black text-emerald-950">{index + 1}</p>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-medium text-emerald-50">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboards" className="mx-auto max-w-7xl px-5 py-20">
        <SectionTitle
          eyebrow="Modules"
          title="Dashboards for every role"
          copy="Owner and customer flows are represented with role-based product modules."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, Icon, copy]) => (
            <article key={title} className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
              <Icon className="text-emerald-700" size={30} />
              <h3 className="mt-5 text-xl font-black text-emerald-950">{title}</h3>
              <p className="mt-3 text-sm font-semibold text-stone-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="schemes" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">Farmer Intelligence</p>
            <h2 className="mt-2 text-4xl font-black text-emerald-950">Schemes, credit, weather and crop advice in one place.</h2>
            <p className="mt-4 font-medium text-stone-600">
              The platform includes scheme discovery, credit score inputs, equipment insurance, demand forecasting and multilingual AI assistant entry points.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {schemes.map((scheme) => (
              <div key={scheme} className="flex items-center justify-between rounded-lg border border-stone-200 p-5">
                <span className="font-black text-emerald-950">{scheme}</span>
                <ChevronRight className="text-emerald-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-5 lg:grid-cols-4">
          {[
            [CreditCard, "Razorpay-ready payments"],
            [Wallet, "Wallet and settlements"],
            [MessageCircle, "Socket chat and support"],
            [Languages, "Hindi, Punjabi, English"],
            [BadgeIndianRupee, "GST and commission"],
            [TrendingUp, "Analytics and heatmaps"],
            [Sparkles, "AI recommendations"],
            [Wheat, "Crop advisory"]
          ].map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4">
              <Icon className="text-emerald-700" />
              <span className="font-black text-emerald-950">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-emerald-900/10 bg-emerald-950 px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-black">
            Kisan<span className="text-lime-300">Setu</span>
          </p>
          <p className="text-sm font-semibold text-emerald-100">Production scaffold for farmer-to-farmer equipment rentals.</p>
        </div>
      </footer>
    </main>
  );
}