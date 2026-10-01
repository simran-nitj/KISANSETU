import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Heart, SlidersHorizontal, Tractor, Loader2, X } from "lucide-react";
import api from "../../lib/api";

const CATEGORIES = ["All", "Tractor", "Harvester", "Rotavator", "Drone rental", "Irrigation", "Trailer"];

function EquipmentCard({ item, isWishlisted, onToggleWishlist, onBook }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
          <Tractor size={22} />
        </div>
        <button
          onClick={() => onToggleWishlist(item._id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="rounded-full p-2 transition hover:bg-stone-100"
        >
          <Heart
            size={20}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-stone-400"}
          />
        </button>
      </div>

      <p className="mt-4 text-xs font-black uppercase text-stone-500">{item.category}</p>
      <h3 className="mt-1 line-clamp-1 text-lg font-black text-emerald-950">{item.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-600">
        <MapPin size={15} />
        {item.location?.address || "Location unavailable"}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <p className="text-lg font-black text-emerald-800">
          Rs {item.pricePerDay ?? item.price}/day
        </p>
        <p className="flex items-center gap-1 text-sm font-black text-amber-600">
          <Star size={15} fill="currentColor" />
          {item.avgRating?.toFixed(1) ?? "New"}
        </p>
      </div>

      {!item.isVerified && (
        <p className="mt-2 text-xs font-bold text-amber-600">Verification pending</p>
      )}

      <button
        onClick={() => onBook(item)}
        disabled={!item.isAvailable}
        className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {item.isAvailable ? "Book now" : "Unavailable"}
      </button>
    </article>
  );
}

function BookingModal({ equipment, onClose, onConfirmed }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
      : 0;
  const estimatedTotal = days * (equipment.pricePerDay ?? equipment.price ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      setError("Choose a valid date range.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", {
        equipmentId: equipment._id,
        startDate,
        endDate,
      });
      onConfirmed(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create booking. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-emerald-950">Book {equipment.name}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-black uppercase text-stone-500">Start date</span>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold outline-none"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-stone-500">End date</span>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold outline-none"
                required
              />
            </label>
          </div>

          {days > 0 && (
            <div className="rounded-md bg-emerald-50 px-4 py-3">
              <p className="text-sm font-bold text-stone-600">
                {days} day{days > 1 ? "s" : ""} × Rs {equipment.pricePerDay ?? equipment.price}
              </p>
              <p className="mt-1 text-xl font-black text-emerald-800">Rs {estimatedTotal.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                Final total, GST and deposit are confirmed on the next screen.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : "Send booking request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [toast, setToast] = useState("");

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();

      const [equipmentRes, recRes, wishlistRes] = await Promise.allSettled([
        api.get("/equipment", { params }),
        api.get("/recommendations"),
        api.get("/profile/wishlist"),
      ]);

      if (equipmentRes.status === "fulfilled") {
        setEquipmentList(equipmentRes.value.data?.items ?? equipmentRes.value.data ?? []);
      } else {
        setError("Could not load equipment listings.");
      }

      if (recRes.status === "fulfilled") {
        setRecommended(recRes.value.data?.items ?? recRes.value.data ?? []);
      }

      if (wishlistRes.status === "fulfilled") {
        const ids = (wishlistRes.value.data?.items ?? wishlistRes.value.data ?? []).map(
          (w) => w.equipmentId ?? w._id
        );
        setWishlistIds(new Set(ids));
      }
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchEquipment, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchEquipment]);

  const handleToggleWishlist = async (equipmentId) => {
    const isCurrentlyWishlisted = wishlistIds.has(equipmentId);
    // optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      isCurrentlyWishlisted ? next.delete(equipmentId) : next.add(equipmentId);
      return next;
    });
    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/profile/wishlist/${equipmentId}`);
      } else {
        await api.post(`/profile/wishlist/${equipmentId}`);
      }
    } catch (err) {
      // revert on failure
      setWishlistIds((prev) => {
        const next = new Set(prev);
        isCurrentlyWishlisted ? next.add(equipmentId) : next.delete(equipmentId);
        return next;
      });
      setToast("Could not update wishlist. Try again.");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleBookingConfirmed = (booking) => {
    setSelectedEquipment(null);
    navigate("/customer/bookings", { state: { newBookingId: booking._id } });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">Marketplace</p>
          <h1 className="mt-1 text-3xl font-black text-emerald-950">Find equipment near you</h1>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
          <Search className="text-emerald-700" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
            placeholder="Search tractor, drone, harvester..."
          />
        </label>
        <div className="flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal size={18} className="shrink-0 text-stone-400" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-md px-3 py-2 text-xs font-black ${
                category === cat
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
          {toast}
        </div>
      )}

      {recommended.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black text-emerald-950">Recommended for you</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((item) => (
              <EquipmentCard
                key={item._id}
                item={item}
                isWishlisted={wishlistIds.has(item._id)}
                onToggleWishlist={handleToggleWishlist}
                onBook={setSelectedEquipment}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-black text-emerald-950">
          {category === "All" ? "All equipment" : category}
        </h2>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="animate-spin text-emerald-700" size={28} />
          </div>
        ) : error ? (
          <p className="mt-6 text-sm font-bold text-red-600">{error}</p>
        ) : equipmentList.length === 0 ? (
          <p className="mt-6 text-sm font-semibold text-stone-500">
            No equipment matches your search. Try a different category or keyword.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {equipmentList.map((item) => (
              <EquipmentCard
                key={item._id}
                item={item}
                isWishlisted={wishlistIds.has(item._id)}
                onToggleWishlist={handleToggleWishlist}
                onBook={setSelectedEquipment}
              />
            ))}
          </div>
        )}
      </section>

      {selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onConfirmed={handleBookingConfirmed}
        />
      )}
    </div>
  );
}