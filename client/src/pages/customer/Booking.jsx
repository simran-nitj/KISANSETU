import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2, MapPin, Star, Heart, Calendar, FileText,
  Clock, CheckCircle2, XCircle, RotateCcw, AlertTriangle
} from "lucide-react";
import api from "../../lib/api";

const STATUS_TABS = ["ALL", "PENDING", "ACCEPTED", "ONGOING", "COMPLETED", "CANCELLED"];

const STATUS_STYLES = {
  PENDING: { label: "Pending approval", cls: "bg-amber-100 text-amber-800", icon: Clock },
  ACCEPTED: { label: "Accepted", cls: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  ONGOING: { label: "Ongoing", cls: "bg-emerald-100 text-emerald-800", icon: Clock },
  COMPLETED: { label: "Completed", cls: "bg-stone-200 text-stone-700", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700", icon: XCircle },
  REFUNDED: { label: "Refunded", cls: "bg-purple-100 text-purple-700", icon: RotateCcw },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function RescheduleModal({ booking, onClose, onSubmitted }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      setError("Choose a valid date range.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking._id}/reschedule`, {
        requestedStartDate: startDate,
        requestedEndDate: endDate,
      });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit reschedule request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-black text-emerald-950">Request new dates</h3>
        <p className="mt-1 text-sm font-semibold text-stone-500">
          Owner approval is required before this booking is rescheduled.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-black uppercase text-stone-500">New start</span>
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
              <span className="text-xs font-black uppercase text-stone-500">New end</span>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-stone-200 px-4 py-3 text-sm font-black text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CancelModal({ booking, onClose, onCancelled }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!reason.trim()) {
      setError("Please tell the owner why you're cancelling.");
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/bookings/${booking._id}/reject`, { cancellationReason: reason.trim() });
      onCancelled();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={22} />
          <h3 className="text-lg font-black text-emerald-950">Cancel this booking?</h3>
        </div>
        {booking.advancePayment > 0 && (
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Refund eligibility for your Rs {booking.advancePayment} advance depends on the platform's
            cancellation policy for this time window.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation"
            rows={3}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold outline-none"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-stone-200 px-4 py-3 text-sm font-black text-stone-600"
            >
              Keep booking
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Confirm cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingCard({ booking, onReschedule, onCancel }) {
  const style = STATUS_STYLES[booking.status] ?? STATUS_STYLES.PENDING;
  const StatusIcon = style.icon;
  const equipment = booking.equipmentId; // populated
  const canModify = ["PENDING", "ACCEPTED"].includes(booking.status);

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-stone-500">
            {equipment?.category ?? "Equipment"}
          </p>
          <h3 className="mt-1 text-lg font-black text-emerald-950">
            {equipment?.name ?? "Booking"}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-600">
            <MapPin size={15} />
            {equipment?.location?.address ?? "—"}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black ${style.cls}`}>
          <StatusIcon size={14} />
          {style.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4 text-sm font-semibold text-stone-600">
        <span className="flex items-center gap-2">
          <Calendar size={15} />
          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
        </span>
        <span className="font-black text-emerald-800">Rs {booking.totalPrice?.toLocaleString()}</span>
        {booking.securityDeposit > 0 && (
          <span className="text-xs text-stone-500">+Rs {booking.securityDeposit} deposit</span>
        )}
      </div>

      {booking.rescheduleRequests?.length > 0 && (
        <div className="mt-3 rounded-md bg-stone-50 px-3 py-2 text-xs font-bold text-stone-600">
          Latest reschedule request:{" "}
          {booking.rescheduleRequests[booking.rescheduleRequests.length - 1].status}
        </div>
      )}

      {booking.status === "CANCELLED" && booking.cancellationReason && (
        <p className="mt-3 text-xs font-semibold text-red-600">
          Reason: {booking.cancellationReason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
        {booking.invoiceUrl && (
          
            href={booking.invoiceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-xs font-black text-stone-700"
          >
            <FileText size={14} />
            Invoice
          </a>
        )}
        {canModify && (
          <>
            <button
              onClick={() => onReschedule(booking)}
              className="flex items-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-700"
            >
              <RotateCcw size={14} />
              Reschedule
            </button>
            <button
              onClick={() => onCancel(booking)}
              className="flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-black text-red-600"
            >
              <XCircle size={14} />
              Cancel
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function WishlistTab({ onBook }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/profile/wishlist");
      setItems(data?.items ?? data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (equipmentId) => {
    setItems((prev) => prev.filter((i) => (i.equipmentId ?? i._id) !== equipmentId));
    try {
      await api.delete(`/profile/wishlist/${equipmentId}`);
    } catch {
      fetchWishlist(); // resync on failure
    }
  };

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <Loader2 className="animate-spin text-emerald-700" size={28} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm font-semibold text-stone-500">
        You haven't saved any equipment yet. Tap the heart icon on a listing to save it here.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const equipment = item.equipmentId?.name ? item.equipmentId : item;
        return (
          <article key={equipment._id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-black uppercase text-stone-500">{equipment.category}</p>
              <button onClick={() => handleRemove(equipment._id)} aria-label="Remove from wishlist">
                <Heart size={20} className="fill-red-500 text-red-500" />
              </button>
            </div>
            <h3 className="mt-1 text-lg font-black text-emerald-950">{equipment.name}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-600">
              <MapPin size={15} />
              {equipment.location?.address ?? "—"}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
              <p className="text-lg font-black text-emerald-800">
                Rs {equipment.pricePerDay ?? equipment.price}/day
              </p>
              <p className="flex items-center gap-1 text-sm font-black text-amber-600">
                <Star size={15} fill="currentColor" />
                {equipment.avgRating?.toFixed(1) ?? "New"}
              </p>
            </div>
            <button
              onClick={() => onBook(equipment)}
              className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-black text-white"
            >
              Book now
            </button>
          </article>
        );
      })}
    </div>
  );
}

export default function Bookings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders"); // "orders" | "wishlist"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast] = useState(
    location.state?.newBookingId ? "Booking request sent! The owner will respond soon." : ""
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const { data } = await api.get("/bookings", { params });
      setBookings(data?.items ?? data ?? []);
    } catch {
      setError("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (tab === "orders") fetchBookings();
  }, [tab, fetchBookings]);

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  const handleBookFromWishlist = (equipment) => {
    navigate("/customer/marketplace", { state: { bookEquipment: equipment } });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <p className="text-sm font-black uppercase text-emerald-700">My account</p>
      <h1 className="mt-1 text-3xl font-black text-emerald-950">Orders & wishlist</h1>

      {toast && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
          {toast}
        </div>
      )}

      <div className="mt-6 flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-3 text-sm font-black ${
            tab === "orders" ? "border-b-2 border-emerald-700 text-emerald-800" : "text-stone-500"
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setTab("wishlist")}
          className={`px-4 py-3 text-sm font-black ${
            tab === "wishlist" ? "border-b-2 border-emerald-700 text-emerald-800" : "text-stone-500"
          }`}
        >
          Wishlist
        </button>
      </div>

      {tab === "orders" ? (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-md px-3 py-2 text-xs font-black ${
                  statusFilter === s ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {s === "ALL" ? "All" : STATUS_STYLES[s]?.label ?? s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="animate-spin text-emerald-700" size={28} />
            </div>
          ) : error ? (
            <p className="mt-6 text-sm font-bold text-red-600">{error}</p>
          ) : bookings.length === 0 ? (
            <p className="mt-10 text-center text-sm font-semibold text-stone-500">
              No bookings here yet. Head to the marketplace to rent your first machine.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onReschedule={setRescheduleTarget}
                  onCancel={setCancelTarget}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <WishlistTab onBook={handleBookFromWishlist} />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSubmitted={() => {
            setRescheduleTarget(null);
            setToast("Reschedule request sent to the owner.");
            fetchBookings();
          }}
        />
      )}

      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => {
            setCancelTarget(null);
            setToast("Booking cancelled.");
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
