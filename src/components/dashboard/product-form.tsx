"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminGet, adminPost, adminPatch, adminDelete, adminUpload, revalidateCache } from "@/lib/admin-api";
import { FormField } from "@/components/dashboard/form-field";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { useToast } from "@/components/dashboard/toast-context";
import { AiFieldButton } from "@/components/dashboard/ai-field-button";
import { AiProductModal } from "@/components/dashboard/ai-product-modal";
import type { AdminProduct } from "@/types/admin";
import type { ProductType, PaginatedResult } from "@/types/api";

interface ProductFormProps {
  product?: AdminProduct;
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(product?.longDescription ?? "");
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productTypeId, setProductTypeId] = useState(product?.productTypeId ?? "");
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [creatingType, setCreatingType] = useState(false);
  const [price, setPrice] = useState(product?.price ?? "");
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? "");
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [licenseType, setLicenseType] = useState<string>(product?.licenseType ?? "PERSONAL");
  const [previewUrl, setPreviewUrl] = useState(product?.previewUrl ?? "");
  const [downloadUrl, setDownloadUrl] = useState(product?.downloadUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(product?.technologies ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(product?.features ?? []);
  const [whatsIncludedInput, setWhatsIncludedInput] = useState("");
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(product?.whatsIncluded ?? []);
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl ?? "");
  const [version, setVersion] = useState(product?.version ?? "");
  const [changelog, setChangelog] = useState(product?.changelog ?? "");
  const [supportUrl, setSupportUrl] = useState(product?.supportUrl ?? "");
  const [documentationUrl, setDocumentationUrl] = useState(product?.documentationUrl ?? "");
  const [publishedAt, setPublishedAt] = useState(product?.publishedAt?.split("T")[0] ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (autoSlug && name) setSlug(toSlug(name));
  }, [name, autoSlug]);

  useEffect(() => {
    adminGet<PaginatedResult<ProductType>>("/product-types?limit=100")
      .then((res) => {
        setProductTypes(res.data);
        if (!product && res.data.length > 0 && !productTypeId) {
          setProductTypeId(res.data[0]!.id);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateType() {
    if (!newTypeName.trim()) return;
    setCreatingType(true);
    try {
      const created = await adminPost<ProductType>("/product-types", { name: newTypeName.trim() });
      setProductTypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setProductTypeId(created.id);
      setNewTypeName("");
      setShowNewType(false);
      toast("Type created", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create type", "error");
    } finally {
      setCreatingType(false);
    }
  }

  async function handleDeleteType(id: string) {
    try {
      await adminDelete(`/product-types/${id}`);
      setProductTypes((prev) => prev.filter((t) => t.id !== id));
      if (productTypeId === id) {
        setProductTypeId((prev) => {
          const remaining = productTypes.filter((t) => t.id !== id);
          return remaining[0]?.id ?? prev;
        });
      }
      toast("Type deleted", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Cannot delete type in use", "error");
    }
  }

  function addTag(
    value: string,
    setter: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void,
  ) {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setter("");
  }

  async function addGalleryImage(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("File must be under 10 MB", "error");
      return;
    }
    setUploadingGallery(true);
    try {
      const uploaded = await adminUpload<{ url: string }>(file, "products");
      setImages((prev) => [...prev, uploaded.url]);
      toast("Image added", "success");
    } catch {
      toast("Failed to upload image", "error");
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      name,
      description: description || undefined,
      longDescription: longDescription || undefined,
      productTypeId,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      currency,
      licenseType,
      previewUrl: previewUrl || undefined,
      downloadUrl: downloadUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      images,
      technologies,
      features,
      videoUrl: videoUrl || undefined,
      whatsIncluded,
      version: version || undefined,
      changelog: changelog || undefined,
      supportUrl: supportUrl || undefined,
      documentationUrl: documentationUrl || undefined,
      publishedAt: publishedAt || undefined,
      isActive,
      isFeatured,
    };

    try {
      if (isEdit) {
        await adminPatch(`/products/${product.id}`, body);
        toast("Product updated", "success");
      } else {
        await adminPost("/products", body);
        toast("Product created", "success");
      }
      await revalidateCache("products");
      router.push("/dashboard/products");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Product Details</h3>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-500/20 transition-colors"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /></svg>
                Generate with AI
              </button>
            </div>

            <FormField label="Name" required value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Product name" />
            <FormField label="Slug" value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSlug(e.target.value); setAutoSlug(false); }} placeholder="product-slug" />

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <AiFieldButton
                  label="Generate description"
                  disabled={!name}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const selectedType = productTypes.find((pt) => pt.id === productTypeId);
                    const res = await adminPost<{ description: string }>("/products/ai/generate-description", {
                      name,
                      productType: selectedType?.name || undefined,
                      technologies: technologies.length ? technologies : undefined,
                      features: features.length ? features : undefined,
                    });
                    if (res.description) {
                      setDescription(res.description);
                      toast("Description generated", "success");
                    }
                  }}
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short description"
                className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Long Description</label>
                <AiFieldButton
                  label="Generate long description"
                  disabled={!name}
                  onError={(msg) => toast(msg, "error")}
                  onGenerate={async () => {
                    const selectedType = productTypes.find((pt) => pt.id === productTypeId);
                    const res = await adminPost<{ longDescription: string }>("/products/ai/generate-long-description", {
                      name,
                      description: description || undefined,
                      productType: selectedType?.name || undefined,
                      technologies: technologies.length ? technologies : undefined,
                      features: features.length ? features : undefined,
                    });
                    if (res.longDescription) {
                      setLongDescription(res.longDescription);
                      toast("Long description generated", "success");
                    }
                  }}
                />
              </div>
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={6}
                placeholder="Detailed description (HTML supported)"
                className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
          </div>

          {/* Media */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Media</h3>
            <ImageUpload
              label="Thumbnail"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              folder="products"
              aspectClass="aspect-video"
              hint="Recommended: 800x450px"
            />
            <FormField label="Video URL" value={videoUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>

          {/* Gallery Images */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Gallery Screenshots</h3>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((url, i) => (
                  <div key={i} className="group relative aspect-video overflow-hidden rounded-xl bg-muted">
                    <img src={url} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/10 px-4 py-3 text-sm transition-colors hover:border-primary-400/40 ${uploadingGallery ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addGalleryImage(file);
                  e.target.value = "";
                }}
              />
              {uploadingGallery ? (
                <span className="text-muted-foreground">Uploading...</span>
              ) : (
                <>
                  <svg className="h-5 w-5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="font-medium text-muted-foreground">Upload screenshot</span>
                </>
              )}
            </label>
            <p className="text-xs text-muted-foreground">Up to 20 images. Recommended: 1200x800px.</p>
          </div>

          {/* URLs */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">URLs</h3>
            <FormField label="Preview URL" value={previewUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewUrl(e.target.value)} placeholder="https://..." />
            <FormField label="Download URL" value={downloadUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDownloadUrl(e.target.value)} placeholder="https://..." />
            <FormField label="Support URL" value={supportUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupportUrl(e.target.value)} placeholder="https://..." />
            <FormField label="Documentation URL" value={documentationUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentationUrl(e.target.value)} placeholder="https://docs.example.com/..." />
          </div>

          {/* Tags */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Technologies</h3>
              <AiFieldButton
                label="Suggest technologies"
                disabled={!name}
                onError={(msg) => toast(msg, "error")}
                onGenerate={async () => {
                  const selectedType = productTypes.find((pt) => pt.id === productTypeId);
                  const res = await adminPost<{ technologies: string[] }>("/products/ai/suggest-technologies", {
                    name,
                    description: description || undefined,
                    productType: selectedType?.name || undefined,
                  });
                  if (res.technologies?.length) {
                    setTechnologies(res.technologies);
                    toast(`${res.technologies.length} technologies suggested`, "success");
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(techInput, setTechInput, technologies, setTechnologies); } }} className="glass-subtle flex-1 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Add technology..." />
              <button type="button" onClick={() => addTag(techInput, setTechInput, technologies, setTechnologies)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((t) => (
                <span key={t} className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground">
                  {t}
                  <button type="button" onClick={() => setTechnologies(technologies.filter((x) => x !== t))} className="text-muted-foreground hover:text-destructive">&times;</button>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Features</h3>
              <AiFieldButton
                label="Suggest features"
                disabled={!name}
                onError={(msg) => toast(msg, "error")}
                onGenerate={async () => {
                  const selectedType = productTypes.find((pt) => pt.id === productTypeId);
                  const res = await adminPost<{ features: string[] }>("/products/ai/suggest-features", {
                    name,
                    description: description || undefined,
                    productType: selectedType?.name || undefined,
                    technologies: technologies.length ? technologies : undefined,
                  });
                  if (res.features?.length) {
                    setFeatures(res.features);
                    toast(`${res.features.length} features suggested`, "success");
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(featureInput, setFeatureInput, features, setFeatures); } }} className="glass-subtle flex-1 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Add feature..." />
              <button type="button" onClick={() => addTag(featureInput, setFeatureInput, features, setFeatures)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground">
                  {f}
                  <button type="button" onClick={() => setFeatures(features.filter((x) => x !== f))} className="text-muted-foreground hover:text-destructive">&times;</button>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">What&apos;s Included</h3>
              <AiFieldButton
                label="Suggest what's included"
                disabled={!name}
                onError={(msg) => toast(msg, "error")}
                onGenerate={async () => {
                  const selectedType = productTypes.find((pt) => pt.id === productTypeId);
                  const res = await adminPost<{ whatsIncluded: string[] }>("/products/ai/suggest-whats-included", {
                    name,
                    description: description || undefined,
                    productType: selectedType?.name || undefined,
                    features: features.length ? features : undefined,
                  });
                  if (res.whatsIncluded?.length) {
                    setWhatsIncluded(res.whatsIncluded);
                    toast(`${res.whatsIncluded.length} items suggested`, "success");
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <input value={whatsIncludedInput} onChange={(e) => setWhatsIncludedInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(whatsIncludedInput, setWhatsIncludedInput, whatsIncluded, setWhatsIncluded); } }} className="glass-subtle flex-1 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="e.g. React source code, Figma files..." />
              <button type="button" onClick={() => addTag(whatsIncludedInput, setWhatsIncludedInput, whatsIncluded, setWhatsIncluded)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {whatsIncluded.map((item) => (
                <span key={item} className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground">
                  {item}
                  <button type="button" onClick={() => setWhatsIncluded(whatsIncluded.filter((x) => x !== item))} className="text-muted-foreground hover:text-destructive">&times;</button>
                </span>
              ))}
            </div>
          </div>

          {/* Version & Changelog */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Version &amp; Changelog</h3>
            <FormField label="Version" value={version} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)} placeholder="e.g. 2.1.0" />
            <FormField as="textarea" label="Changelog" value={changelog} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChangelog(e.target.value)} rows={6} placeholder={"## v2.1.0\n- Added dark mode\n- Fixed responsive issues"} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 space-y-4">
            {/* Dynamic Product Type */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Type</label>
                <button
                  type="button"
                  onClick={() => setShowNewType(!showNewType)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
                  title="Add new type"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {showNewType && (
                <div className="mb-2 flex gap-2">
                  <input
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateType(); } }}
                    className="glass-subtle flex-1 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground"
                    placeholder="New type name..."
                    disabled={creatingType}
                  />
                  <button
                    type="button"
                    onClick={handleCreateType}
                    disabled={creatingType || !newTypeName.trim()}
                    className="btn-glass-primary rounded-xl px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {creatingType ? "..." : "Add"}
                  </button>
                </div>
              )}
              <select
                value={productTypeId}
                onChange={(e) => setProductTypeId(e.target.value)}
                className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary-500/30"
              >
                {productTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {productTypes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {productTypes.map((pt) => (
                    <span key={pt.id} className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] text-muted-foreground">
                      {pt.name}
                      <button
                        type="button"
                        onClick={() => handleDeleteType(pt.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title={`Delete ${pt.name}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Price" required type="number" step="0.01" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} placeholder="0.00" />
              <FormField label="Sale Price" type="number" step="0.01" value={salePrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalePrice(e.target.value)} placeholder="0.00" />
            </div>
            <FormField label="Currency" value={currency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value)} />
            <FormField as="select" label="License" value={licenseType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLicenseType(e.target.value)}>
              <option value="PERSONAL">Personal</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="EXTENDED">Extended</option>
            </FormField>
            <FormField label="Published At" type="date" value={publishedAt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishedAt(e.target.value)} />
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-glass-border text-primary-500 focus:ring-primary-500/30" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-glass-border text-primary-500 focus:ring-primary-500/30" />
              Featured
            </label>
          </div>

          <button type="submit" disabled={saving || !name || !price} className="btn-glass-primary w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      <AiProductModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        productName={name}
        productType={productTypes.find((pt) => pt.id === productTypeId)?.name}
        currentTechnologies={technologies}
        onGenerated={(result) => {
          if (result.description) setDescription(result.description);
          if (result.longDescription) setLongDescription(result.longDescription);
          if (result.features?.length) setFeatures(result.features);
          if (result.technologies?.length) setTechnologies(result.technologies);
          if (result.whatsIncluded?.length) setWhatsIncluded(result.whatsIncluded);
          toast("Product listing generated with AI", "success");
        }}
      />
    </form>
  );
}
