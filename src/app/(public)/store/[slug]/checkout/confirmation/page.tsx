import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOrderById } from "@/lib/api";
import { OrderConfirmationView } from "@/components/products/order-confirmation-view";

export const metadata: Metadata = {
  title: "Order Confirmed | Store",
  description: "Your order has been placed successfully.",
};

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/store");
  }

  const order = await getOrderById(orderId);

  if (!order) {
    redirect("/store");
  }

  return <OrderConfirmationView order={order} />;
}
