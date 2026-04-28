import { useMemo } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "../FormSection";
import { useAuctionForm } from "@/context/auction-form-context";
import type { CreateAuctionPayload } from "@/features/auction/types";
import type { WizardFieldErrors } from "@/utils/auctionWizardValidation";
import { getObjectUrlMapForLotImages } from "@/lib/file-previews";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxSize = 10 * 1024 * 1024;

interface LotImagesTabProps {
  initialData?: Partial<CreateAuctionPayload>;
  fieldErrors?: WizardFieldErrors;
}

export function LotImagesTab({ initialData, fieldErrors }: LotImagesTabProps) {
  void initialData;
  const { formState, setLotImages, removeLotImage } = useAuctionForm();
  const errors = fieldErrors || {};
  const previewMap = useMemo(
    () => getObjectUrlMapForLotImages(formState.lot_images),
    [formState.lot_images]
  );

  const missingImages = (formState.lots || []).filter((lot, index) => {
    const byIndex = formState.lot_images?.[String(index)]?.length || 0;
    const byLotNumber = formState.lot_images?.[lot.lot_number]?.length || 0;
    return Math.max(byIndex, byLotNumber) === 0;
  });

  const handleLotImageChange = (lotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid format. Accepted: JPEG, PNG, WebP, JPG`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const existing = formState.lot_images?.[lotKey] || [];
      setLotImages(lotKey, [...existing, ...validFiles]);
      toast.success(`${validFiles.length} image(s) added for lot ${lotKey}`);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection title="Lot Images" description="Upload and manage images for each lot">
        {errors.lot_images && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {errors.lot_images}
          </div>
        )}
        {missingImages.length > 0 && (
          <div className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            {missingImages.length} lot(s) have no images yet. Add at least one image per lot for a better bidder
            experience.
          </div>
        )}
        {formState.lots && formState.lots.length > 0 ? (
          formState.lots.map((lot, index) => {
            const lotKey = String(index);
            const previews = previewMap[lotKey] || previewMap[lot.lot_number] || [];
            return (
              <div key={lotKey} className="border rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  Lot {lot.lot_number || index + 1}: {lot.title}
                </h3>
                <input
                  type="file"
                  id={`lot-images-upload-${lotKey}`}
                  name={`lot_images[${lotKey}][]`}
                  accept={allowedTypes.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => handleLotImageChange(lotKey, e)}
                />
                <label
                  htmlFor={`lot-images-upload-${lotKey}`}
                  className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group block"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Drop images here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, JPG (max 10MB each)</p>
                    </div>
                  </div>
                </label>

                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((url, fileIdx) => (
                      <div key={url} className="relative group">
                        <Image
                          src={url}
                          alt={`Lot ${lot.lot_number} image ${fileIdx}`}
                          width={320}
                          height={128}
                          unoptimized
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeLotImage(lotKey, fileIdx)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No lots available to add images. Please add lots in the Lots step first.</p>
          </div>
        )}
      </FormSection>
    </div>
  );
}
