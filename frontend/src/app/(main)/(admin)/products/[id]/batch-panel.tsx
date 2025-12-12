"use client";

import { useState, useEffect } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { authStorage } from "@/lib/storage";
import { apiFetch } from "@/lib/api";
import { ModelProfile, ScenePreset } from "@/types";

type BatchGenerationJob = {
  id: string;
  modelProfileId: string | null;
  sceneId: string | null;
  frontCount: number;
  backCount: number;
  aspectRatio: string;
  resolution: string;
  quality: string;
};

type BatchErrors = {
  jobs: {
    [jobId: string]: {
      modelProfileId?: string;
      sceneId?: string;
      counts?: string;
      global?: string;
    };
  };
  global?: string;
};

type BatchResultItem = {
  jobId: string;
  jobIndex: number;
  generationId?: number;
  errors?: {
    front?: string;
    back?: string;
  };
};

type Props = {
  productId: number;
  modelProfiles: ModelProfile[];
  scenes: ScenePreset[];
};

type BatchGenerateResponse = {
  productId: string;
  results: {
    jobIndex: number;
    generationId?: number;
    errors?: { front?: string; back?: string };
  }[];
};

const defaultJob = (): BatchGenerationJob => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  modelProfileId: null,
  sceneId: null,
  frontCount: 1,
  backCount: 0,
  aspectRatio: "9:16",
  resolution: "4K",
  quality: "STANDARD",
});

export function BatchPanel({ productId, modelProfiles, scenes }: Props) {
  const [jobs, setJobs] = useState<BatchGenerationJob[]>([defaultJob()]);
  const [errors, setErrors] = useState<BatchErrors>({ jobs: {} });
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply scene defaults per row
  useEffect(() => {
    setJobs((prev) =>
      prev.map((job) => {
        const scene = scenes.find((s) => String(s.id) === String(job.sceneId));
        if (!scene) return job;
        const next = { ...job };
        if (!job.aspectRatio && scene.suggestedAspectRatio) {
          next.aspectRatio = scene.suggestedAspectRatio;
        }
        if (!job.quality && scene.qualityPreset) {
          next.quality = scene.qualityPreset;
        }
        return next;
      }),
    );
  }, [scenes]);

  const validateJobs = (list: BatchGenerationJob[]): BatchErrors => {
    const err: BatchErrors = { jobs: {} };
    if (!list.length) {
      err.global = "En az bir job eklemelisiniz.";
      return err;
    }
    list.forEach((job) => {
      const jobErr: Record<string, string> = {};
      if (!job.modelProfileId) jobErr.modelProfileId = "Lütfen bir model seçin.";
      if (!job.sceneId) jobErr.sceneId = "Lütfen bir sahne seçin.";
      if ((job.frontCount ?? 0) <= 0 && (job.backCount ?? 0) <= 0) {
        jobErr.counts = "En az bir taraf için görsel adedi girmelisiniz.";
      }
      if (Object.keys(jobErr).length) {
        err.jobs[job.id] = jobErr;
      }
    });
    return err;
  };

  const handleJobChange = (id: string, partial: Partial<BatchGenerationJob>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...partial } : job)));
    setErrors((prev) => {
      const next = { ...prev, jobs: { ...prev.jobs } };
      delete next.jobs[id];
      return next;
    });
  };

  const handleAddJob = () => {
    setJobs((prev) => [...prev, defaultJob()]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const handleSubmit = async () => {
    const validation = validateJobs(jobs);
    if (validation.global || Object.keys(validation.jobs).length) {
      setErrors(validation);
      return;
    }
    const token = authStorage.token();
    if (!token) {
      setErrors({ jobs: {}, global: "Oturum bulunamadı" });
      return;
    }
    setIsSubmitting(true);
    setErrors({ jobs: {} });
    setResults([]);
    try {
      const payload = {
        productId: String(productId),
        jobs: jobs.map((job) => ({
          modelProfileId: job.modelProfileId!,
          sceneId: job.sceneId!,
          frontCount: job.frontCount,
          backCount: job.backCount,
          aspectRatio: job.aspectRatio || "9:16",
          resolution: job.resolution || "4K",
          quality: job.quality || "STANDARD",
        })),
      };
      const response = await apiFetch<BatchGenerateResponse>("/generations/batch", {
        method: "POST",
        token,
        body: payload,
      });
      const mapped: BatchResultItem[] = (response.results ?? []).map((r) => {
        const job = jobs[r.jobIndex];
        return {
          jobId: job?.id ?? String(r.jobIndex),
          jobIndex: r.jobIndex,
          generationId: r.generationId,
          errors: r.errors,
        };
      });
      setResults(mapped);
    } catch (err: any) {
      setErrors({ jobs: {}, global: err?.message || "Toplu üretim sırasında hata oluştu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Toplu Üretim</p>
          <p className="text-base text-white font-semibold">Birden fazla job'u tek seferde çalıştır</p>
        </div>
        {errors.global && <AppBadge variant="destructive">{errors.global}</AppBadge>}
      </div>

      <AppCard className="p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="text-sm text-slate-300">
            Henüz job yok.{" "}
            <button className="text-cyan-200 underline" onClick={handleAddJob}>
              Job ekle
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job, idx) => {
              const jobErr = errors.jobs[job.id] || {};
              const scene = scenes.find((s) => String(s.id) === String(job.sceneId));
              return (
                <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-200">Job #{idx + 1}</span>
                    <button
                      className="text-xs text-rose-200 underline"
                      onClick={() => handleRemoveJob(job.id)}
                      disabled={jobs.length === 1}
                    >
                      Sil
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-2">
                    <AppSelect
                      label="Model"
                      value={job.modelProfileId ?? ""}
                      onChange={(e) => handleJobChange(job.id, { modelProfileId: e.target.value || null })}
                    >
                      <option value="">Seç</option>
                      {modelProfiles.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </AppSelect>
                    <AppSelect
                      label="Sahne"
                      value={job.sceneId ?? ""}
                      onChange={(e) => handleJobChange(job.id, { sceneId: e.target.value || null })}
                    >
                      <option value="">Seç</option>
                      {scenes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </AppSelect>
                    <div className="grid grid-cols-2 gap-2">
                      <AppInput
                        label="Front"
                        type="number"
                        min={0}
                        value={job.frontCount}
                        onChange={(e) =>
                          handleJobChange(job.id, { frontCount: Math.max(0, Number(e.target.value)) })
                        }
                      />
                      <AppInput
                        label="Back"
                        type="number"
                        min={0}
                        value={job.backCount}
                        onChange={(e) =>
                          handleJobChange(job.id, { backCount: Math.max(0, Number(e.target.value)) })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-2">
                    <AppSelect
                      label="Aspect"
                      value={job.aspectRatio}
                      onChange={(e) => handleJobChange(job.id, { aspectRatio: e.target.value })}
                    >
                      <option value="9:16">9:16</option>
                      <option value="16:9">16:9</option>
                    </AppSelect>
                    <AppSelect
                      label="Resolution"
                      value={job.resolution}
                      onChange={(e) => handleJobChange(job.id, { resolution: e.target.value })}
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </AppSelect>
                    <AppSelect
                      label="Quality"
                      value={job.quality}
                      onChange={(e) => handleJobChange(job.id, { quality: e.target.value })}
                    >
                      <option value="FAST">FAST</option>
                      <option value="STANDARD">STANDARD</option>
                      <option value="HIGH">HIGH</option>
                    </AppSelect>
                  </div>
                  {jobErr.modelProfileId && <p className="text-xs text-rose-300">{jobErr.modelProfileId}</p>}
                  {jobErr.sceneId && <p className="text-xs text-rose-300">{jobErr.sceneId}</p>}
                  {jobErr.counts && <p className="text-xs text-rose-300">{jobErr.counts}</p>}
                  {scene && (
                    <p className="text-xs text-slate-400">
                      Öneri: Aspect {scene.suggestedAspectRatio ?? "-"} • Kalite {scene.qualityPreset ?? "-"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button className="text-sm text-cyan-200 underline" onClick={handleAddJob}>
            Job ekle
          </button>
          <AppButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Gönderiliyor..." : "Toplu Üretimi Başlat"}
          </AppButton>
        </div>
      </AppCard>

      {results.length > 0 && (
        <AppCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Toplu Üretim Sonuçları</h4>
            <span className="text-xs text-slate-400">{results.length} job</span>
          </div>
          <div className="space-y-2">
            {results.map((res) => {
              const job = jobs.find((j) => j.id === res.jobId);
              return (
                <div
                  key={res.jobId}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="space-y-1 text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Job #{res.jobIndex + 1}</span>
                      {res.generationId ? (
                        <AppBadge variant="success">Başarılı</AppBadge>
                      ) : (
                        <AppBadge variant="destructive">Hata</AppBadge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Model: {job?.modelProfileId ?? "-"} • Sahne: {job?.sceneId ?? "-"} • İstek:{" "}
                      {job?.frontCount ?? 0}/{job?.backCount ?? 0}
                    </div>
                    {res.errors?.front && (
                      <div className="text-xs text-amber-200">Ön hata: {res.errors.front}</div>
                    )}
                    {res.errors?.back && (
                      <div className="text-xs text-rose-200">Arka hata: {res.errors.back}</div>
                    )}
                  </div>
                  {res.generationId && (
                    <a
                      className="text-cyan-200 underline text-xs"
                      href={`/generations/${res.generationId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Detay
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </AppCard>
      )}
    </div>
  );
}
