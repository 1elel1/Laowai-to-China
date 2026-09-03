/** Shared shape for every `useActionState` form on the site. */
export type ActionState = {
  ok: boolean;
  /** Top-level message, shown above the form. */
  message?: string;
  /** Field name -> first validation message. */
  errors?: Record<string, string>;
} | null;

export const IDLE: ActionState = null;

export function failure(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors };
}

export function success(message?: string): ActionState {
  return { ok: true, message };
}
