export const deviceSearchText = (device) =>
  [
    device.name,
    device.uniqueId,
    device.phone,
    device.model,
    device.contact,
    device.id,
    device.attributes?.nickname,
  ]
    .filter((value) => value != null)
    .join(' ')
    .toLocaleLowerCase();

export const positionMotion = (position) => {
  if (!position) return null;
  const motion = position.attributes?.motion;
  if (typeof motion === 'boolean') return motion;
  if (position.speed != null && Number.isFinite(Number(position.speed))) {
    return Number(position.speed) > 0;
  }
  return null;
};

export const canImmobilize = (device, position, now = Date.now()) => {
  const age = now - Date.parse(position?.fixTime);
  return (
    device?.status === 'online' &&
    !device.disabled &&
    position?.valid === true &&
    Number.isFinite(position.speed) &&
    position.speed === 0 &&
    positionMotion(position) === false &&
    age >= 0 &&
    age <= 120000
  );
};

export const fleetStatistics = (devices, positions) => {
  const counts = { online: 0, idle: 0, unknown: 0, offline: 0 };
  Object.values(devices).forEach((device) => {
    if (Object.hasOwn(counts, device.status) && device.status !== 'idle') {
      counts[device.status] += 1;
    }
    if (device.status === 'online' && positionMotion(positions[device.id]) === false) {
      counts.idle += 1;
    }
  });
  return counts;
};
