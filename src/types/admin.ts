/* ─── Admin-specific types not covered by public API types ─── */

export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";
export type TestimonialStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentProvider = "STRIPE" | "PAYPAL" | "MANUAL";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  budget: string | null;
  timeline: string | null;
  source: string | null;
  status: ContactStatus;
  replyMessage: string | null;
  repliedAt: string | null;
  repliedBy: { id: string; firstName: string | null; lastName: string | null } | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTestimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatarUrl: string | null;
  status: TestimonialStatus;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
  project?: { id: string; title: string; slug: string } | null;
}

export interface AdminOrder {
  id: string;
  userId: string;
  status: import("./api").OrderStatus;
  totalAmount: string;
  currency: string;
  notes: string | null;
  couponId: string | null;
  discountAmount: string;
  cancellationReason: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  payment: Payment | null;
  user?: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
  coupon?: { id: string; code: string; discountType: string; discountValue: string } | null;
}

export interface OrderNote {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; firstName: string | null; lastName: string | null };
}

export interface OrderStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
  changedBy?: { id: string; firstName: string | null; lastName: string | null } | null;
}

export interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  cancelledCount: number;
  refundedCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface AdminOrderItem {
  id: string;
  productName: string;
  price: string;
  licenseType: string;
  product?: { id: string; name: string; slug: string } | null;
}

export interface Payment {
  id: string;
  provider: PaymentProvider;
  amount: string;
  currency: string;
  status: PaymentStatus;
  transactionId: string | null;
  createdAt: string;
}

export interface AdminAppointment {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  duration: number;
  topic: string | null;
  notes: string | null;
  status: import("./api").AppointmentStatus;
  meetingUrl: string | null;
  timezone: string | null;
  type: string | null;
  cancelReason: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: import("./api").PostStatus;
  publishedAt: string | null;
  readTimeMin: number | null;
  viewCount: number;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
  categories?: { category: import("./api").Category }[];
  tags?: { tag: import("./api").Tag }[];
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  productTypeId: string;
  productType: import("./api").ProductType;
  price: string;
  salePrice: string | null;
  currency: string;
  licenseType: import("./api").LicenseType;
  previewUrl: string | null;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  images: string[];
  technologies: string[];
  features: string[];
  videoUrl: string | null;
  whatsIncluded: string[];
  version: string | null;
  changelog: string | null;
  supportUrl: string | null;
  documentationUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  downloadCount: number;
  rating: string;
  totalReviews: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: import("./api").ProjectStatus;
  budget: string | null;
  startDate: string | null;
  endDate: string | null;
  featuredImage: string | null;
  technologies: string[];
  liveUrl: string | null;
  repositoryUrl: string | null;
  tagline: string | null;
  challenge: string | null;
  approach: string | null;
  features: string[];
  role: string | null;
  metrics: { label: string; value: string; description?: string }[] | null;
  clientName: string | null;
  clientIndustry: string | null;
  teamSize: string | null;
  challenges: { challenge: string; solution: string }[] | null;
  scope: string | null;
  videoUrl: string | null;
  qualityBadges: string[];
  isPublic: boolean;
  sortOrder: number;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
  milestones?: import("./api").Milestone[];
  images?: import("./api").ProjectImage[];
}

export interface DashboardSummary {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  unreadContacts: number;
  pendingAppointments: number;
  totalPageviews: number;
  todayPageviews: number;
  recentContacts: Contact[];
  recentOrders: AdminOrder[];
  recentAppointments: AdminAppointment[];
}

export type ChatMode = "AI" | "LIVE";
export type ChatSender = "VISITOR" | "AI" | "ADMIN";
export type ChatStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface ChatConversation {
  id: string;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  mode: ChatMode;
  status: ChatStatus;
  telegramChatId: string | null;
  lastMessageAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageRecord[];
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  sender: ChatSender;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AnalyticsDashboard {
  totalPageviews: number;
  todayPageviews: number;
  topPages: { path: string; count: number }[];
}
