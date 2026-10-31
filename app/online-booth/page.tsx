"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  boothTemplates,
  boothLayouts,
  photoShapes,
  photoFilters,


  type PhotoShape,
  type BoothLayoutId,
  cameraErrorMessage,
  createComposite,
  requestCamera,
} from "@/lib/booth";
import { track } from "@/lib/analytics";
import TrackedLink from "../components/TrackedLink";
import BoothPhotoEditor from "../components/BoothPhotoEditor";
type Step = "landing" | "layout" | "permission" | "camera" | "preview";
export default function OnlineBooth() {
  const [step, setStep] = useState<Step>("landing");
  const [entering, setEntering] = useState(false);
  const [closing, setClosing] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  useEffect(() => {
    if (!entering) return;
    const reveal = window.setTimeout(() => setStep("layout"), 300);
    const finish = window.setTimeout(() => setEntering(false), 1000);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(finish);
    };
  }, [entering]);
  const [layoutId, setLayoutId] = useState<BoothLayoutId>("strip");
  const selectedLayout = boothLayouts.find((item) => item.id === layoutId)!;
  const count = selectedLayout.count;
  const [photos, setPhotos] = useState<string[]>([]);
  const [template, setTemplate] = useState(0);
  const [photoShape, setPhotoShape] = useState<PhotoShape>("Rectangle");
  const [filterIndex, setFilterIndex] = useState(0);
  const [baseImage, setBaseImage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureIndex, setCaptureIndex] = useState<number | null>(null);

  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exportFile, setExportFile] = useState<File | null>(null);
  const shareable = !!exportFile && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [exportFile] });
  const video = useRef<HTMLVideoElement>(null);
  const panel = useRef<HTMLElement>(null);
  const layoutPicker = useRef<HTMLDivElement>(null);
  const chooseLayout = (direction: number) => {
    const next = (boothLayouts.findIndex(layout => layout.id === layoutId) + direction + boothLayouts.length) % boothLayouts.length;
    setLayoutId(boothLayouts[next].id);
    layoutPicker.current?.children[next]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "center" });
  };
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const active = useRef(false);
  const stop = useCallback(() => {
    generation.current++;
    active.current = false;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  useEffect(() => {
    if (step !== "landing") panel.current?.focus();
  }, [step]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden && active.current) {
        stop();
        setBusy(false);
        setCountdown(null);
        setCaptureIndex(null);
        setFlash(false);
        setStep("permission");
        setError(
          "Camera paused while you were away. Allow the camera to start again.",
        );
      }
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", stop);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", stop);
    };
  }, [stop]);
  useEffect(() => {
    if (step !== "preview" || !photos.length) return;
    let cancelled = false;
    createComposite(photos, boothTemplates[template], layoutId, photoShape, photoFilters[filterIndex].value)
      .then(({ canvas }) => {
        if (cancelled) return;
        setBaseImage(canvas.toDataURL("image/png"));
      })
      .catch((e) => {
        if (!cancelled) setError(cameraErrorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [photos, template, step, layoutId, photoShape, filterIndex]);
  const resetCamera = useCallback(() => {
    stop();
    setPhotos([]);
    setExportFile(null);
    setBaseImage("");
    setError("");
    setCountdown(null);
    setCaptureIndex(null);

    setBusy(false);
    setFlash(false);
    setStep("permission");
  }, [stop]);
  useEffect(() => {
    if (!closing) return;
    const finish = window.setTimeout(() => {
      resetCamera();
      setStep("landing");
      setClosing(false);
      requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>(".booth-entry-ticket")?.focus());
    }, 720);
    return () => window.clearTimeout(finish);
  }, [closing, resetCamera]);
  const startCamera = async () => {
    if (active.current) return;
    stop();
    active.current = true;
    const operation = generation.current;
    setBusy(true);
    setError("");
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Camera access needs a supported browser on HTTPS (or localhost). Open this page in Safari or Chrome.",
        );
      const media = await requestCamera();
      if (operation !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      media.getVideoTracks()[0].onended = () => {
        if (active.current) {
          stop();
          setBusy(false);
          setStep("permission");
          setError("The camera disconnected. Reconnect it and try again.");
        }
      };
      if (!video.current)
        throw new Error("Camera preview unavailable. Please try again.");
      video.current.srcObject = media;
      await video.current.play();
      if (operation !== generation.current) return;
      setStep("camera");
      setBusy(false);
    } catch (e) {
      if (operation === generation.current) {
        stop();
        setBusy(false);
        setError(cameraErrorMessage(e));
        setStep("permission");
      }
    }
  };
  const retake = () => {
    resetCamera();
    void startCamera();
  };
  const capture = async () => {
    if (busy || !active.current || !video.current) return;
    const operation = generation.current;
    setBusy(true);
    setError("");
    setCaptureIndex(null);
    const wait = async (ms: number) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      if (operation !== generation.current) throw new Error("cancelled");
    };
    const captured: string[] = [];
    try {
      for (let i = 0; i < count; i++) {
        setCaptureIndex(i + 1);
        for (let n = 3; n > 0; n--) {
          setCountdown(n);
          await wait(1000);
        }
        setCountdown(null);
        const element = video.current;
        if (!element || element.readyState < 2 || !element.videoWidth)
          throw new Error("The camera isn’t ready. Please restart the camera.");
        const canvas = document.createElement("canvas");
        canvas.width = element.videoWidth;
        canvas.height = element.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Capture unavailable in this browser.");
        // Mirror both the preview and export, preserving the entire camera frame.
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(element, 0, 0);
        captured.push(canvas.toDataURL("image/png"));
        setFlash(true);
        await wait(180);
        setFlash(false);
        await wait(450);
      }
      stop();
      setPhotos(captured);
      setExportFile(null);
      setStep("preview");
      setBusy(false);
      setCaptureIndex(null);
      track("online_booth_completed");
    } catch (e) {
      if (operation === generation.current) {
        setError(cameraErrorMessage(e));
        setCountdown(null);
        setCaptureIndex(null);
        setFlash(false);
        setBusy(false);
      }
    }
  };
  const download = () => {
    if (!exportFile) return;
    const url = URL.createObjectURL(exportFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFile.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const share = async () => {
    if (!exportFile) return;
    try {
      await navigator.share({ files: [exportFile], title: "A PIXÜ moment" });
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setError("Sharing isn’t available here. Download the image instead.");
    }
  };
  return (
    <main id="main" className="container booth-shell">
      <header className="booth-heading">
        <h1>
          <em>pixü &amp; friends</em>
        </h1>
        <p>Your online photobooth.</p>
      </header>
      <section
        ref={panel}
        tabIndex={-1}
        className={`booth-panel${step === "landing" ? " booth-brand" : " booth-sketch-stage"}${entering ? " is-entering" : ""}`}
        aria-label="Online photobooth"
        data-step={step}
        aria-busy={entering || closing}
      >
       {step !== "landing" && <button type="button" className="booth-close" aria-label="close booth and return to welcome" title="back to welcome" disabled={closing} onClick={() => {
         if (closing) return;
         stop();
         setEntering(false);
         if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
           resetCamera();
           setStep("landing");
           requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>(".booth-entry-ticket")?.focus());
         } else {
           setClosing(true);
         }
       }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>}
       {(entering || closing) && <div className={`booth-curtain-transition${closing ? " is-closing" : ""}`} aria-hidden="true"><span /><span /></div>}
        {step === "landing" && (
          <>
            <Image className="booth-illustration booth-ink-transparent" src="/online-booth-sketch-facing-right.svg" alt="Simple line sketch of a vintage photobooth facing right with a handwritten PIXÜ sign" width={480} height={620} priority />
            <div className="booth-intro-copy">
            <h2>
              Pull up a friend.
              <br />
              <em>Or steal a moment.</em>
            </h2>
            <p>
              Choose a layout, take your photos and make them yours with playful finishes.
            </p>
            <button
              className="booth-entry-ticket"
              disabled={entering}
              onClick={() => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStep("layout");
                else setEntering(true);
                track("online_booth_started");
              }}
            >
              <span className="booth-ticket-copy"><span className="booth-ticket-caption">Your moment awaits</span><span className="booth-ticket-title">Enter the booth</span></span>
              <svg className="booth-ticket-door" viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m5 36 1-31 22 1-1 30M3 37h27" /><path className="ticket-door-leaf" d="m7 6 15 4-1 25-15 1 1-30Z" /><path d="m17 21 1 .2" strokeWidth="2.5" /></svg>
            </button>
            <p className="booth-device-note">Best on desktop. Works on mobile too.</p>
            </div>
          </>
        )}
        {step === "layout" && (
          <>
            <h2>Choose your layout.</h2>
            <div className="booth-layout-carousel">
            <button type="button" className="layout-arrow" aria-label="Previous layout" onClick={() => chooseLayout(-1)}>‹</button>
            <div className="booth-layouts" ref={layoutPicker}>
              {boothLayouts.map((layout) => (
                <button
                  key={layout.id}
                  className="layout-option"
                  aria-label={layout.name}
                  aria-pressed={layoutId === layout.id}
                  onClick={event => { setLayoutId(layout.id); event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }}
                >
                  <span className={`layout-diagram format-${layout.id}`} aria-hidden="true">
                    {Array.from({ length: layout.count }, (_, i) => <i key={i} />)}
                  </span>
                </button>
              ))}
            </div>
            <button type="button" className="layout-arrow" aria-label="Next layout" onClick={() => chooseLayout(1)}>›</button>
            </div>
            <p className="layout-selection-caption" aria-live="polite">{selectedLayout.name} <span> / {String(boothLayouts.findIndex(layout => layout.id === layoutId) + 1).padStart(2, "0")} of {String(boothLayouts.length).padStart(2, "0")}</span></p>
            <button className="button" onClick={() => setStep("permission")}>
              Continue
            </button>
          </>
        )}
        {step === "permission" && (
          <div className="booth-permission-content">
            <svg className="booth-permission-camera" width="96" height="78" viewBox="0 0 96 78" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 14q-5 0-5 5v25q0 5 5 5l62 1q5 0 5-5V20q0-5-5-5l-62-1Z" />
              <circle cx="48" cy="32" r="12" /><circle cx="48" cy="32" r="8" />
              <path d="M44 28q-3 1-3 5M20 26v12M24 26v12M72 30h3M40 50l-3 11 22 .3-3-11M37 61l-10 7q-2 2 1 3h40q3-1 1-3l-10-7M32 67l31 .3" />
              <circle cx="73" cy="23" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <h2>Let’s see you.</h2>
            <p>
              Allow camera access to take your photographs. No microphone, no
              uploads. Your photos stay in this browser until you choose to
              download or share them.
            </p>
            <div className="actions">
              <button className="button" disabled={busy} onClick={startCamera}>
                {busy ? "Waiting for your camera…" : "Allow camera"}
              </button>
              <button
                className="button button-outline"
                onClick={() => {
                  stop();
                  setBusy(false);
                  setError("");
                  setStep("layout");
                }}
              >
                Back to layouts
              </button>
            </div>
          </div>
        )}
        <div hidden={step !== "camera"}>
          <h2>{busy ? "Make it a moment." : "Ready when you are."}</h2>
          <div className="booth-camera" style={{ aspectRatio: "16 / 9" }}>
            <video
              ref={video}
              autoPlay
              playsInline
              muted
              aria-label="Live camera preview"
            />
            {count > 1 && captureIndex !== null && (
              <span className="booth-photo-progress" aria-live="polite">
                {captureIndex}/{count}
              </span>
            )}
            {countdown !== null && (
              <span className="countdown" role="status" aria-live="assertive">
                {countdown}
              </span>
            )}
            {flash && <span className="camera-flash" aria-hidden="true" />}
          </div>
          <p className="small">
            {count > 1
              ? `${count} photographs, automatically. Three seconds to find each pose.`
              : "One photograph. Three seconds to find your pose."}
          </p>
          <div className="actions">
            <button className="button" disabled={busy} onClick={capture}>
              {busy
                ? "Capturing…"
                : count > 1
                  ? "Start the countdown"
                  : "Take my photo"}
            </button>
            <button className="button button-outline" onClick={resetCamera}>
              Cancel & stop camera
            </button>
          </div>
        </div>
        {step === "preview" && (
          <div className="booth-preview">
            {baseImage ? <BoothPhotoEditor image={baseImage} onExport={setExportFile} /> : <p role="status">Preparing your photo…</p>}
            <div>
              <h2>
                That’s <em>a keeper.</em>
              </h2>
              <p>
                Choose a finish for your {selectedLayout.name.toLowerCase()}.
              </p>
              <div className="template-options finish-swatches" role="group" aria-label="Frame colour">
                {boothTemplates.map((item, i) => (
                  <button
                    key={item.name}
                    aria-label={item.name}
                    title={item.name}
                    style={{ backgroundColor: item.background }}
                    aria-pressed={template === i}
                    onClick={() => {
                      if (i !== template) {
                        setExportFile(null);
                        setTemplate(i);
                      }
                    }}
                  >
                    <span className="sr-only">{item.name}</span>
                  </button>
                ))}
              </div>
              <label className="booth-shape-picker">Photo shape
                <select value={photoShape} onChange={event => { setExportFile(null); setPhotoShape(event.target.value as PhotoShape); }}>
                  {photoShapes.map(shape => <option key={shape}>{shape}</option>)}
                </select>
              </label>
              <fieldset className="booth-filter-picker">
                <legend>Photo filter</legend>
                <div>{photoFilters.map((filter, index) => <button type="button" key={filter.name} aria-pressed={filterIndex === index} onClick={() => { setExportFile(null); setFilterIndex(index); }}>{filter.name}</button>)}</div>
              </fieldset>
              <div className="actions">
                <button
                  className="button"
                  onClick={download}
                  disabled={!exportFile}
                >
                  {exportFile ? "Download image" : "Preparing image…"}
                </button>
                {shareable && (
                  <button
                    className="button button-outline"
                    onClick={share}
                    disabled={!exportFile}
                  >
                    Share
                  </button>
                )}
                <button className="text-link" onClick={retake}>
                  Retake {count > 1 ? "photos" : "photo"}
                </button>
              </div>
              <p className="small" style={{ marginTop: 24 }}>
                Want this at your event?
              </p>
              <TrackedLink
                href="/experiences#booking"
                className="text-link"
                event="online_booth_booking_clicked"
              >
                Book the PIXÜ booth
              </TrackedLink>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="form-status">
            {error}
          </p>
        )}
      </section>
      <p className="camera-privacy">
        Made in your browser. Kept by you.{" "}
        <Link href="/privacy">Camera privacy</Link>
      </p>
      {step === "landing" && (
        <details className="booth-suggestions">
          <summary>
            <span>More little moments, coming soon.</span>
            <span className="booth-suggestions-hint">Have an idea? Leave us a note <span aria-hidden="true">+</span></span>
          </summary>
          <form onSubmit={(event) => {
            event.preventDefault();
            const note = suggestion.trim();
            if (!note) return;
            window.location.href = `mailto:info@pixustudios.com?subject=${encodeURIComponent("pixü & friends — a little idea")}&body=${encodeURIComponent(note)}`;
          }}>
            <p>More features are on the way. Tell us what you’d love to see inside the booth.</p>
            <label htmlFor="booth-suggestion">Your little idea</label>
            <textarea id="booth-suggestion" name="suggestion" rows={3} maxLength={1500} required value={suggestion} onChange={(event) => setSuggestion(event.target.value)} placeholder="A new finish, a fun feature, a little something missing…" />
            <div className="booth-suggestions-send">
              <button className="button button-outline" type="submit" disabled={!suggestion.trim()}>Email your idea</button>
              <span>Opens your email app. Press send there to share your note.</span>
            </div>
          </form>
        </details>
      )}
    </main>
  );
}
