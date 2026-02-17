"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetch("/api/proxy/users/profile")
      .then((res) => res.json())
      .then((json) => {
        const user = json.data ?? json;
        setProfile(user);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPhone(user.phone || "");
        setBio(user.bio || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/proxy/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, bio }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.message || "Failed to update profile");
        return;
      }

      const updated = json.data ?? json;
      setProfile(updated);
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="glass-stat rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
        Could not load profile.
      </div>
    );
  }

  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : profile.firstName?.[0] || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-xl px-4 py-2 text-sm ${
            message.includes("success")
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </p>
      )}

      <div className="glass glass-shine rounded-2xl p-6">
        {/* Avatar + Name header */}
        <div className="flex items-center gap-4">
          <div className="glass-stat flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-primary-600 uppercase">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              ) : (
                <p className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                  {profile.firstName || "—"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              ) : (
                <p className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                  {profile.lastName || "—"}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <p className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
              {profile.email}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Phone
            </label>
            {editing ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="+1234567890"
              />
            ) : (
              <p className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                {profile.phone || "—"}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Bio
            </label>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                {profile.bio || "—"}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-glass-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFirstName(profile.firstName || "");
                  setLastName(profile.lastName || "");
                  setPhone(profile.phone || "");
                  setBio(profile.bio || "");
                }}
                className="btn-glass-secondary rounded-xl px-6 py-2.5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-glass-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Account Information
        </h2>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            Role:{" "}
            <span className="font-medium text-foreground">{profile.role}</span>
          </p>
          <p>
            Member since:{" "}
            <span className="font-medium text-foreground">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
          {profile.lastLoginAt && (
            <p>
              Last login:{" "}
              <span className="font-medium text-foreground">
                {new Date(profile.lastLoginAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
