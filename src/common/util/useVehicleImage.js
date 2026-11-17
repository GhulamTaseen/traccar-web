import { useEffect, useState } from 'react';
import { prepareVehicleImage } from './vehicleImage';

const cache = new Map();

const loadPrepared = (src) => {
  if (!cache.has(src)) {
    cache.set(
      src,
      prepareVehicleImage(src).catch(() => null),
    );
  }
  return cache.get(src);
};

export default function useVehicleImage(src) {
  const [state, setState] = useState({ src: null, url: null });

  useEffect(() => {
    if (!src) {
      setState({ src: null, url: null });
      return undefined;
    }
    let active = true;
    loadPrepared(src).then((url) => {
      if (active) setState({ src, url });
    });
    return () => {
      active = false;
    };
  }, [src]);

  return state.src === src ? state.url : null;
}
