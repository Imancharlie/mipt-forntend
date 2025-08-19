export type DeviceInfo = {
  userAgent: string;
  language: string;
  platform: string;
  screen: { width: number; height: number; pixelRatio: number };
  timezone: string;
};

export function collectDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}


