import c from "classnames";
import { HTMLAttributes, ReactNode, useEffect, useRef } from "react";

import { usePreferencesStore } from "../../stores/preferences";
import "./Flare.css";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export interface FlareProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  backgroundClass: string;
  flareSize?: number;
  cssColorVar?: string;
  enabled?: boolean;
  gradientOpacity?: number;
  gradientSpread?: number;
}

/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

const SIZE_DEFAULT = 200;
const CSS_VAR_DEFAULT = "--colors-global-accentA";

/* ------------------------------------------------------------------ */
/* Base Components */
/* ------------------------------------------------------------------ */

function Base(props: {
  className?: string;
  children?: ReactNode;
  tabIndex?: number;
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      tabIndex={props.tabIndex}
      className={c(props.className, "relative")}
      onKeyUp={props.onKeyUp}
    >
      {props.children}
    </div>
  );
}

function Child(props: { className?: string; children?: ReactNode }) {
  return <div className={c(props.className, "relative")}>{props.children}</div>;
}

/* ------------------------------------------------------------------ */
/* Light Flare */
/* ------------------------------------------------------------------ */

function Light({
  className,
  backgroundClass,
  flareSize,
  cssColorVar,
  enabled,
  gradientOpacity,
  gradientSpread,
  ...domProps
}: FlareProps) {
  const { enableLowPerformanceMode } = usePreferencesStore();
  const outerRef = useRef<HTMLDivElement>(null);

  const size = flareSize ?? SIZE_DEFAULT;
  const cssVar = cssColorVar ?? CSS_VAR_DEFAULT;
  const opacity = gradientOpacity ?? 1;
  const spread = gradientSpread ?? 70;

  useEffect(() => {
    if (enableLowPerformanceMode) return;

    function mouseMove(e: MouseEvent) {
      if (!outerRef.current) return;

      const rect = outerRef.current.getBoundingClientRect();
      const halfSize = size / 2;

      outerRef.current.style.setProperty(
        "--bg-x",
        `${(e.clientX - rect.left - halfSize).toFixed(0)}px`,
      );
      outerRef.current.style.setProperty(
        "--bg-y",
        `${(e.clientY - rect.top - halfSize).toFixed(0)}px`,
      );
    }

    document.addEventListener("mousemove", mouseMove);
    return () => document.removeEventListener("mousemove", mouseMove);
  }, [enableLowPerformanceMode, size]);

  if (enableLowPerformanceMode) {
    return null;
  }

  return (
    <div
      ref={outerRef}
      {...domProps}
      className={c(
        "flare-light pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-[400ms]",
        className,
        { "!opacity-100": enabled ?? false },
      )}
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(var(${cssVar}) / ${opacity}), rgba(var(${cssVar}) / 0) ${spread}%)`,
        backgroundPosition: "var(--bg-x) var(--bg-y)",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      <div
        className={c(
          "absolute inset-[1px] overflow-hidden",
          className,
          backgroundClass,
        )}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(var(${cssVar}) / ${opacity}), rgba(var(${cssVar}) / 0) ${spread}%)`,
            backgroundPosition: "var(--bg-x) var(--bg-y)",
            backgroundRepeat: "no-repeat",
            backgroundSize: `${size}px ${size}px`,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Export API */
/* ------------------------------------------------------------------ */

export const Flare = {
  Base,
  Light,
  Child,
};
