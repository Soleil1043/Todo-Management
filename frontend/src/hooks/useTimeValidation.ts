import { useCallback, useState } from 'react';
import { isValidTimeFormat } from '../services/api';

export const useTimeValidation = () => {
  const [error, setError] = useState<string | null>(null);

  const validateTime = useCallback((startTime: string, endTime: string): boolean => {
    if (startTime && !isValidTimeFormat(startTime)) {
      setError('开始时间格式不正确，请使用 HH:MM 格式');
      return false;
    }

    if (endTime && !isValidTimeFormat(endTime)) {
      setError('结束时间格式不正确，请使用 HH:MM 格式');
      return false;
    }

    // 验证开始时间是否在结束时间之前
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;

      if (startTotal >= endTotal) {
        setError('开始时间必须早于结束时间');
        return false;
      }
    }

    setError(null);
    return true;
  }, []);

  return {
    error,
    setError,
    validateTime,
  };
};
