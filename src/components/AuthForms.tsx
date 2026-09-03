"use client";

import { useActionState } from "react";
import { loginAction, signupAction } from "@/actions/auth";
import { IDLE } from "@/actions/types";
import type { Dictionary } from "@/lib/i18n";
import { SubmitButton } from "./SubmitButton";
import { FormBanner } from "./ui";

export function LoginForm({ t, next }: { t: Dictionary; next?: string }) {
  const [state, action] = useActionState(loginAction, IDLE);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state && !state.ok && state.message && <FormBanner ok={false} message={state.message} />}

      <div>
        <label className="label" htmlFor="email">
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`field ${state?.errors?.email ? "field-error" : ""}`}
        />
        {state?.errors?.email && <p className="error-text">{state.errors.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">
          {t.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`field ${state?.errors?.password ? "field-error" : ""}`}
        />
        {state?.errors?.password && <p className="error-text">{state.errors.password}</p>}
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel={t.common.loading}>
        {t.auth.loginCta}
      </SubmitButton>
    </form>
  );
}

export function SignupForm({
  t,
  next,
  defaultRole = "TRAVELER",
}: {
  t: Dictionary;
  next?: string;
  defaultRole?: "TRAVELER" | "GUIDE";
}) {
  const [state, action] = useActionState(signupAction, IDLE);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state && !state.ok && state.message && <FormBanner ok={false} message={state.message} />}

      <fieldset>
        <legend className="label">{t.auth.iAm}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["TRAVELER", "GUIDE"] as const).map((role) => (
            <label
              key={role}
              className="card flex cursor-pointer items-start gap-2.5 p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input
                type="radio"
                name="role"
                value={role}
                defaultChecked={role === defaultRole}
                className="mt-0.5 accent-current"
              />
              <span>{role === "TRAVELER" ? t.auth.roleTraveler : t.auth.roleGuide}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="name">
          {t.auth.name}
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className={`field ${state?.errors?.name ? "field-error" : ""}`}
        />
        {state?.errors?.name && <p className="error-text">{state.errors.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="signup-email">
          {t.auth.email}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`field ${state?.errors?.email ? "field-error" : ""}`}
        />
        {state?.errors?.email && <p className="error-text">{state.errors.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="signup-password">
          {t.auth.password}
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={`field ${state?.errors?.password ? "field-error" : ""}`}
        />
        {state?.errors?.password ? (
          <p className="error-text">{state.errors.password}</p>
        ) : (
          <p className="hint">{t.auth.passwordHint}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="country">
          {t.auth.country}{" "}
          <span className="font-normal" style={{ color: "var(--muted)" }}>
            ({t.common.optional})
          </span>
        </label>
        <input id="country" name="country" autoComplete="country-name" className="field" />
        <p className="hint">{t.auth.countryHint}</p>
      </div>

      <SubmitButton className="btn-primary w-full" pendingLabel={t.common.loading}>
        {t.auth.signupCta}
      </SubmitButton>
    </form>
  );
}
