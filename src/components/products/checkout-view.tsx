"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { createFadeUp } from "@/lib/gsap";
import { useAuth } from "@/contexts/auth-context";
import { adminPost } from "@/lib/admin-api";
import type { Product, LicenseType, Order } from "@/types/api";
import { Container } from "@/components/layout/container";

/* ─── Coupon types ─── */

interface ValidatedCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
}

/* ─── Config ─── */

const licenseOptions: {
  value: LicenseType;
  label: string;
  description: string;
}[] = [
  {
    value: "PERSONAL",
    label: "Personal License",
    description: "Use in 1 personal project, no resale rights",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial License",
    description: "Use in unlimited commercial projects",
  },
  {
    value: "EXTENDED",
    label: "Extended License",
    description: "Resale allowed, unlimited projects & clients",
  },
];

interface CheckoutViewProps {
  product: Product;
}

export function CheckoutView({ product }: CheckoutViewProps) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>(
    product.licenseType,
  );
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const hasDiscount = product.salePrice !== null;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  /* ─── Coupon discount calculation ─── */
  const subtotal = Number(displayPrice);
  const couponDiscount = coupon
    ? coupon.discountType === "PERCENTAGE"
      ? subtotal * Number(coupon.discountValue) / 100
      : Math.min(Number(coupon.discountValue), subtotal)
    : 0;
  const finalTotal = Math.max(subtotal - couponDiscount, 0);

  async function handleValidateCoupon() {
    if (!couponCode.trim()) return;
    setCouponError(null);
    setValidating(true);
    try {
      const res = await fetch("/api/proxy/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Invalid coupon code");
      }
      const validated = json.data ?? json;
      if (validated.minOrderAmount && subtotal < Number(validated.minOrderAmount)) {
        throw new Error(`Minimum order amount is $${Number(validated.minOrderAmount).toFixed(2)}`);
      }
      setCoupon(validated);
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon code");
    } finally {
      setValidating(false);
    }
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  useGSAP(() => {
    if (summaryRef.current) createFadeUp(summaryRef.current, { scrollTrigger: false });
    if (formRef.current) createFadeUp(formRef.current, { delay: 0.15, scrollTrigger: false });
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const order = await adminPost<Order>("/orders", {
        items: [
          {
            productId: product.id,
            licenseType: selectedLicense,
          },
        ],
        notes: notes.trim() || undefined,
        couponCode: coupon?.code || undefined,
      });

      router.push(
        `/store/${product.slug}/checkout/confirmation?orderId=${order.id}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  /* ─── Auth loading state ─── */
  if (authLoading) {
    return (
      <section className="py-24">
        <Container>
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
          </div>
        </Container>
      </section>
    );
  }

  /* ─── Not authenticated ─── */
  if (!isAuthenticated) {
    return (
      <section className="py-24">
        <Container>
          <div className="mx-auto max-w-lg text-center" data-animate>
            <div className="glass rounded-2xl p-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent-500"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Sign in to continue
              </h2>
              <p className="mt-2 text-muted-foreground">
                You need an account to purchase products. Sign in or create a free
                account to proceed with checkout.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={`/login?from=/store/${product.slug}/checkout`}
                  className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-600"
                >
                  Sign In
                </Link>
                <Link
                  href={`/register?from=/store/${product.slug}/checkout`}
                  className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  /* ─── Checkout form ─── */
  return (
    <section ref={sectionRef} className="py-24">
      <Container>
        {/* Back link */}
        <Link
          href={`/store/${product.slug}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to product
        </Link>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left — Product Summary */}
          <div ref={summaryRef} className="lg:col-span-2">
            <div className="glass sticky top-28 rounded-2xl p-6">
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                {product.thumbnailUrl ? (
                  <Image
                    src={product.thumbnailUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-linear-to-br from-accent-50 to-primary-50">
                    <div className="h-12 w-12 rounded-xl bg-accent-200/60" />
                  </div>
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold text-foreground">
                {product.name}
              </h2>
              {product.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ${Number(displayPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${Number(product.price).toFixed(2)}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {product.currency}
                </span>
              </div>

              {/* Order details */}
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License</span>
                  <span className="font-medium text-foreground">
                    {licenseOptions.find((l) => l.value === selectedLicense)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium text-foreground">
                    Digital download
                  </span>
                </div>
                {coupon && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success">
                        Discount ({coupon.code})
                      </span>
                      <span className="font-medium text-success">
                        -${couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Checkout Form */}
          <div ref={formRef} className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="mt-2 text-muted-foreground">
              Complete your purchase for{" "}
              <span className="font-medium text-foreground">
                {product.name}
              </span>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {/* License selector */}
              <fieldset>
                <legend className="text-sm font-semibold text-foreground">
                  Select License Type
                </legend>
                <div className="mt-3 space-y-3">
                  {licenseOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                        selectedLicense === option.value
                          ? "border-accent-500 bg-accent-50/50"
                          : "border-border hover:border-accent-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="licenseType"
                        value={option.value}
                        checked={selectedLicense === option.value}
                        onChange={() => setSelectedLicense(option.value)}
                        className="mt-1 h-4 w-4 accent-accent-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">
                          {option.label}
                        </span>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Notes */}
              <div>
                <label
                  htmlFor="order-notes"
                  className="text-sm font-semibold text-foreground"
                >
                  Order Notes{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific requirements or notes for your order..."
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all"
                />
              </div>

              {/* Coupon code */}
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Coupon Code{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                {coupon ? (
                  <div className="mt-2 flex items-center justify-between rounded-xl border-2 border-success/30 bg-success/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className="text-sm font-semibold text-success">
                        {coupon.code}
                      </span>
                      <span className="text-xs text-success/80">
                        — {coupon.discountType === "PERCENTAGE"
                          ? `${Number(coupon.discountValue)}% off`
                          : `$${Number(coupon.discountValue).toFixed(2)} off`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCoupon}
                      disabled={validating || !couponCode.trim()}
                      className="shrink-0 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {validating ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                          Checking
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs text-destructive">{couponError}</p>
                )}
              </div>

              {/* Customer info */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Ordering as
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-accent-500 px-6 py-4 text-base font-bold text-white transition-all hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  `Place Order — $${finalTotal.toFixed(2)}`
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                By placing this order, you agree to the terms of service and the
                selected license agreement.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
