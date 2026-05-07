"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { CheckCircle2, Copy, Download, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSemesterQr, type Semester } from "@/lib/api/semester-service";
import { cn } from "@/lib/utils";

type SemesterQrModalProps = {
  open: boolean;
  semester: Semester | null;
  onOpenChange: (open: boolean) => void;
  onError: (message: string) => void;
};

export function SemesterQrModal({
  open,
  semester,
  onOpenChange,
  onError,
}: SemesterQrModalProps) {
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const token = semester?.static_qr_token ?? undefined;
  const semesterTitle = semester?.title ?? "Semester";
  const logoSrc = "/logo.png";

  function handleOpenStateChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIsCopying(false);
      setIsDownloading(false);
    }

    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (!open || !semester?.id) {
      return;
    }

    let isActive = true;

    async function loadQrImage() {
      try {
        setIsLoadingQr(true);
        const response = await getSemesterQr(semester.id);

        if (!isActive) {
          return;
        }

        setQrImageUrl(response.data.qr_image_url);
      } catch {
        if (isActive) {
          setQrImageUrl(null);
          onError("Unable to load the QR code right now.");
        }
      } finally {
        if (isActive) {
          setIsLoadingQr(false);
        }
      }
    }

    void loadQrImage();

    return () => {
      isActive = false;
    };
  }, [onError, open, semester?.id]);

  async function handleCopyToken() {
    if (!token || isCopying) {
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(token);
      window.setTimeout(() => {
        setIsCopying(false);
      }, 1500);
    } catch {
      setIsCopying(false);
      onError("Unable to copy token right now.");
    }
  }

  async function handleDownloadQr() {
    if (!qrImageUrl || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);

      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = qrImageUrl;
        downloadLinkRef.current.download = `${semesterTitle}-qr.png`;
        downloadLinkRef.current.click();
      }
    } catch {
      onError("Unable to download the QR code right now.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenStateChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-border/70 bg-background shadow-2xl duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="relative overflow-hidden rounded-[28px]">
            <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-r from-sky-500/12 via-blue-500/10 to-cyan-400/12" />

            <div className="relative p-6 sm:p-7">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:text-foreground"
                  aria-label="Close QR modal"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>

              <Dialog.Title className="text-xl font-semibold text-foreground">
                {semesterTitle} QR Code
              </Dialog.Title>
              <Dialog.Description className="mt-2 max-w-lg text-sm text-muted-foreground">
                Scan this QR or copy the static token for attendance flows tied
                to this semester.
              </Dialog.Description>

              <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-border/70 bg-muted/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Static Token
                    </p>
                    <p className="mt-3 break-all font-mono text-sm text-foreground">
                      {token ?? "--"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => void handleCopyToken()}
                      className="rounded-2xl"
                    >
                      {isCopying ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {isCopying ? "Copied" : "Copy token"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleDownloadQr()}
                      className="rounded-2xl"
                    >
                      <Download className="size-4" />
                      {isDownloading ? "Preparing..." : "Download QR"}
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-[32px] border border-slate-200/80 bg-white p-4 shadow-sm">
                  <a
                    ref={downloadLinkRef}
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div className="mx-auto flex min-h-[280px] items-center justify-center">
                    {isLoadingQr ? (
                      <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                        <LoaderCircle className="size-5 animate-spin" />
                        <span>Generating QR...</span>
                      </div>
                    ) : qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt={`${semesterTitle} QR code`}
                        className="h-[280px] w-[280px] rounded-[24px] object-contain"
                      />
                    ) : (
                      <p className="text-sm text-slate-500">QR unavailable</p>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                      <img
                        src={logoSrc}
                        alt="AttentLab logo"
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
