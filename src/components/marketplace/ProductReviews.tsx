import React, { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviews, Review } from '@/hooks/useReviews';
import { formatDistanceToNow } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
  showForm?: boolean;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}> = ({ rating, onRatingChange, interactive = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRatingChange?.(star)}
        >
          <Star
            className={`${sizeClasses} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, showForm = true }) => {
  const { reviews, isLoading, fetchProductReviews, createReview, getAverageRating } = useReviews();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProductReviews(productId);
  }, [productId, fetchProductReviews]);

  const handleSubmitReview = async () => {
    if (newRating === 0) return;

    setIsSubmitting(true);
    const result = await createReview(productId, newRating, newComment);
    if (result.success) {
      setNewRating(0);
      setNewComment('');
      setShowReviewForm(false);
      fetchProductReviews(productId);
    }
    setIsSubmitting(false);
  };

  const averageRating = getAverageRating(reviews);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <StarRating rating={Math.round(averageRating)} size="md" />
            <span className="font-semibold text-foreground ml-2">{averageRating}</span>
          </div>
          <span className="text-muted-foreground">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        {showForm && !showReviewForm && (
          <Button variant="outline" onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-foreground">Write Your Review</h4>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Rating</label>
            <StarRating
              rating={newRating}
              onRatingChange={setNewRating}
              interactive
              size="md"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Review (optional)</label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReview}
              disabled={newRating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.buyer?.business_name || 'Anonymous Buyer'}
                    </p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground pl-10">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
