(function () {
    const DESIGN_MARGIN = 20; // breathing room so the widget doesn't touch the window edges
    const baselineDPR = window.devicePixelRatio || 1;

    function applyScale() {
        let container = document.getElementById("container_one");
        if (!container) {
            return;
        }
        let naturalWidth = container.offsetWidth;
        let naturalHeight = container.offsetHeight;
        if (!naturalWidth || !naturalHeight) {
            return;
        }
        let zoomFactor = (window.devicePixelRatio || 1) / baselineDPR;
        let availableWidth = window.innerWidth * zoomFactor - DESIGN_MARGIN * 2;
        let availableHeight = window.innerHeight * zoomFactor - DESIGN_MARGIN * 2;
        let scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
        if (!isFinite(scale) || scale <= 0) {
            scale = 1;
        }
        container.style.transform = `scale(${scale})`;
    }

    function init() {
        let container = document.getElementById("container_one");
        if (!container) {
            return;
        }
        container.style.transformOrigin = "center center";
        applyScale();
        window.addEventListener("resize", applyScale);
        // Content height changes dynamically (page switches, dual-connect rows
        // showing/hiding, etc.) - watch for that instead of hooking every call site.
        if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(applyScale).observe(container);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
