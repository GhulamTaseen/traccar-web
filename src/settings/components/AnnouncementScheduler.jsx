import { useEffect } from 'react';
import { useManager } from '../../common/util/permissions';
import { flushInterval, flushScheduled, syncServerTime } from '../common/scheduledAnnouncements';

const AnnouncementScheduler = () => {
  const manager = useManager();

  useEffect(() => {
    if (!manager) {
      return undefined;
    }
    const flush = () => {
      flushScheduled();
    };
    syncServerTime().then(flush);
    const intervalId = setInterval(flush, flushInterval);
    window.addEventListener('online', flush);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', flush);
    };
  }, [manager]);

  return null;
};

export default AnnouncementScheduler;
