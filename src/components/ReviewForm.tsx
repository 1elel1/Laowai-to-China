"use client";

import { useActionState, useState } from "react";
import { createReviewAction } from "@/actions/review";
import { IDLE } from "@/actions/types";
import type { Dictionary } from "@/lib/i18n";
import { SubmitButton } from "./SubmitButton";
import { FormBanner } from "./ui";

export function ReviewForm({ bookingId, t }: { bookingId: string; t: Dictionary }) {
  const [state, action] = useActionState(createReviewAction, IDLE);
  const [rating, setRating] = useState(5);
  const [open, setOpen] = useState(false);

  if (state?.ok) return <FormBanner ok message={`✓ ${t.dashboard.reviewed}`} />;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary btn-sm mt-4">
        {t.dashboard.leaveReview}
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-3 border-t pt-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      {state && !state.ok && state.message && <FormBanner ok={false} message={state.message} />}

      <div className="flex items-center gap-1" role="radiogroup" aria-label={t.dashboard.leaveReview}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value}`}
            onClick={() => setRating(value)}
            className="p-0.5 text-xl leading-none"
            style={{ color: value <= rating ? "var(--accent)" : "var(--line)" }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={3}
        required
        minLength={10}
        className={`field resize-y ${state?.errors?.comment ? "field-error" : ""}`}
      />
      {state?.errors?.comment && <p className="error-text">{state.errors.comment}</p>}

      <div className="flex gap-2">
        <SubmitButton className="btn-primary btn-sm" pendingLabel={t.common.sending}>
          {t.common.submit}
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}
