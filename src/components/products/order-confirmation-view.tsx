"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import type { Order } from "@/types/api";
import { Container } from "@/components/layout/container";
import { StatusBadge } from "@/components/portal/status-badge";

const licenseLabels: Record<string, string> = {
  PERSONAL: "Personal License",
  COMMERCIAL: "Commercial License",
  EXTENDED: "Extended License",
};

interface OrderConfirmationViewProps {
  order: Order;
}

export function OrderConfirmationView({ order }: OrderConfirmationViewProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (heroRef.current)
      createFadeUp(heroRef.current, { scrollTrigger: false });
    if (cardRef.current)
      createFadeUp(cardRef.current, { delay: 0.2, scrollTrigger: false });
    if (actionsRef.current)
      createFadeUp(actionsRef.current, { delay: 0.35, scrollTrigger: false });
  });

  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Success icon */}
          <div ref={heroRef} data-gsap className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
          </div>

          {/* Order details card */}
          <div ref={cardRef} data-gsap className="mt-10 glass rounded-2xl p-6 sm:p-8">
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Order ID
                </p>
                <Link
                  href={`/portal/orders/${order.id}`}
                  className="mt-0.5 block font-mono text-sm font-bold text-primary-600 transition-colors hover:text-primary-500"
                >
                  #{order.id.slice(-8).toUpperCase()}
                </Link>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Order Items
              </h3>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {licenseLabels[item.licenseType] || item.licenseType}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 border-t border-border pt-4">
              {order.coupon && Number(order.discountAmount) > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      ${(Number(order.totalAmount) + Number(order.discountAmount)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-success">
                      <span>Discount</span>
                      <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        {order.coupon.code}
                      </span>
                    </span>
                    <span className="font-medium text-success">
                      -${Number(order.discountAmount).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between pt-1 text-base font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  ${Number(order.totalAmount).toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {order.currency}
                  </span>
                </span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-4 rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 text-sm text-foreground">{order.notes}</p>
              </div>
            )}

            {/* Date */}
            <p className="mt-4 text-xs text-muted-foreground">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* What happens next */}
            <div className="mt-4 rounded-xl bg-primary-50 px-4 py-3">
              <p className="text-sm font-semibold text-primary-700">
                What happens next?
              </p>
              <p className="mt-0.5 text-[13px] text-primary-700/80">
                Your order is being reviewed. You&apos;ll receive an email when
                processing begins. You can track your order status from your{" "}
                <Link
                  href={`/portal/orders/${order.id}`}
                  className="font-medium underline underline-offset-2"
                >
                  order page
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            ref={actionsRef}
            data-gsap
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href="/portal/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-600"
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              View My Orders
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
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
              Back to Store
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
