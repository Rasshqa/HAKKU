"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "hakku_printer_connected";
const STORAGE_NAME_KEY = "hakku_printer_name";

const printerListeners = new Set<() => void>();
function notifyPrinterListeners() {
  printerListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // non-fatal
    }
  });
}

function subscribePrinter(callback: () => void) {
  printerListeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    printerListeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

interface NavigatorWithUSB extends Navigator {
  usb?: {
    getDevices: () => Promise<Array<{ productName?: string }>>;
    requestDevice: (options: { filters: unknown[] }) => Promise<{ productName?: string }>;
  };
}

export interface PrinterStatus {
  isPrinterConnected: boolean;
  printerName: string | null;
  connectPrinter: () => Promise<boolean>;
  disconnectPrinter: () => void;
  togglePrinterStatus: () => void;
}

/**
 * Hook to manage printer connection state using React 19 useSyncExternalStore.
 * By default on browsers without verified/paired printer hardware,
 * isPrinterConnected is false so that the "Cetak" button is hidden.
 */
export function usePrinterStatus(): PrinterStatus {
  const isPrinterConnected = useSyncExternalStore(
    subscribePrinter,
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY) === "true";
      } catch {
        return false;
      }
    },
    () => false
  );

  const printerName = useSyncExternalStore(
    subscribePrinter,
    () => {
      try {
        return localStorage.getItem(STORAGE_NAME_KEY) || null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const connectPrinter = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const nav = navigator as NavigatorWithUSB;
    if (nav.usb && typeof nav.usb.requestDevice === "function") {
      try {
        const device = await nav.usb.requestDevice({ filters: [] });
        const name = device.productName || "Printer USB Aktif";
        try {
          localStorage.setItem(STORAGE_KEY, "true");
          localStorage.setItem(STORAGE_NAME_KEY, name);
          notifyPrinterListeners();
        } catch {
          // ignore
        }
        return true;
      } catch {
        // User cancelled WebUSB selection, continue to fallback OS printer
      }
    }

    const fallbackName = "Printer Default Sistem (OS)";
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(STORAGE_NAME_KEY, fallbackName);
      notifyPrinterListeners();
    } catch {
      // ignore
    }
    return true;
  }, []);

  const disconnectPrinter = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_NAME_KEY);
      notifyPrinterListeners();
    } catch {
      // ignore
    }
  }, []);

  const togglePrinterStatus = useCallback(() => {
    if (isPrinterConnected) {
      disconnectPrinter();
    } else {
      connectPrinter();
    }
  }, [isPrinterConnected, connectPrinter, disconnectPrinter]);

  return {
    isPrinterConnected,
    printerName,
    connectPrinter,
    disconnectPrinter,
    togglePrinterStatus,
  };
}
