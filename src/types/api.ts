/* ─── API Response Wrapper ─── */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ─── Enums ─── */

export type ProjectStatus =
  | "INQUIRY"
  | "PROPOSAL"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export type LicenseType = "PERSONAL" | "COMMERCIAL" | "EXTENDED";

export type PostStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

/* ─── Models ─── */

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  proficiency: number;
  iconUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  technologies: string[];
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ServiceTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  price: string | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Package tier fields
  category: string | null;
  categoryLabel: string | null;
  tier: ServiceTier;
  tagline: string | null;
  deliverables: string[];
  exclusions: string[];
  duration: string | null;
  idealFor: string | null;
  isPopular: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export interface ServiceCategory {
  category: string;
  categoryLabel: string;
  tiers: Service[];
}

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
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
  createdAt: string;
  updatedAt: string;
  images?: ProjectImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  productTypeId: string;
  productType: ProductType;
  price: string;
  salePrice: string | null;
  currency: string;
  licenseType: LicenseType;
  previewUrl: string | null;
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
  isFeatured: boolean;
  downloadCount: number;
  rating: string;
  totalReviews: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: PostStatus;
  publishedAt: string | null;
  readTimeMin: number | null;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor | null;
  categories?: { category: Category }[];
  tags?: { tag: Tag }[];
}

export interface ReviewUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  user: ReviewUser;
}

export interface PendingReview extends Review {
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string | null;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatarUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  group: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Portal Enums ─── */

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type AppointmentType = "CALL" | "VIDEO" | "IN_PERSON";

/* ─── Portal Models ─── */

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
}

export interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
}

export interface OrderItem {
  id: string;
  productName: string;
  price: string;
  licenseType: LicenseType;
  product?: { id: string; name: string; slug: string } | null;
}

export interface OrderPayment {
  id: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  discountAmount: string;
  currency: string;
  notes: string | null;
  cancellationReason: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: OrderPayment | null;
  coupon?: { code: string; discountType: string; discountValue: string } | null;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  duration: number;
  topic: string | null;
  notes: string | null;
  status: AppointmentStatus;
  meetingUrl: string | null;
  timezone: string;
  type: AppointmentType;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  milestones: {
    total: number;
    completed: number;
    upcoming: number;
  };
  orders: {
    total: number;
    pending: number;
  };
  appointments: {
    upcoming: number;
  };
  recentProjects: ProjectWithMilestones[];
}
