import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatProvider } from "@/contexts/chat-context";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <Navbar />
      <main className="min-h-dvh">{children}</main>
      <Footer />
      <ChatWidget />
    </ChatProvider>
  );
}
