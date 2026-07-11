"use client";

import { useState, useCallback } from "react";
import LightboxComponent from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export interface LightboxImage {
  src: string;
  alt?: string;
}

interface LightboxState {
  open: boolean;
  images: LightboxImage[];
  index: number;
}

export function useLightbox() {
  const [state, setState] = useState<LightboxState>({
    open: false,
    images: [],
    index: 0,
  });

  const open = useCallback((images: LightboxImage[], index: number = 0) => {
    setState({ open: true, images, index });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return { open, close, state };
}

export function Lightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  return (
    <LightboxComponent
      open={state.open}
      close={onClose}
      index={state.index}
      slides={state.images.map((img) => ({ src: img.src }))}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 8,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
      }}
    />
  );
}
