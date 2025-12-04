import React, { useState } from 'react';
import { Upload, X, IndianRupee, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomOrders } from '@/hooks/useCustomOrders';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
}

const CustomOrderModal: React.FC<CustomOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  sellerId, 
  sellerName 
}) => {
  const [description, setDescription] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const { createRequest, isLoading } = useCustomOrders();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;

    const result = await createRequest({
      sellerId,
      description: description.trim(),
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      proposedBudget: proposedBudget ? parseFloat(proposedBudget) : undefined
    });

    if (result.success) {
      setDescription('');
      setProposedBudget('');
      setReferenceImages([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Custom Order</DialogTitle>
          <DialogDescription>
            Send a custom order request to {sellerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">Describe your custom order *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're looking for, including size, colors, materials, and any specific details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Proposed Budget (Optional)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                type="number"
                placeholder="Enter your budget"
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                className="pl-9"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Share your budget to help the artisan understand your expectations
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reference Images (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                id="reference-images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="reference-images"
                className="flex flex-col items-center justify-center cursor-pointer py-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload reference images
                </span>
              </label>
            </div>

            {referenceImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {referenceImages.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={img}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !description.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOrderModal;
