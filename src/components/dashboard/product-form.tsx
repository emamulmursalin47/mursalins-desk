"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { FormField } from "@/components/dashboard/form-field";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminProduct } from "@/types/admin";

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
  const [type, setType] = useState<string>(product?.type ?? "TEMPLATE");
  const [price, setPrice] = useState(product?.price ?? "");
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? "");
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [licenseType, setLicenseType] = useState<string>(product?.licenseType ?? "PERSONAL");
  const [previewUrl, setPreviewUrl] = useState(product?.previewUrl ?? "");
  const [downloadUrl, setDownloadUrl] = useState(product?.downloadUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(product?.technologies ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(product?.features ?? []);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (autoSlug && name) setSlug(toSlug(name));
  }, [name, autoSlug]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      name,
      slug,
      description: description || undefined,
      longDescription: longDescription || undefined,
      type,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      currency,
      licenseType,
      previewUrl: previewUrl || undefined,
      downloadUrl: downloadUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      technologies,
      features,
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
            <FormField label="Name" required value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Product name" />
            <FormField label="Slug" value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSlug(e.target.value); setAutoSlug(false); }} placeholder="product-slug" />
            <FormField as="textarea" label="Description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} rows={3} placeholder="Short description" />
            <FormField as="textarea" label="Long Description" value={longDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLongDescription(e.target.value)} rows={6} placeholder="Detailed description" />
          </div>

          {/* URLs */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">URLs</h3>
            <ImageUpload
              label="Thumbnail"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              folder="products"
              aspectClass="aspect-video"
              hint="Recommended: 800×450px"
            />
            <FormField label="Preview URL" value={previewUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewUrl(e.target.value)} placeholder="https://..." />
            <FormField label="Download URL" value={downloadUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDownloadUrl(e.target.value)} placeholder="https://..." />
          </div>

          {/* Tags */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Technologies</h3>
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

            <h3 className="text-sm font-semibold text-foreground">Features</h3>
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 space-y-4">
            <FormField as="select" label="Type" value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}>
              <option value="TEMPLATE">Template</option>
              <option value="COMPONENT">Component</option>
              <option value="FULL_APPLICATION">Full Application</option>
              <option value="PLUGIN">Plugin</option>
              <option value="DESIGN_ASSET">Design Asset</option>
              <option value="OTHER">Other</option>
            </FormField>
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
    </form>
  );
}
