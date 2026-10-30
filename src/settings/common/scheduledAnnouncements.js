import fetchOrThrow from '../../common/util/fetchOrThrow';

export const storageKey = 'scheduledAnnouncements';
export const updateEvent = 'scheduledAnnouncementsUpdated';
export const flushInterval = 30000;

const lockName = 'scheduledAnnouncementsFlush';
const retryBaseDelay = 60000;
const retryMaxDelay = 15 * 60000;

let serverOffset = 0;
let flushing = false;

export const setServerOffset = (value) => {
  serverOffset = value;
};

export const currentTime = () => Date.now() + serverOffset;

const createId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(updateEvent));
  }
};

export const readScheduled = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(parsed)) {
      return [];
    }
    let migrated = false;
    const items = parsed.map((item) => {
      if (!item.id) {
        migrated = true;
        return { ...item, id: createId() };
      }
      return item;
    });
    if (migrated) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
    return items;
  } catch (error) {
    console.warn('Unable to read scheduled announcements', error);
    return [];
  }
};

export const writeScheduled = (items) => {
  localStorage.setItem(storageKey, JSON.stringify(items));
  notifyUpdate();
};

export const addScheduled = ({ users, notificator, message, sendAt }) => {
  writeScheduled([
    ...readScheduled(),
    {
      id: createId(),
      users,
      notificator,
      message,
      sendAt: new Date(sendAt).toISOString(),
      createdAt: new Date().toISOString(),
      attempts: 0,
    },
  ]);
};

export const removeScheduled = (id) => {
  writeScheduled(readScheduled().filter((item) => item.id !== id));
};

export const sendAtTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

export const isPastTime = (value) => {
  const time = sendAtTime(value);
  return time === null || time <= currentTime();
};

export const sendAnnouncement = ({ users, notificator, message }) => {
  const query = new URLSearchParams();
  users.forEach((userId) => query.append('userId', userId));
  return fetchOrThrow(`/api/notifications/send/${notificator}?${query.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

const retryDelay = (attempts) =>
  Math.min(retryBaseDelay * 2 ** Math.max(attempts - 1, 0), retryMaxDelay);

const isDue = (item, now) => {
  const time = sendAtTime(item.sendAt);
  if (time === null || time > now) {
    return false;
  }
  const attempts = item.attempts || 0;
  if (attempts > 0 && item.lastAttemptAt) {
    const lastAttempt = sendAtTime(item.lastAttemptAt);
    if (lastAttempt !== null && now < lastAttempt + retryDelay(attempts)) {
      return false;
    }
  }
  return true;
};

const recordFailure = (id, error) => {
  const items = readScheduled();
  if (!items.some((item) => item.id === id)) {
    return;
  }
  writeScheduled(
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            attempts: (item.attempts || 0) + 1,
            lastAttemptAt: new Date().toISOString(),
            lastError: String(error?.message || error).slice(0, 300),
          }
        : item,
    ),
  );
  console.warn(`Scheduled announcement ${id} failed to send`, error);
};

const flushDue = async () => {
  const now = currentTime();
  const due = readScheduled().filter((item) => isDue(item, now));
  let sent = 0;
  let failed = 0;
  for (const item of due) {
    try {
      await sendAnnouncement(item);
      removeScheduled(item.id);
      sent += 1;
    } catch (error) {
      recordFailure(item.id, error);
      failed += 1;
    }
  }
  return { sent, failed };
};

const withLock = (callback) => {
  if (navigator.locks?.request) {
    return navigator.locks.request(lockName, { ifAvailable: true }, async (lock) => {
      if (!lock) {
        return { skipped: true, sent: 0, failed: 0 };
      }
      return callback();
    });
  }
  return callback();
};

export const flushScheduled = async () => {
  if (flushing) {
    return { skipped: true, sent: 0, failed: 0 };
  }
  flushing = true;
  try {
    return await withLock(flushDue);
  } catch (error) {
    console.warn('Unable to process scheduled announcements', error);
    return { sent: 0, failed: 0 };
  } finally {
    flushing = false;
  }
};

export const syncServerTime = async () => {
  try {
    const response = await fetch('/api/server');
    const value = response.headers.get('date');
    const server = value ? new Date(value).getTime() : NaN;
    if (Number.isFinite(server)) {
      serverOffset = server - Date.now();
    }
  } catch (error) {
    console.warn('Unable to read server time, using device clock', error);
  }
};
