import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  XCircle,
  CheckCircle,
  Check,
  User,
  FileText,
  Camera,
  ClipboardCheck,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

// Issue #644: KYC flow stages shown in the step indicator.
const KYC_STEPS = [
  { key: "personal", label: "Personal Info", icon: User },
  { key: "document", label: "Document Upload", icon: FileText },
  { key: "selfie", label: "Selfie Capture", icon: Camera },
  { key: "review", label: "Review & Submit", icon: ClipboardCheck },
];
const KYC_STEP_STORAGE_KEY = "afripay_kyc_step";

function KYCStepIndicator({ currentStep, onStepClick }) {
  return (
    <nav aria-label="KYC verification progress">
      <ol className="flex items-center">
        {KYC_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;
          const isLast = index === KYC_STEPS.length - 1;
          return (
            <li key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <button
                type="button"
                onClick={() => isCompleted && onStepClick(index)}
                disabled={!isCompleted}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${index + 1} of ${KYC_STEPS.length}: ${step.label}`}
                className={`flex flex-col items-center gap-1 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  isCompleted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-primary-500 text-white ring-4 ring-primary-500/20"
                      : isCompleted
                        ? "bg-primary-500 text-white"
                        : "bg-gray-800 border border-gray-700 text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
                </span>
                <span
                  className={`hidden sm:block text-xs text-center ${
                    isCurrent
                      ? "font-bold text-white"
                      : isCompleted
                        ? "text-gray-300"
                        : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`sm:hidden text-[10px] ${
                    isCurrent ? "font-bold text-white" : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>
              </button>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`h-0.5 flex-1 mx-1 ${
                    index < currentStep ? "bg-primary-500" : "bg-gray-700"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const ID_TYPES = [
  { value: "national_id", label: "National ID Card" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
];

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    label: "Verified",
    message: "Your identity has been verified. You can send transactions of any amount.",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    label: "Under Review",
    message:
      "Your KYC submission is being reviewed. This usually takes 1-2 business days.",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    label: "Rejected",
    message:
      "Your previous submission was rejected. Please resubmit with accurate information.",
  },
  unverified: {
    icon: ShieldCheck,
    color: "text-gray-400",
    bg: "bg-gray-800 border-gray-700",
    label: "Not Verified",
    message: "Verify your identity to send transactions above $100 USD equivalent.",
  },
};

export default function KYCVerification() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ id_type: "", id_number: "", date_of_birth: "" });

  // Issue #644: current KYC step, persisted across refreshes in sessionStorage.
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = parseInt(sessionStorage.getItem(KYC_STEP_STORAGE_KEY), 10);
    return Number.isInteger(saved) && saved >= 0 && saved < KYC_STEPS.length ? saved : 0;
  });

  useEffect(() => {
    sessionStorage.setItem(KYC_STEP_STORAGE_KEY, String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    api
      .get("/kyc/status")
      .then((r) => setKycStatus(r.data.kyc_status))
      .catch(() => setKycStatus("unverified"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/kyc/submit", form);
      toast.success(
        "KYC submitted successfully. We will review your application shortly.",
      );
      setKycStatus("pending");
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showForm = kycStatus === "unverified" || kycStatus === "rejected";
  const statusConfig = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.unverified;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white flex items-center gap-1"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white">Identity Verification</h2>
        <p className="text-gray-400 text-sm mt-1">
          Required for regulatory compliance in African markets.
        </p>
      </div>

      <KYCStepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

      {loading ? (
        <div className="flex justify-center py-12" role="status" aria-label="Loading">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Status banner */}
          <div
            className={`border rounded-xl p-4 flex items-start gap-3 ${statusConfig.bg}`}
          >
            <StatusIcon size={20} className={`${statusConfig.color} shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold text-sm ${statusConfig.color}`}>
                {statusConfig.label}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">{statusConfig.message}</p>
            </div>
          </div>

          {/* Submission form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">ID Type</label>
                <select
                  required
                  value={form.id_type}
                  onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="" disabled>
                    Select ID type
                  </option>
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">ID Number</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your ID number"
                  value={form.id_number}
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date of Birth</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your information is used solely for identity verification as required by
                  financial regulations. Raw ID documents are never stored in our
                  database.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
                ) : (
                  <>
                    <ShieldCheck size={18} /> Submit for Verification
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
