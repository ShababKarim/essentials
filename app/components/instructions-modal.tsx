"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "essentials-how-to-play-seen-v1";

const tileRows = [
  {
    letters: [
      ["Fiqh", "tile-correct"],
      ["A", ""],
      ["B", ""],
    ],
    text: "Green means your answer is correct.",
  },
  {
    letters: [
      ["Aqeedah", "tile-close"],
      ["B", ""],
      ["C", ""],
    ],
    text: "Gold means close, but not the best answer for that prompt.",
  },
  {
    letters: [
      ["C", ""],
      ["D", ""],
      ["E", "tile-miss"],
    ],
    text: "Gray means incorrect for the question.",
  },
] as const;

export function InstructionsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = window.localStorage.getItem(STORAGE_KEY) === "1";
    setOpen(!hasSeen);
  }, []);

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
      }).format(new Date()),
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How To Play</DialogTitle>
          <DialogDescription>
            Welcome to <span className="font-semibold text-foreground">Essentials</span>,
            the daily Ramadan quiz. Each day at midnight, a new set of
            <span className="font-semibold text-foreground"> 3 questions</span> is released
            across fiqh and aqeedah.
          </DialogDescription>
        </DialogHeader>

        <ul className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed text-foreground/90">
          <li>Submit one answer for each of the 3 questions.</li>
          <li>After submitting, you will see your result card and score.</li>
          <li>Copy your summary and share it with family and friends.</li>
        </ul>

        <div className="space-y-3 rounded-xl bg-muted/70 p-4">
          <h3 className="font-[var(--font-heading)] text-2xl font-bold">Examples</h3>
          {tileRows.map((row) => (
            <div key={row.text} className="space-y-2">
              <div className="flex gap-2 text-sm">
                {row.letters.map(([value, style], idx) => (
                  <span key={`${value}-${idx}`} className={`tile ${style}`}>
                    {value}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{row.text}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
          <p>
            <span className="font-semibold">Today&apos;s quiz:</span> {today}. New quiz drops
            every night at 12:00 AM local time.
          </p>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
          Let&apos;s Play
        </Button>
      </DialogContent>
    </Dialog>
  );
}
