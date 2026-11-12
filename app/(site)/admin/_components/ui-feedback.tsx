"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: ToastTone };

type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PromptOptions = ConfirmOptions & {
  label: string;
  type?: "text" | "password";
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
};

type Request =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

type UiFeedback = {
  toast: (message: string, tone?: ToastTone) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const UiFeedbackContext = createContext<UiFeedback | null>(null);

export function useUiFeedback() {
  const value = useContext(UiFeedbackContext);
  if (!value) throw new Error("useUiFeedback must be used inside UiFeedbackProvider.");
  return value;
}

/**
 * Thông báo dạng toast và hộp thoại xác nhận/nhập liệu theo giao diện quản
 * trị, thay cho window.alert/confirm/prompt. Toast nằm trong popover "manual"
 * nên vẫn hiện phía trên drawer/dialog modal (top layer).
 */
export function UiFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [request, setRequest] = useState<Request | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === "error" ? 8000 : 4500);
    },
    [dismiss],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setRequest({ kind: "confirm", options, resolve })),
    [],
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => setRequest({ kind: "prompt", options, resolve })),
    [],
  );

  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  return (
    <UiFeedbackContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      {request && (
        <RequestDialog
          key={request.kind + request.options.title}
          request={request}
          onDone={() => setRequest(null)}
        />
      )}
    </UiFeedbackContext.Provider>
  );
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof element.showPopover !== "function") return;
    // Hiện lại mỗi khi có toast mới để nằm trên cùng top layer (trên drawer đang mở).
    if (element.matches(":popover-open")) element.hidePopover();
    if (toasts.length > 0) element.showPopover();
  }, [toasts]);

  return (
    <div aria-live="polite" className="admin-toast-stack" popover="manual" ref={ref}>
      {toasts.map((toast) => (
        <div
          className={`admin-toast admin-toast-${toast.tone}`}
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
        >
          <span>{toast.message}</span>
          <button aria-label="Đóng thông báo" onClick={() => onDismiss(toast.id)} type="button">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function RequestDialog({ request, onDone }: { request: Request; onDone: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState("");
  const settled = useRef(false);
  const { options } = request;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function finish(confirmed: boolean) {
    if (settled.current) return;
    settled.current = true;
    if (request.kind === "confirm") request.resolve(confirmed);
    else request.resolve(confirmed ? value : null);
    ref.current?.close();
    onDone();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finish(true);
  }

  const promptOptions = request.kind === "prompt" ? request.options : null;

  return (
    <dialog
      aria-labelledby="admin-request-title"
      className="admin-request-dialog"
      onCancel={(event) => {
        event.preventDefault();
        finish(false);
      }}
      ref={ref}
    >
      <form className="admin-shell-form" onSubmit={submit}>
        <h2 id="admin-request-title">{options.title}</h2>
        {options.message && <div className="admin-request-message">{options.message}</div>}
        {promptOptions && (
          <label className="admin-request-field">
            {promptOptions.label}
            <input
              autoComplete={promptOptions.autoComplete ?? "off"}
              autoFocus
              maxLength={promptOptions.maxLength}
              minLength={promptOptions.minLength}
              onChange={(event) => setValue(event.target.value)}
              required
              type={promptOptions.type ?? "text"}
              value={value}
            />
          </label>
        )}
        <div className="admin-request-actions">
          <button
            autoFocus={!promptOptions}
            className="admin-secondary-button"
            onClick={() => finish(false)}
            type="button"
          >
            {options.cancelLabel ?? "Hủy"}
          </button>
          <button
            className={options.danger ? "admin-danger-button" : "admin-primary-button"}
            type="submit"
          >
            {options.confirmLabel ?? "Đồng ý"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
