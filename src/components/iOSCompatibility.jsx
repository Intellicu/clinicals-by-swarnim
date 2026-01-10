import { useEffect } from 'react';

/**
 * iOS Compatibility Component
 * Adds necessary viewport meta tags and handles iOS-specific behaviors
 */
export default function IOSCompatibility() {
  useEffect(() => {
    // Add viewport meta tag for proper mobile rendering
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
      document.head.appendChild(meta);
    } else {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover');
    }

    // Add Apple mobile web app meta tags
    const appleMobileWebAppCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebAppCapable) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }

    const appleMobileWebAppStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMobileWebAppStatusBarStyle) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'default';
      document.head.appendChild(meta);
    }

    // Fix iOS scrolling - remove body fixed positioning
    // Allow natural scrolling behavior
  }, []);

  return null; // This component doesn't render anything
}