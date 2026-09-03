"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction } from "@/actions/message";
import { IDLE } from "@/actions/types";
import type { Dictionary } from "@/lib/i18n";
import { SubmitButton } from "./SubmitButton";

export function MessageComposer({
  conversationId,
  t,
}: {
  conversationId: string;
  t: Dictionary;
}) {
  const [state, action] = useActionState(sendMessageAction, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      boxRef.current?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex items-end gap-2 border-t p-3">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        ref={boxRef}
        name="body"
        rows={2}
        required
        maxLength={4000}
        placeholder={t.messages.placeholder}
        className="field flex-1 resize-none"
        onKeyDown={(event) => {
          // Enter sends; Shift+Enter is a newline — the convention people expect.
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
      />
      <SubmitButton className="btn-primary" pendingLabel={t.common.sending}>
        {t.messages.send}
      </SubmitButton>
    </form>
  );
}
