"use client";

import { useActionState } from "react";
import { createBookingAction } from "@/actions/booking";
import { IDLE } from "@/actions/types";
import type { Dictionary } from "@/lib/i18n";
import { SubmitButton } from "./SubmitButton";
import { FormBanner } from "./ui";

export function BookingForm({
  guideId,
  maxGroupSize,
  currency,
  t,
  minDate,
}: {
  guideId: string;
  maxGroupSize: number;
  currency: string;
  t: Dictionary;
  minDate: string;
}) {
  const [state, action] = useActionState(createBookingAction, IDLE);

  // A sent request should not leave the old text sitting in the box.
  if (state?.ok) {
    return <FormBanner ok message={state.message ?? t.booking.success} />;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="guideId" value={guideId} />

      {state && !state.ok && state.message && <FormBanner ok={false} message={state.message} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="startDate">
            {t.booking.startDate}
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            min={minDate}
            className={`field ${state?.errors?.startDate ? "field-error" : ""}`}
          />
          {state?.errors?.startDate && <p className="error-text">{state.errors.startDate}</p>}
        </div>
        <div>
          <label className="label" htmlFor="endDate">
            {t.booking.endDate}
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            min={minDate}
            className={`field ${state?.errors?.endDate ? "field-error" : ""}`}
          />
          {state?.errors?.endDate && <p className="error-text">{state.errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="partySize">
            {t.booking.partySize}
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            max={maxGroupSize}
            defaultValue={2}
            className={`field ${state?.errors?.partySize ? "field-error" : ""}`}
          />
          {state?.errors?.partySize && <p className="error-text">{state.errors.partySize}</p>}
        </div>
        <div>
          <label className="label" htmlFor="budget">
            {t.booking.budget}
          </label>
          <div className="relative">
            <input
              id="budget"
              name="budget"
              type="number"
              min={0}
              step="1"
              placeholder="—"
              className="field pr-14"
            />
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "var(--muted)" }}
            >
              {currency}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="message">
          {t.booking.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={20}
          placeholder={t.booking.messagePlaceholder}
          className={`field resize-y ${state?.errors?.message ? "field-error" : ""}`}
        />
        {state?.errors?.message ? (
          <p className="error-text">{state.errors.message}</p>
        ) : (
          <p className="hint">{t.booking.budgetHint}</p>
        )}
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel={t.common.sending}>
        {t.booking.submit}
      </SubmitButton>
    </form>
  );
}
