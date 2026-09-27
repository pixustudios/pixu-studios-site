"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  boothTemplates,
  cameraErrorMessage,
  createComposite,
  requestCamera,
} from "@/lib/booth";
import { track } from "@/lib/analytics";
import TrackedLink from "../components/TrackedLink";
type Step = "landing" | "layout" | "permission" | "camera" | "preview";
export default function OnlineBooth() {
  const [step, setStep] = useState<Step>("landing");
  const [count, setCount] = useState(4);
  const [photos, setPhotos] = useState<string[]>([]);
  const [template, setTemplate] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [frame, setFrame] = useState(1);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exportFile, setExportFile] = useState<File | null>(null);
  const [shareable, setShareable] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const panel = useRef<HTMLElement>(null);
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
    createComposite(photos, boothTemplates[template])
      .then(({ canvas, blob }) => {
        if (cancelled || !preview.current) return;
        preview.current.width = canvas.width;
        preview.current.height = canvas.height;
        preview.current.getContext("2d")?.drawImage(canvas, 0, 0);
        const file = new File([blob], "pixu-happily-documented.png", {
          type: "image/png",
        });
        setExportFile(file);
        setShareable(!!navigator.canShare?.({ files: [file] }));
      })
      .catch((e) => {
        if (!cancelled) setError(cameraErrorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [photos, template, step]);
  const resetCamera = () => {
    stop();
    setPhotos([]);
    setExportFile(null);
    setError("");
    setCountdown(null);
    setFrame(1);
    setBusy(false);
    setFlash(false);
    setStep("permission");
  };
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
  const capture = async () => {
    if (busy || !active.current || !video.current) return;
    const operation = generation.current;
    setBusy(true);
    setError("");
    const wait = async (ms: number) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      if (operation !== generation.current) throw new Error("cancelled");
    };
    const captured: string[] = [];
    try {
      for (let i = 0; i < count; i++) {
        setFrame(i + 1);
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
      track("online_booth_completed");
    } catch (e) {
      if (operation === generation.current) {
        setError(cameraErrorMessage(e));
        setCountdown(null);
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
        <p className="eyebrow">A little PIXÜ, wherever you are</p>
        <h1>
          PIXÜ <em>Online Booth</em>
        </h1>
        <p>Get close. Be yourself. Keep the moment.</p>
      </header>
      <section
        ref={panel}
        tabIndex={-1}
        className={`booth-panel${step === "landing" ? " booth-heart" : ""}`}
        aria-label="Online photobooth"
      >
        {step === "landing" && (
          <>
            <svg className="booth-heart-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M50 96 C40 85 3 63 3 31 C3 7 31 0 50 20 C69 0 97 7 97 31 C97 63 60 85 50 96 Z" /></svg>
            <p className="eyebrow">Your digital keepsake</p>
            <h2>
              Pull up a friend.
              <br />
              <em>Or steal a moment.</em>
            </h2>
            <p>
              A four-photo strip or a single frame. Choose a PIXÜ finish, then
              download your own little memory.
            </p>
            <button
              className="button"
              onClick={() => {
                setStep("layout");
                track("online_booth_started");
              }}
            >
              Start the booth <span aria-hidden="true">↗</span>
            </button>
          </>
        )}
        {step === "layout" && (
          <>
            <p className="eyebrow">01 / Make it yours</p>
            <h2>Choose your layout.</h2>
            <div className="booth-layouts">
              {[4, 1].map((n) => (
                <button
                  key={n}
                  className="layout-option"
                  aria-pressed={count === n}
                  onClick={() => setCount(n)}
                >
                  <span
                    className={`layout-diagram ${n === 1 ? "single" : ""}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: n }, (_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                  {n === 4 ? "4-photo strip" : "Single photo"}
                </button>
              ))}
            </div>
            <button className="button" onClick={() => setStep("permission")}>
              Continue →
            </button>
          </>
        )}
        {step === "permission" && (
          <>
            <p className="eyebrow">02 / Just you and the camera</p>
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
          </>
        )}
        <div hidden={step !== "camera"}>
          <p className="eyebrow" aria-live="polite">
            03 / Photo {frame} of {count}
          </p>
          <h2>{busy ? "Make it a moment." : "Ready when you are."}</h2>
          <div className="booth-camera">
            <video
              ref={video}
              autoPlay
              playsInline
              muted
              aria-label="Live camera preview"
            />
            {countdown !== null && (
              <span className="countdown" role="status" aria-live="assertive">
                {countdown}
              </span>
            )}
            {flash && <span className="camera-flash" aria-hidden="true" />}
          </div>
          <p className="small">
            {count === 4
              ? "Four photographs, automatically. Three seconds to find each pose."
              : "One photograph. Three seconds to find your pose."}
          </p>
          <div className="actions">
            <button className="button" disabled={busy} onClick={capture}>
              {busy
                ? "Capturing…"
                : count === 4
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
            <canvas
              ref={preview}
              width={1200}
              height={photos.length * 850 + 220}
              role="img"
              aria-label={`Your completed PIXÜ ${count === 4 ? "four-photo strip" : "photograph"}`}
            />
            <div>
              <p className="eyebrow">04 / Yours to keep</p>
              <h2>
                That’s <em>a keeper.</em>
              </h2>
              <p>
                Choose a finish for your {count === 4 ? "strip" : "photograph"}.
              </p>
              <div className="template-options">
                {boothTemplates.map((item, i) => (
                  <button
                    key={item.name}
                    aria-pressed={template === i}
                    onClick={() => {
                      if (i !== template) {
                        setExportFile(null);
                        setTemplate(i);
                      }
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button
                  className="button"
                  onClick={download}
                  disabled={!exportFile}
                >
                  {exportFile ? "Download image ↓" : "Preparing image…"}
                </button>
                {shareable && (
                  <button
                    className="button button-outline"
                    onClick={share}
                    disabled={!exportFile}
                  >
                    Share ↗
                  </button>
                )}
                <button className="text-link" onClick={resetCamera}>
                  Retake {count === 4 ? "the strip" : "photo"}
                </button>
              </div>
              <p className="small" style={{ marginTop: 24 }}>
                Want this at your event?
              </p>
              <TrackedLink
                href="/contact?experience=photobooth"
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
    </main>
  );
}
