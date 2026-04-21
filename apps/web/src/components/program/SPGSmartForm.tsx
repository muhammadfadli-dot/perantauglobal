"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";
import FormProgress from "./spg-form/FormProgress";
import FormStep1 from "./spg-form/FormStep1";
import FormStep2 from "./spg-form/FormStep2";
import FormStep3 from "./spg-form/FormStep3";
import FormStep4 from "./spg-form/FormStep4";
import StopScreen from "./spg-form/StopScreen";
import SuccessScreen from "./spg-form/SuccessScreen";
import {
  type SPGFormData,
  type StopReason,
  type FormStatus,
  type ScoreStatus,
  INITIAL_FORM_DATA,
  checkStopConditions,
} from "./spg-form/types";

const TOTAL_STEPS = 4;

export default function SPGSmartForm() {
  const t = useTranslations("program.spg.smartForm");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SPGFormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [stopReason, setStopReason] = useState<StopReason | null>(null);
  const [scoreStatus, setScoreStatus] = useState<ScoreStatus>("green");

  function handleChange(field: keyof SPGFormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    // Check STOP conditions before advancing
    const stop = checkStopConditions(currentStep, formData);
    if (stop) {
      setStopReason(stop);
      setStatus("stopped");
      handleStoppedSubmit(stop);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  // Submit partial data when stopped (for analytics)
  async function handleStoppedSubmit(reason: StopReason) {
    try {
      await fetch("/api/program/spg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stopped: true,
          stoppedAtPage: currentStep + 1,
          stopReason: reason,
        }),
      });
    } catch {
      // Silent fail — analytics only
    }
  }

  async function handleSubmit() {
    setStatus("loading");
    const eventId = generateEventId("spg_smart");
    const { fbp, fbc } = getMetaCookies();
    try {
      const res = await fetch("/api/program/spg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventId, fbp, fbc }),
      });

      if (res.ok) {
        const data = await res.json();
        setScoreStatus(data.status || "yellow");
        trackEvent("form_submission", { form_name: "spg_smart", form_location: "/program/spg" }, eventId);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const stepProps = {
    formData,
    onChange: handleChange,
    onNext: handleNext,
    onBack: handleBack,
    t: (key: string) => t(key),
  };

  // Determine if current step's required fields are filled
  function isStepValid(): boolean {
    switch (currentStep) {
      case 0:
        return !!(
          formData.fullName &&
          formData.phone &&
          formData.email &&
          formData.province &&
          formData.city &&
          formData.age &&
          formData.education &&
          formData.vehicle
        );
      case 1:
        return !!(
          formData.workStatus &&
          formData.availability &&
          formData.hasSmartphone &&
          formData.hasInternet &&
          formData.fieldWorkWilling
        );
      case 2:
        return !!(
          formData.motivationReason &&
          formData.communicationComfort &&
          formData.initiativeScenario &&
          formData.referralSource
        );
      case 3:
        return !!(formData.briefingAvailability && formData.agreedTerms);
      default:
        return false;
    }
  }

  return (
    <section id="registration-form" className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        <aside>
          <SectionTag number="09" label="Form pendaftaran SPG" />
          <DisplayHeadline size="sidebar" className="mt-4">
            Daftar{" "}
            <Italic>dalam</Italic>{" "}
            <Accent>4 langkah.</Accent>
          </DisplayHeadline>
          <p className="mt-6 text-[15px] leading-[1.55] opacity-75">{t("subtitle")}</p>
          <div className="mt-6 border border-[var(--color-dtg-ink)] bg-white p-4 font-[family-name:var(--font-mono)] text-[13px] leading-[1.5]">
            ⚠ {t("trustNote")}
          </div>
          <MonoLabel className="mt-6 block opacity-60">
            Langkah {currentStep + 1} dari {TOTAL_STEPS}
          </MonoLabel>
        </aside>

        <div className="border border-[var(--color-dtg-ink)] bg-white p-8 lg:p-10">
          {/* Stopped state */}
          {status === "stopped" && stopReason && (
            <StopScreen reason={stopReason} t={(key: string) => t(key)} />
          )}

          {/* Success state */}
          {status === "success" && (
            <SuccessScreen status={scoreStatus} t={(key: string) => t(key)} />
          )}

          {/* Form state */}
          {status !== "stopped" && status !== "success" && (
            <>
              <FormProgress currentStep={currentStep} t={(key: string) => t(key)} />

              {currentStep === 0 && <FormStep1 {...stepProps} />}
              {currentStep === 1 && <FormStep2 {...stepProps} />}
              {currentStep === 2 && <FormStep3 {...stepProps} />}
              {currentStep === 3 && <FormStep4 {...stepProps} />}

              {status === "error" && (
                <p className="mt-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
                  ⚠ {t("error")}
                </p>
              )}

              {/* Navigation buttons */}
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--color-dtg-ink)] pt-6">
                {currentStep > 0 ? (
                  <EditorialButton
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    suffix={null}
                    size="sm"
                  >
                    ← {t("back")}
                  </EditorialButton>
                ) : (
                  <div />
                )}

                {currentStep < TOTAL_STEPS - 1 ? (
                  <EditorialButton
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    variant="ink"
                    suffix="→"
                  >
                    {t("next")}
                  </EditorialButton>
                ) : (
                  <EditorialButton
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepValid() || status === "loading"}
                    variant="ink"
                    suffix={status === "loading" ? "…" : "→"}
                  >
                    {status === "loading" ? "Mengirim…" : t("submit")}
                  </EditorialButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
