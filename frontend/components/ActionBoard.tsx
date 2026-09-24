"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { ActionCategory, ActionItem } from "@/lib/types";

interface ActionBoardProps {
  actions: ActionItem[];
  onToggleAction: (id: string, isCompleted: boolean) => void;
}

export const ActionBoard: React.FC<ActionBoardProps> = ({
  actions,
  onToggleAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>("act-1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter actions
  const filteredActions = actions.filter((item) => {
    if (selectedCategory === "ALL") return true;
    return item.category === selectedCategory;
  });

  // Sort: Incomplete first, then by priority (URGENT > HIGH > MEDIUM > LOW)
  const priorityWeight: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const sortedActions = [...filteredActions].sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const categories: { label: string; value: string }[] = [
    { label: "Tüm Görevler", value: "ALL" },
    { label: "Local-GBP (Harita)", value: "Local-GBP" },
    { label: "Technical (Teknik)", value: "Technical" },
    { label: "Content-Gap (İçerik)", value: "Content-Gap" },
    { label: "On-Page (Sayfa İçi)", value: "On-Page" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header & Filter Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Akıllı Eylem Tahtası (The Action Board)
            </h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Yapay Zeka Destekli
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Rakiplerinizi organik aramada ve haritalarda geride bırakmak için önceliklendirilmiş somut görevler.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-100/80 p-1.5 shadow-2xs">
          {categories.map((cat) => {
            const count =
              cat.value === "ALL"
                ? actions.length
                : actions.filter((a) => a.category === cat.value).length;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${
                    isSelected ? "bg-indigo-50 text-indigo-700" : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Cards List */}
      <div className="mt-6 space-y-4">
        {sortedActions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Bu kategoride henüz görev bulunmuyor.
          </div>
        ) : (
          sortedActions.map((action) => {
            const isExpanded = expandedId === action.id;
            const isUrgent = action.priority === "URGENT";

            return (
              <div
                key={action.id}
                className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                  action.is_completed
                    ? "border-slate-200 bg-slate-50/60 opacity-80"
                    : isUrgent
                    ? "border-rose-200 bg-white shadow-sm hover:border-rose-300"
                    : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
                }`}
              >
                {/* Main Card Header */}
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="flex items-start space-x-3.5">
                    {/* Completion Checkbox Button */}
                    <button
                      onClick={() => onToggleAction(action.id, !action.is_completed)}
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${
                        action.is_completed
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white hover:border-indigo-600 text-transparent"
                      }`}
                      title={action.is_completed ? "Tamamlandı olarak işaretlendi" : "Görevi Uyguladım"}
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <div>
                      {/* Badge Tags Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority Badge */}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            action.priority === "URGENT"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : action.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          <Flame className="mr-1 h-3 w-3" />
                          {action.priority === "URGENT"
                            ? "Acil Öncelik"
                            : action.priority === "HIGH"
                            ? "Yüksek Öncelik"
                            : "Orta Öncelik"}
                        </span>

                        {/* Impact Tag */}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            action.impact === "HIGH"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Zap className="mr-1 h-3 w-3 text-indigo-500" />
                          {action.impact === "HIGH" ? "Yüksek Etki" : action.impact === "MEDIUM" ? "Orta Etki" : "Düşük Etki"}
                        </span>

                        {/* Category */}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {action.category}
                        </span>

                        {/* Effort Tag */}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Uygulama: {action.effort === "EASY" ? "Kolay" : action.effort === "MODERATE" ? "Orta" : "Zor"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={`mt-2 text-base font-bold tracking-tight ${
                          action.is_completed
                            ? "text-slate-500 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {action.title}
                      </h3>

                      {/* Problem Statement Preview */}
                      <p className="mt-1 text-xs text-slate-600">
                        <strong className="text-slate-700">Sorun:</strong> {action.problem}
                      </p>
                    </div>
                  </div>

                  {/* Right: Accordion Toggle Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAccordion(action.id)}
                      className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span>{isExpanded ? "Kapat" : "Nasıl Yapılır?"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                    {/* Step-by-step Solution Guide */}
                    <div>
                      <h4 className="flex items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                        <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                        Adım Adım Çözüm Rehberi
                      </h4>
                      <div className="mt-2 whitespace-pre-line rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700">
                        {action.solution_guide}
                      </div>
                    </div>

                    {/* Ready to Copy Code / Fix Snippet if available */}
                    {action.suggested_fix && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="flex items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                            <Code className="mr-1.5 h-4 w-4 text-indigo-600" />
                            Hazır Kod / İçerik Önerisi
                          </h4>
                          <button
                            onClick={() => handleCopy(action.id, action.suggested_fix!)}
                            className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                          >
                            {copiedId === action.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Kopyalandı!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Kodu Kopyala</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="mt-2 max-h-64 overflow-y-auto text-[11px] leading-relaxed">
                          <code>{action.suggested_fix}</code>
                        </pre>
                      </div>
                    )}

                    {/* Bottom Status Check Action */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <span className="text-xs text-slate-500">
                        Bu görevi sitenizde uyguladıktan sonra işaretleyin:
                      </span>
                      <button
                        onClick={() => onToggleAction(action.id, !action.is_completed)}
                        className={`inline-flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                          action.is_completed
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        <span>
                          {action.is_completed ? "Geri Al (Yapılmadı)" : "Uyguladım, Tamamlandı Olarak İşaretle"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
