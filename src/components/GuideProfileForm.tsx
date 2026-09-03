"use client";

import { useActionState, useState } from "react";
import { saveGuideProfileAction } from "@/actions/guide";
import { IDLE } from "@/actions/types";
import {
  CITIES,
  CURRENCIES,
  LANGUAGE_LEVELS,
  LANGUAGES,
  THEMES,
  type GuideType,
  type PricingMode,
} from "@/lib/constants";
import type { Dictionary, Locale } from "@/lib/i18n";
import { SubmitButton } from "./SubmitButton";
import { FormBanner } from "./ui";

export type GuideFormInitial = {
  city: string;
  headline: string;
  bio: string;
  guideType: GuideType;
  pricingMode: PricingMode;
  currency: string;
  hourlyRate: string;
  dailyRate: string;
  yearsExperience: number;
  maxGroupSize: number;
  licenseNo: string;
  contactWechat: string;
  contactPhone: string;
  languages: Record<string, string>;
  themes: string[];
  photos: string;
};

export const EMPTY_GUIDE_FORM: GuideFormInitial = {
  city: "",
  headline: "",
  bio: "",
  guideType: "LOCAL_FRIEND",
  pricingMode: "PAID",
  currency: "CNY",
  hourlyRate: "",
  dailyRate: "",
  yearsExperience: 0,
  maxGroupSize: 4,
  licenseNo: "",
  contactWechat: "",
  contactPhone: "",
  languages: { en: "FLUENT" },
  themes: [],
  photos: "",
};

export function GuideProfileForm({
  initial,
  t,
  locale,
  isApproved,
}: {
  initial: GuideFormInitial;
  t: Dictionary;
  locale: Locale;
  isApproved: boolean;
}) {
  const [state, action] = useActionState(saveGuideProfileAction, IDLE);

  // These two drive conditional fields, so they have to be real state.
  const [guideType, setGuideType] = useState<GuideType>(initial.guideType);
  const [pricingMode, setPricingMode] = useState<PricingMode>(initial.pricingMode);

  const err = state?.errors ?? {};

  return (
    <form action={action} className="space-y-8">
      {state?.message && <FormBanner ok={state.ok} message={state.message} />}

      {/* ------------------------------------------------------------ basics */}
      <Section title={t.apply.sectionBasics}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">
              {t.apply.city}
            </label>
            <select
              id="city"
              name="city"
              defaultValue={initial.city}
              required
              className={`field ${err.city ? "field-error" : ""}`}
            >
              <option value="">—</option>
              {CITIES.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {locale === "zh" ? city.zh : city.en}
                </option>
              ))}
            </select>
            {err.city && <p className="error-text">{err.city}</p>}
          </div>

          <div>
            <label className="label" htmlFor="yearsExperience">
              {t.apply.yearsExperience}
            </label>
            <input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min={0}
              max={60}
              defaultValue={initial.yearsExperience}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="headline">
            {t.apply.headline}
          </label>
          <input
            id="headline"
            name="headline"
            defaultValue={initial.headline}
            placeholder={t.apply.headlinePlaceholder}
            maxLength={120}
            required
            className={`field ${err.headline ? "field-error" : ""}`}
          />
          {err.headline && <p className="error-text">{err.headline}</p>}
        </div>

        <div>
          <label className="label" htmlFor="bio">
            {t.apply.bio}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={8}
            defaultValue={initial.bio}
            placeholder={t.apply.bioPlaceholder}
            required
            className={`field resize-y ${err.bio ? "field-error" : ""}`}
          />
          {err.bio && <p className="error-text">{err.bio}</p>}
        </div>

        <fieldset>
          <legend className="label">{t.apply.guideType}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["PROFESSIONAL", t.apply.guideTypeProfessional],
                ["LOCAL_FRIEND", t.apply.guideTypeLocalFriend],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="card flex cursor-pointer items-start gap-2.5 p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
              >
                <input
                  type="radio"
                  name="guideType"
                  value={value}
                  checked={guideType === value}
                  onChange={() => setGuideType(value)}
                  className="mt-0.5"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {guideType === "PROFESSIONAL" && (
          <div className="sm:max-w-xs">
            <label className="label" htmlFor="licenseNo">
              {t.apply.licenseNo}
            </label>
            <input
              id="licenseNo"
              name="licenseNo"
              defaultValue={initial.licenseNo}
              className={`field ${err.licenseNo ? "field-error" : ""}`}
            />
            {err.licenseNo && <p className="error-text">{err.licenseNo}</p>}
          </div>
        )}

        <div className="sm:max-w-xs">
          <label className="label" htmlFor="maxGroupSize">
            {t.apply.maxGroupSize}
          </label>
          <input
            id="maxGroupSize"
            name="maxGroupSize"
            type="number"
            min={1}
            max={50}
            defaultValue={initial.maxGroupSize}
            className="field"
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------- rates */}
      <Section title={t.apply.sectionRates}>
        <fieldset>
          <legend className="label">{t.apply.pricingMode}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["PAID", t.apply.pricingPaid],
                ["FREE", t.apply.pricingFree],
                ["DONATION", t.apply.pricingDonation],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="card flex cursor-pointer items-start gap-2.5 p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
              >
                <input
                  type="radio"
                  name="pricingMode"
                  value={value}
                  checked={pricingMode === value}
                  onChange={() => setPricingMode(value)}
                  className="mt-0.5"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {pricingMode === "PAID" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="currency">
                {t.apply.currency}
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={initial.currency}
                className="field"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="hourlyRate">
                {t.apply.hourlyRate}
              </label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min={0}
                step="1"
                defaultValue={initial.hourlyRate}
                className={`field ${err.hourlyRateCents ? "field-error" : ""}`}
              />
            </div>
            <div>
              <label className="label" htmlFor="dailyRate">
                {t.apply.dailyRate}
              </label>
              <input
                id="dailyRate"
                name="dailyRate"
                type="number"
                min={0}
                step="1"
                defaultValue={initial.dailyRate}
                className={`field ${err.dailyRateCents ? "field-error" : ""}`}
              />
              {err.dailyRateCents && <p className="error-text">{err.dailyRateCents}</p>}
            </div>
          </div>
        )}

        {/* The currency still has to reach the server when the rate inputs are hidden. */}
        {pricingMode !== "PAID" && (
          <input type="hidden" name="currency" value={initial.currency || "CNY"} />
        )}
      </Section>

      {/* --------------------------------------------------------- languages */}
      <Section title={t.apply.sectionLangs}>
        {err.languages && <p className="error-text">{err.languages}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((lang) => (
            <div key={lang.code} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-sm">
                {locale === "zh" ? lang.zh : lang.en}
              </span>
              <select
                name={`lang_${lang.code}`}
                defaultValue={initial.languages[lang.code] ?? ""}
                className="field py-1.5 text-xs"
                aria-label={`${lang.en} — ${t.apply.languageLevel}`}
              >
                <option value="">—</option>
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t.apply[`level${level}`]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ themes */}
      <Section title={t.apply.sectionThemes}>
        {err.themes && <p className="error-text">{err.themes}</p>}
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((theme) => (
            <label
              key={theme.slug}
              className="chip cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input
                type="checkbox"
                name="themes"
                value={theme.slug}
                defaultChecked={initial.themes.includes(theme.slug)}
                className="sr-only"
              />
              <span aria-hidden>{theme.emoji}</span>
              {locale === "zh" ? theme.zh : theme.en}
            </label>
          ))}
        </div>

        <div>
          <label className="label" htmlFor="photos">
            {t.apply.photos}
          </label>
          <textarea
            id="photos"
            name="photos"
            rows={3}
            defaultValue={initial.photos}
            placeholder="https://…"
            className={`field resize-y font-mono text-xs ${err.photos ? "field-error" : ""}`}
          />
          {err.photos ? (
            <p className="error-text">{err.photos}</p>
          ) : (
            <p className="hint">{t.apply.photosHint}</p>
          )}
        </div>
      </Section>

      {/* ----------------------------------------------------------- contact */}
      <Section title={t.apply.sectionContact} hint={t.apply.contactHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="contactWechat">
              WeChat
            </label>
            <input
              id="contactWechat"
              name="contactWechat"
              defaultValue={initial.contactWechat}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">
              {t.guide.phone}
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              defaultValue={initial.contactPhone}
              className="field"
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <SubmitButton
          name="intent"
          value="submit"
          className="btn-primary"
          pendingLabel={t.common.submitting}
        >
          {isApproved ? t.common.save : t.apply.submit}
        </SubmitButton>
        {!isApproved && (
          <SubmitButton
            name="intent"
            value="draft"
            className="btn-secondary"
            pendingLabel={t.common.saving}
          >
            {t.apply.saveDraft}
          </SubmitButton>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          {title}
        </h2>
        {hint && (
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            {hint}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
