import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import dimensions from '../../common/theme/dimensions';
import { map, useMapReady } from '../core/MapView';
import { useAttributePreference } from '../../common/util/preferences';
import { toMapCoordinates } from '../core/mapUtil';

const MapSelectedDevice = () => {
  const currentTime = useSelector((state) => state.devices.selectTime);
  const currentId = useSelector((state) => state.devices.selectedId);
  const previousRef = useRef({});
  const mapReady = useMapReady();

  const selectZoom = useAttributePreference('web.selectZoom', 10);
  const mapFollow = useAttributePreference('mapFollow', false);

  const position = useSelector((state) => state.session.positions[currentId]);

  useEffect(() => {
    if (!mapReady) return;
    const previousPosition = previousRef.current.position;
    const positionChanged =
      position &&
      (!previousPosition ||
        position.latitude !== previousPosition.latitude ||
        position.longitude !== previousPosition.longitude);

    if (
      (currentId !== previousRef.current.id ||
        currentTime !== previousRef.current.time ||
        (mapFollow && positionChanged)) &&
      position
    ) {
      map.easeTo({
        center: toMapCoordinates(position.longitude, position.latitude),
        zoom: Math.max(map.getZoom(), selectZoom),
        offset: [0, -dimensions.popupMapOffset / 2],
      });
    }
    previousRef.current = { id: currentId, time: currentTime, position };
  }, [mapReady, currentId, currentTime, mapFollow, position, selectZoom]);

  return null;
};

export default MapSelectedDevice;
