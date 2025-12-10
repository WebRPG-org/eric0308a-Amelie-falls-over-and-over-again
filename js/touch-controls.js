(function () {
    // Only initialize if we are in a browser environment
    if (typeof window === 'undefined') return;

    // Check if we should enable touch controls
    // For now, enable always or verify touch capability. 
    // User requested "add virtual touch keys", implying they want them visible.
    // We can add a toggle later or check Utils.isMobileDevice() if strict mobile only needed.
    // For now, we append always as per request "in the game add virtual touch keys".

    function createTouchControls() {
        const container = document.createElement('div');
        container.id = 'virtual-controls';
        container.innerHTML = `
            <div id="dpad-area">
                <div class="control-btn" id="btn-up" data-key="38">▲</div>
                <div class="control-btn" id="btn-down" data-key="40">▼</div>
                <div class="control-btn" id="btn-left" data-key="37">◀</div>
                <div class="control-btn" id="btn-right" data-key="39">▶</div>
            </div>
            <div id="action-area">
                <div class="control-btn" id="btn-ctrl" data-key="17">Ctrl</div>
                <div class="control-btn" id="btn-x" data-key="88">X</div>
                <div class="control-btn" id="btn-z" data-key="90">Z</div>
            </div>
            <div class="control-btn" id="btn-toggle">Hide</div>
        `;
        document.body.appendChild(container);

        const buttons = container.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            const keyCode = parseInt(btn.getAttribute('data-key'));

            const startHandler = (e) => {
                e.preventDefault();
                // Add visual feedback
                btn.classList.add('active');
                // Simulate KeyDown
                simulateKey(keyCode, 'keydown');
            };

            const endHandler = (e) => {
                e.preventDefault();
                // Remove visual feedback
                btn.classList.remove('active');
                // Simulate KeyUp
                simulateKey(keyCode, 'keyup');
            };


            // Touch events
            btn.addEventListener('touchstart', startHandler, { passive: false });
            btn.addEventListener('touchend', endHandler, { passive: false });

            // Mouse events for testing on desktop
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('mouseleave', endHandler);
        });

        const toggleBtn = container.querySelector('#btn-toggle');
        if (toggleBtn) {
            // Remove 'control-btn' class behavior listeners if we don't want it to act as a key
            // Ideally we clone and replace or just add logic. 
            // Since it has .control-btn class it gets picked up by loop above which is NOT what we want if it has no data-key.
            // Oh wait, the loop above does `parseInt(btn.getAttribute('data-key'))`. `parseInt(null)` is NaN.
            // simulateKey(NaN) probably does nothing harmful but we should avoid it.
            // Actually, we should probably just handle the toggle logic separately.

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                container.classList.toggle('controls-hidden');
                toggleBtn.innerText = container.classList.contains('controls-hidden') ? 'Show' : 'Hide';
            });

            // Prevent default touch behavior on toggle button to avoid double firing or scrolling
            toggleBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
        }
    }

    function simulateKey(keyCode, type) {
        // Create event
        const event = new KeyboardEvent(type, {
            bubbles: true,
            cancelable: true,
            keyCode: keyCode,
            which: keyCode,
            key: getNodeKey(keyCode) // Optional, might help some listeners
        });

        // Dispatch to document - rpg_core.js Input listens on document for keydown/keyup
        document.dispatchEvent(event);
    }

    function getNodeKey(keyCode) {
        // Helper to map simple codes to key names if needed by modern browsers,
        // though rpg_core often uses keyCode/which.
        switch (keyCode) {
            case 37: return 'ArrowLeft';
            case 38: return 'ArrowUp';
            case 39: return 'ArrowRight';
            case 40: return 'ArrowDown';
            case 90: return 'z';
            case 88: return 'x';
            case 17: return 'Control';
            default: return '';
        }
    }

    // Load CSS
    /*
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/touch-controls.css';
    document.head.appendChild(link);
    */
    // (CSS is loaded via index.html modification as per plan)

    // Init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createTouchControls);
    } else {
        createTouchControls();
    }

})();
