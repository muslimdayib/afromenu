"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { X, User, Lock, Loader2, Check, AlertCircle, LogOut } from "lucide-react";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;

      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1b3151]/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 border border-gray-100 relative z-10 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-[#1b3151] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-xl text-[#1b3151] mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#f2bd11]" />
          <span>Account Settings</span>
        </h3>

        {/* Success/Error Alerts */}
        {success && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Section 1: Account Info */}
          <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-gray-150/60">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Profile Information
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-[#1b3151]">
              <div>
                <span className="font-bold text-gray-400">Account Name: </span>
                <span className="font-extrabold">{user?.user_metadata?.name || user?.email?.split("@")[0] || "Partner"}</span>
              </div>
              <div className="mt-0.5">
                <span className="font-bold text-gray-400">Email Address: </span>
                <span className="font-mono font-semibold">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Change Password */}
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Change Password</span>
            </h4>

            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:outline-none text-xs text-[#1b3151] bg-[#f8f9fa] font-bold placeholder:font-normal placeholder:text-gray-400"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1b3151] focus:outline-none text-xs text-[#1b3151] bg-[#f8f9fa] font-bold placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1b3151] hover:bg-[#15253d] disabled:bg-gray-200 text-white font-bold rounded-[50px] text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>

          <hr className="border-gray-100" />

          {/* Log out option */}
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-[50px] text-xs transition-colors flex items-center justify-center gap-2 border border-red-100 shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
