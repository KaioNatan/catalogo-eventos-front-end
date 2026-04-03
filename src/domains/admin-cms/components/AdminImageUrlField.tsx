import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { Button } from "@/design-system/ui";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export interface IAdminImageUrlFieldProps {
  /** Prefixo estável para ids (ex.: `imageUrl` no formulário). */
  id: string;
  label?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Tamanho máximo do arquivo local (padrão 5 MB). */
  maxBytes?: number;
}

function canPreview(value: string): boolean {
  const v = value.trim();
  if (!v) {
    return false;
  }
  return v.startsWith("data:") || /^https?:\/\//i.test(v);
}

/**
 * Campo de imagem para o CMS: upload local (data URL) ou URL, com pré-visualização.
 * O valor segue no mesmo `imageUrl` usado pelo cliente HTTP admin.
 */
export function AdminImageUrlField(
  props: IAdminImageUrlFieldProps,
): ReactElement {
  const {
    id,
    label = "Imagem",
    value,
    onChange,
    disabled = false,
    maxBytes = DEFAULT_MAX_BYTES,
  } = props;

  const reactId = useId();
  const fileInputId = `${id}-file-${reactId}`;
  const urlInputId = `${id}-url`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileHint, setFileHint] = useState("");

  const showPreview = canPreview(value);

  function handleFilePick(event: ChangeEvent<HTMLInputElement>): void {
    setFileHint("");
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileHint("Escolha um arquivo de imagem (PNG, JPEG, WebP…).");
      event.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setFileHint(
        `Arquivo muito grande. Tamanho máximo: ${Math.round(maxBytes / (1024 * 1024))} MB.`,
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setFileHint("Não foi possível ler o arquivo.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleUrlInput(event: ChangeEvent<HTMLInputElement>): void {
    setFileHint("");
    onChange(event.target.value);
  }

  function handleClear(): void {
    setFileHint("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <p className="text-xs text-zinc-500">
          Envie um arquivo do seu computador ou cole uma URL (https) já
          hospedada.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="image/*"
          disabled={disabled}
          className="sr-only"
          onChange={handleFilePick}
          aria-label={`${label}: escolher arquivo`}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          Escolher imagem…
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || value.trim() === ""}
          onClick={handleClear}
        >
          Remover
        </Button>
      </div>

      {fileHint !== "" ? (
        <p className="text-sm text-red-600" role="alert">
          {fileHint}
        </p>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor={urlInputId}
          className="text-sm font-medium text-zinc-700"
        >
          URL ou data URL (opcional se enviou arquivo acima)
        </label>
        <input
          id={urlInputId}
          name={id}
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleUrlInput}
          disabled={disabled}
          placeholder="https://… ou data:image/png;base64,…"
          className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
        />
      </div>

      {showPreview ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="mb-2 text-xs font-medium text-zinc-600">
            Pré-visualização
          </p>
          <img
            src={value.trim()}
            alt="Pré-visualização da imagem"
            className="max-h-56 w-full max-w-md rounded-lg object-contain object-left"
          />
        </div>
      ) : null}
    </div>
  );
}
