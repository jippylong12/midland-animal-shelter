const INTERNAL_DOMAIN = 'jippylong12.xyz';
const LEGACY_LINK_CLICK_EVENT_NAME = 'link_click';
const NORMALIZED_LINK_CLICK_EVENT_NAME = 'portfolio_link_click';
const LEGACY_UI_INTERACTION_EVENT_NAME = 'ui_interaction';
const NORMALIZED_UI_INTERACTION_EVENT_NAME = 'portfolio_ui_interaction';

type TrackParamValue = string | number | boolean | null | undefined;
export type TrackEventParams = Record<string, TrackParamValue>;

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        __portfolioLinkTrackingInitialized__?: boolean;
        __portfolioSpaTrackingInitialized__?: boolean;
        __portfolioLastTrackedPagePath__?: string;
    }
}

const getPagePath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const toTrackPayload = (params: TrackEventParams): Record<string, string | number | boolean> => {
    const payload: Record<string, string | number | boolean> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            return;
        }

        payload[key] = value;
    });

    return payload;
};

const parseUrl = (href: string): URL | null => {
    const baseOrigin = typeof window === 'undefined' ? `https://${INTERNAL_DOMAIN}` : window.location.origin;

    try {
        return new URL(href, baseOrigin);
    } catch {
        return null;
    }
};

const getMetadataValue = (anchor: HTMLAnchorElement, attribute: string): string => {
    const owner = anchor.closest(`[${attribute}]`);
    return owner?.getAttribute(attribute)?.trim() ?? '';
};

const inferLinkKind = (
    resolvedUrl: URL | null,
    href: string,
    internalDomain: boolean
): string => {
    const protocol = resolvedUrl?.protocol ?? '';
    if (protocol === 'mailto:' || href.toLowerCase().startsWith('mailto:')) {
        return 'mailto';
    }
    if (protocol === 'tel:' || href.toLowerCase().startsWith('tel:')) {
        return 'tel';
    }
    if (href.startsWith('#')) {
        return 'anchor';
    }

    return internalDomain ? 'internal' : 'external';
};

const trackRoutePageView = () => {
    const pagePath = getPagePath();
    if (window.__portfolioLastTrackedPagePath__ === pagePath) {
        return;
    }

    window.__portfolioLastTrackedPagePath__ = pagePath;
    trackEvent('page_view', {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
    });
};

const handleDelegatedAnchorClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) {
        return;
    }

    const href = anchor.getAttribute('href');
    if (!href) {
        return;
    }

    const resolvedUrl = parseUrl(href);
    const destinationUrl = sanitizeDestinationUrl(href);
    const destinationHost = resolvedUrl?.protocol === 'mailto:'
        ? 'mailto'
        : resolvedUrl?.protocol === 'tel:'
            ? 'tel'
            : (resolvedUrl?.host ?? '');
    const isInternal = isInternalDomain(destinationHost);
    const section = getMetadataValue(anchor, 'data-ga-section') || 'unknown';
    const itemName = getMetadataValue(anchor, 'data-ga-item') || anchor.textContent?.trim() || 'unknown';
    const uiLabel = getMetadataValue(anchor, 'data-ga-label') || anchor.textContent?.trim() || itemName;
    const linkKind = getMetadataValue(anchor, 'data-ga-kind') || inferLinkKind(resolvedUrl, href, isInternal);

    const payload: TrackEventParams = {
        section,
        item_name: itemName,
        link_kind: linkKind,
        destination_url: destinationUrl,
        destination_host: destinationHost || 'unknown',
        is_internal_domain: isInternal,
        ui_label: uiLabel,
    };

    trackEvent(LEGACY_LINK_CLICK_EVENT_NAME, payload);
    trackEvent(NORMALIZED_LINK_CLICK_EVENT_NAME, payload);
};

export const trackEvent = (name: string, params: TrackEventParams = {}) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return;
    }

    window.gtag('event', name, toTrackPayload(params));
};

export const sanitizeDestinationUrl = (url: string): string => {
    if (!url) {
        return '';
    }

    const resolvedUrl = parseUrl(url);
    if (resolvedUrl?.protocol === 'mailto:' || url.toLowerCase().startsWith('mailto:')) {
        return resolvedUrl ? `mailto:${resolvedUrl.pathname}${resolvedUrl.search}` : url.split('#')[0];
    }
    if (resolvedUrl?.protocol === 'tel:' || url.toLowerCase().startsWith('tel:')) {
        return resolvedUrl ? `tel:${resolvedUrl.pathname}` : url.split('#')[0];
    }

    if (resolvedUrl) {
        if (resolvedUrl.protocol !== 'http:' && resolvedUrl.protocol !== 'https:') {
            return url.split('#')[0];
        }
        return `${resolvedUrl.origin}${resolvedUrl.pathname}`;
    }

    const [withoutHash] = url.split('#');
    const [withoutQuery] = withoutHash.split('?');
    return withoutQuery;
};

export const isInternalDomain = (host: string): boolean => {
    const normalized = host.trim().toLowerCase().replace(/\.$/, '');
    if (!normalized) {
        return false;
    }

    const hostWithoutPort = normalized.split(':')[0];
    return hostWithoutPort === INTERNAL_DOMAIN || hostWithoutPort.endsWith(`.${INTERNAL_DOMAIN}`);
};

export const trackPortfolioUiInteraction = (
    action: string,
    section: string,
    params: TrackEventParams = {}
) => {
    const payload: TrackEventParams = {
        action,
        section,
        ...params,
    };

    trackEvent(LEGACY_UI_INTERACTION_EVENT_NAME, payload);
    trackEvent(NORMALIZED_UI_INTERACTION_EVENT_NAME, payload);
};

export const initDelegatedLinkTracking = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    if (window.__portfolioLinkTrackingInitialized__) {
        return;
    }

    document.addEventListener('click', handleDelegatedAnchorClick);
    window.__portfolioLinkTrackingInitialized__ = true;
};

export const initSpaPageViewTracking = () => {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.__portfolioSpaTrackingInitialized__) {
        return;
    }

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = ((...args: Parameters<History['pushState']>) => {
        originalPushState(...args);
        trackRoutePageView();
    }) as History['pushState'];

    window.history.replaceState = ((...args: Parameters<History['replaceState']>) => {
        originalReplaceState(...args);
        trackRoutePageView();
    }) as History['replaceState'];

    window.addEventListener('popstate', trackRoutePageView);
    window.addEventListener('hashchange', trackRoutePageView);

    window.__portfolioLastTrackedPagePath__ = getPagePath();
    window.__portfolioSpaTrackingInitialized__ = true;
};
