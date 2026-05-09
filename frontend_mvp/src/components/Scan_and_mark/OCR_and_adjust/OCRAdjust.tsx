'use client';

import { Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

type OCRTarget = {
  id: string;
  originalText: string;
  suggestions: string[];
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

const IMAGE_SIZE = {
  width: 1059,
  height: 1517,
};

const OCR_TARGETS: OCRTarget[] = [
  {
    id: 'eq-456-a',
    originalText: '45G',
    suggestions: ['456', '45.6', '4x56'],
    box: { x: 548, y: 376, w: 74, h: 44 },
  },
  {
    id: 'd-value',
    originalText: 'd = q',
    suggestions: ['d = 9', 'd = 0', 'd = g'],
    box: { x: 486, y: 810, w: 170, h: 34 },
  },
  {
    id: 't1-value',
    originalText: 'T(1) = 4Z',
    suggestions: ['T(1) = 42', 'T(1) = 47', 'T(1) = 46'],
    box: { x: 196, y: 896, w: 190, h: 38 },
  },
  {
    id: 'power-term',
    originalText: '10b',
    suggestions: ['10^6', '10^8', '10⁶'],
    box: { x: 515, y: 1060, w: 220, h: 42 },
  },
  {
    id: 'final-n',
    originalText: '4GB',
    suggestions: ['468', '488', '458'],
    box: { x: 630, y: 1200, w: 90, h: 36 },
  },
];

export function OCRAdjust() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(OCR_TARGETS[0].id);
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, string>>({});
  const [selectedSuggestionByTarget, setSelectedSuggestionByTarget] = useState<Record<string, string>>({});
  const [confirmedByTarget, setConfirmedByTarget] = useState<Record<string, boolean>>({});
  const imageScrollRef = useRef<HTMLDivElement | null>(null);
  const highlightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentFocusId = activeId ?? selectedId;

  const mappedTargets = useMemo(
    () =>
      OCR_TARGETS.map((target) => {
        const manualValue = manualAdjustments[target.id]?.trim() || '';
        const selectedSuggestion = selectedSuggestionByTarget[target.id] || '';
        const finalText = manualValue || selectedSuggestion || target.originalText;
        return { ...target, finalText };
      }),
    [manualAdjustments, selectedSuggestionByTarget]
  );

  const scrollImageToTarget = (targetId: string) => {
    const container = imageScrollRef.current;
    const targetEl = highlightRefs.current[targetId];
    if (!container || !targetEl) return;

    const nextTop = targetEl.offsetTop - container.clientHeight / 2 + targetEl.clientHeight / 2;
    const nextLeft = targetEl.offsetLeft - container.clientWidth / 2 + targetEl.clientWidth / 2;

    container.scrollTo({
      top: Math.max(0, nextTop),
      left: Math.max(0, nextLeft),
      behavior: 'smooth',
    });
  };

  const scrollCardToTarget = (targetId: string) => {
    const container = cardListRef.current;
    const targetEl = cardRefs.current[targetId];
    if (!container || !targetEl) return;

    const nextTop = targetEl.offsetTop - container.clientHeight / 2 + targetEl.clientHeight / 2;
    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: 'smooth',
    });
  };

  const selectTarget = (targetId: string) => {
    setSelectedId(targetId);
    setActiveId(targetId);
  };

  const moveToNextUnconfirmed = (currentTargetId: string, nextConfirmedState: Record<string, boolean>) => {
    const currentIndex = OCR_TARGETS.findIndex((target) => target.id === currentTargetId);
    if (currentIndex === -1) return;

    const nextTarget = OCR_TARGETS.slice(currentIndex + 1).find(
      (target) => !nextConfirmedState[target.id]
    );
    if (!nextTarget) return;

    selectTarget(nextTarget.id);
    scrollCardToTarget(nextTarget.id);
    scrollImageToTarget(nextTarget.id);
  };

  const hasFocus = Boolean(currentFocusId);

  return (
    <div className="mt-6 flex flex-col gap-5 xl:flex-row">
      <div className="min-h-0 xl:w-2/3">
        <div className="rounded-2xl border border-white/30 bg-white/70 p-3 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Sparkles className="h-4 w-4 text-cyan-600" />
            OCR Detection Preview
          </div>
          <div
            ref={imageScrollRef}
            className="max-h-[72vh] overflow-auto rounded-xl border border-gray-200 bg-gray-100/80 p-3"
          >
            <div className="relative mx-auto w-full max-w-[760px]">
              <img
                src="/doc/image.png"
                alt="Handwritten math homework"
                className="h-auto w-full rounded-lg object-contain shadow-sm"
              />
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-cyan-100/5 via-transparent to-indigo-100/5" />
              {mappedTargets.map((target) => {
                const isActive = activeId === target.id;
                const isSelected = selectedId === target.id;
                const isFocused = currentFocusId === target.id;
                return (
                  <button
                    key={target.id}
                    ref={(el) => {
                      highlightRefs.current[target.id] = el;
                    }}
                    type="button"
                    onMouseEnter={() => setActiveId(target.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onClick={() => {
                      selectTarget(target.id);
                      scrollCardToTarget(target.id);
                    }}
                    className={cn(
                      'absolute z-20 rounded-md border transition-all duration-200',
                      'border-red-300/85 bg-red-300/20 backdrop-blur-[1px]',
                      isActive
                        ? 'ring-2 ring-red-300/75 shadow-[0_0_16px_rgba(248,113,113,0.5)]'
                        : isSelected
                          ? 'ring-2 ring-red-200/85 shadow-[0_0_14px_rgba(248,113,113,0.42)]'
                          : 'shadow-[0_0_10px_rgba(248,113,113,0.28)]',
                      hasFocus && !isFocused ? 'opacity-80' : 'opacity-100'
                    )}
                    style={{
                      top: `${(target.box.y / IMAGE_SIZE.height) * 100}%`,
                      left: `${(target.box.x / IMAGE_SIZE.width) * 100}%`,
                      width: `${(target.box.w / IMAGE_SIZE.width) * 100}%`,
                      height: `${(target.box.h / IMAGE_SIZE.height) * 100}%`,
                    }}
                    aria-label={`OCR highlight for ${target.originalText}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 xl:w-1/3">
        <div className="rounded-2xl border border-white/30 bg-white/70 p-3 shadow-lg h-full">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">OCR Wording Adjustment</h3>
          <div ref={cardListRef} className="max-h-[72vh] space-y-3 overflow-auto px-1">
            {mappedTargets.map((target) => {
              const isActive = activeId === target.id;
              const isSelected = selectedId === target.id;
              const isFocused = currentFocusId === target.id;
              return (
                <div
                  key={target.id}
                  ref={(el) => {
                    cardRefs.current[target.id] = el;
                  }}
                  onMouseEnter={() => setActiveId(target.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() => {
                    selectTarget(target.id);
                    scrollImageToTarget(target.id);
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl border p-3 transition-all duration-200',
                    'border-white/70 bg-white/90',
                    isActive
                      ? 'border-cyan-300/90 shadow-[0_0_10px_rgba(14,165,233,0.22)]'
                      : isSelected
                        ? 'border-cyan-200/90 shadow-[0_0_10px_rgba(14,165,233,0.16)]'
                        : 'shadow-sm hover:border-cyan-200',
                    hasFocus && !isFocused ? 'opacity-80' : 'opacity-100'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">{target.finalText}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant={confirmedByTarget[target.id] ? 'default' : 'outline'}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectTarget(target.id);
                        setConfirmedByTarget((prev) => {
                          const next = { ...prev, [target.id]: true };
                          moveToNextUnconfirmed(target.id, next);
                          return next;
                        });
                      }}
                      className={cn(
                        'h-7 px-2.5 text-xs',
                        confirmedByTarget[target.id]
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {confirmedByTarget[target.id] ? 'Confirmed' : 'Confirm'}
                    </Button>
                  </div>

                  <p className="mb-1.5 text-xs text-gray-500">Detected OCR: {target.originalText}</p>
                  <div className="mb-2 space-y-1">
                    {target.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectTarget(target.id);
                          scrollImageToTarget(target.id);
                          setSelectedSuggestionByTarget((prev) => ({
                            ...prev,
                            [target.id]: suggestion,
                          }));
                          setManualAdjustments((prev) => ({
                            ...prev,
                            [target.id]: '',
                          }));
                          setConfirmedByTarget((prev) => ({
                            ...prev,
                            [target.id]: false,
                          }));
                        }}
                        className={cn(
                          'block w-full rounded-md border px-2.5 py-1.5 text-left text-xs text-gray-700 transition',
                          selectedSuggestionByTarget[target.id] === suggestion
                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                            : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-cyan-50'
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <input
                    value={manualAdjustments[target.id] ?? ''}
                    onChange={(event) => {
                      selectTarget(target.id);
                      setManualAdjustments((prev) => ({
                        ...prev,
                        [target.id]: event.target.value,
                      }));
                      setSelectedSuggestionByTarget((prev) => ({
                        ...prev,
                        [target.id]: '',
                      }));
                      setConfirmedByTarget((prev) => ({
                        ...prev,
                        [target.id]: false,
                      }));
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectTarget(target.id);
                    }}
                    placeholder="Type custom correction..."
                    className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
