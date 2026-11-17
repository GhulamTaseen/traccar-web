import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import gcoord from 'gcoord';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import usePersistedState from '../common/util/usePersistedState';
import useVehicleImage from '../common/util/useVehicleImage';
import { mapIcons, mapIconKey } from './core/preloadImages';
import useMapStyles from './core/useMapStyles';
import { mapThemeStyles, themedMapStyle } from './core/mapTheme';

const useStyles = makeStyles()((theme) => ({
  root: {
    ...mapThemeStyles(theme),
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
    borderRadius: 12,
    border: `1px solid ${theme.palette.surface.outline}`,
    backgroundColor: theme.palette.surface.sunken || theme.palette.background.default,
    '& .maplibregl-ctrl-attrib': {
      fontSize: 10,
      lineHeight: '18px',
      color: theme.palette.text.secondary,
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      '& a': { color: 'inherit' },
    },
    '& .maplibregl-ctrl-attrib-button': {
      filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
    },
  },
  canvas: { width: '100%', height: '100%' },
  halo: {
    width: 64,
    height: 64,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.geometry.main}`,
    backgroundColor: alpha(theme.palette.surface.raised || theme.palette.background.paper, 0.95),
    boxShadow: `0 0 0 5px ${alpha(theme.palette.geometry.main, 0.18)}, 0 8px 24px ${alpha(
      theme.palette.common.black,
      theme.palette.mode === 'dark' ? 0.5 : 0.22,
    )}`,
    pointerEvents: 'none',
  },
  imageHalo: {
    width: 104,
    height: 104,
    overflow: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? '#f1f5f9' : '#ffffff',
  },
  categoryIcon: {
    display: 'block',
    width: 46,
    height: 46,
    objectFit: 'contain',
    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
  },
  vehicleImage: {
    display: 'block',
    width: '88%',
    height: '88%',
    objectFit: 'contain',
    borderRadius: '50%',
  },
  noData: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
    fontSize: 12,
    pointerEvents: 'none',
  },
  error: {
    padding: theme.spacing(0.5, 1.25),
    borderRadius: 8,
    border: `1px solid ${theme.palette.surface.outline}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
}));

const VehicleMiniMap = ({ device, position }) => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const t = useTranslation();
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [markerElement, setMarkerElement] = useState(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [failedImage, setFailedImage] = useState(null);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference(
    'activeMapStyles',
    'locationIqStreets,locationIqDark,openFreeMap',
  );
  const preferredStyle = usePreference('map', 'locationIqStreets');
  const [persistedStyle] = usePersistedState('selectedMapStyle', preferredStyle);
  const styles = useMemo(() => {
    const filtered = mapStyles.filter((s) => s.available && activeMapStyles.includes(s.id));
    return filtered.length ? filtered : mapStyles.filter((s) => s.id === 'osm');
  }, [mapStyles, activeMapStyles]);
  const { style, filter } = themedMapStyle(styles, persistedStyle, theme.palette.mode === 'dark');

  const latitude = position?.latitude;
  const longitude = position?.longitude;
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const coordinates = useMemo(() => {
    if (!hasCoordinates) return null;
    const point = [longitude, latitude];
    return style.coordinateSystem === 'gcj02'
      ? gcoord.transform(point, gcoord.WGS84, gcoord.GCJ02)
      : point;
  }, [hasCoordinates, latitude, longitude, style.coordinateSystem]);
  const deviceImage = device?.attributes?.deviceImage;
  const originalImageUrl =
    deviceImage && device?.uniqueId
      ? `/api/media/${encodeURIComponent(device.uniqueId)}/${encodeURIComponent(deviceImage)}`
      : null;
  const uploadedImage = Boolean(originalImageUrl);
  const preparedImageUrl = useVehicleImage(originalImageUrl);
  const imageUrl = uploadedImage
    ? preparedImageUrl || originalImageUrl
    : mapIcons[mapIconKey(device?.category)];
  const imageFailed = uploadedImage && failedImage === originalImageUrl;
  const regionLabel = `${device?.name ? `${device.name} — ` : ''}${t('sharedLocation')}`;

  // Keep a single independent instance while valid coordinates are present.
  useEffect(() => {
    if (!hasCoordinates) {
      setMarkerElement(null);
      setMapFailed(false);
      return undefined;
    }
    return () => {
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [hasCoordinates]);

  useEffect(() => {
    if (!hasCoordinates) return;
    let instance = instanceRef.current;
    try {
      if (!instance) {
        const miniMap = new maplibregl.Map({
          container: containerRef.current,
          style: style.style,
          transformRequest: style.transformRequest,
          center: coordinates,
          zoom: 15,
          attributionControl: false,
          scrollZoom: false,
          locale: {
            'NavigationControl.ZoomIn': t('dashboardZoomIn'),
            'NavigationControl.ZoomOut': t('dashboardZoomOut'),
          },
        });
        let marker;
        let observer;
        let disposed = false;
        let loadedTile = false;
        const handleError = () => {
          if (!disposed && !loadedTile) setMapFailed(true);
        };
        const handleSourceData = (event) => {
          // loaded()/areTilesLoaded() also accept errored tiles. Require real tile data.
          if (event.tile?.state === 'loaded') loadedTile = true;
        };
        const handleReady = () => {
          if (!disposed && loadedTile && miniMap.loaded() && miniMap.areTilesLoaded()) {
            setMapFailed(false);
          }
        };
        instance = {
          map: miniMap,
          style,
          resetLoading: () => {
            loadedTile = false;
          },
          dispose: () => {
            disposed = true;
            observer?.disconnect();
            miniMap.off('error', handleError);
            miniMap.off('sourcedata', handleSourceData);
            miniMap.off('load', handleReady);
            miniMap.off('idle', handleReady);
            marker?.remove();
            miniMap.remove();
          },
        };
        instanceRef.current = instance;
        miniMap.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          'bottom-right',
        );
        miniMap.on('error', handleError);
        miniMap.on('sourcedata', handleSourceData);
        miniMap.on('load', handleReady);
        miniMap.on('idle', handleReady);
        const element = document.createElement('div');
        marker = new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat(coordinates)
          .addTo(miniMap);
        instance.marker = marker;
        setMarkerElement(element);
        observer = new ResizeObserver(() => {
          if (!disposed) miniMap.resize();
        });
        observer.observe(containerRef.current);
        miniMap.resize();
      } else {
        if (instance.style !== style) {
          instance.resetLoading();
          // Apply the request transform before setStyle starts fetching resources.
          instance.map.setTransformRequest(style.transformRequest || null);
          instance.map.setStyle(style.style, { diff: false });
          instance.style = style;
        }
        instance.marker.setLngLat(coordinates);
        instance.map.easeTo({ center: coordinates, duration: 500 });
      }
    } catch {
      setMapFailed(true);
      instanceRef.current?.dispose();
      instanceRef.current = null;
      setMarkerElement(null);
    }
  }, [hasCoordinates, coordinates, style, t]);

  useEffect(() => {
    if (instanceRef.current) instanceRef.current.map.getCanvas().style.filter = filter;
  }, [filter, markerElement]);

  return (
    <div className={classes.root} role="region" aria-label={regionLabel}>
      {hasCoordinates && <div className={classes.canvas} ref={containerRef} />}
      {hasCoordinates &&
        markerElement &&
        createPortal(
          <div
            className={cx(classes.halo, uploadedImage && classes.imageHalo)}
            style={{ visibility: mapFailed || imageFailed ? 'hidden' : 'visible' }}
          >
            <img
              key={imageUrl}
              className={uploadedImage ? classes.vehicleImage : classes.categoryIcon}
              src={imageUrl}
              alt={device?.name || t('sharedLocation')}
              onError={() => setFailedImage(originalImageUrl || imageUrl)}
              onLoad={() =>
                setFailedImage((failed) =>
                  failed === (originalImageUrl || imageUrl) ? null : failed,
                )
              }
            />
          </div>,
          markerElement,
        )}
      {(!hasCoordinates || mapFailed || imageFailed) && (
        <div className={classes.noData} role="status">
          <span className={hasCoordinates ? classes.error : undefined}>{t('sharedNoData')}</span>
        </div>
      )}
    </div>
  );
};

export default VehicleMiniMap;
