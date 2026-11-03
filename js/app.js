$(document).ready(function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const canvas =
        document.getElementById("primeCanvas");

    const canvasMessage =
        document.getElementById("canvasMessage");

    const numberLimit =
        document.getElementById("numberLimit");

    const numberLimitValue =
        document.getElementById("numberLimitValue");

    const cellSize =
        document.getElementById("cellSize");

    const cellSizeValue =
        document.getElementById("cellSizeValue");

    const visualisationTitle =
        document.getElementById("visualisationTitle");

    const limitStat =
        document.getElementById("limitStat");

    const primeCount =
        document.getElementById("primeCount");

    const largestPrime =
        document.getElementById("largestPrime");

    const densityStat =
        document.getElementById("densityStat");

    const twinStat =
        document.getElementById("twinStat");

    const gapStat =
        document.getElementById("gapStat");

    const highlightTwins =
        document.getElementById("highlightTwins");


    /* =====================================================
       CLASSES
       ===================================================== */

    const sieve =
        new PrimeSieve();

    const ulamSpiral =
        new UlamSpiral(canvas);

    const primeGapRenderer =
        new PrimeGapRenderer(canvas);


    /* =====================================================
       STATE
       ===================================================== */

    let currentMode = "ulam";

    let hasGenerated = false;


    /* =====================================================
       MODE NAMES
       ===================================================== */

    const modeNames = {

        ulam:
            "Ulam Spiral",

        distribution:
            "Prime Distribution",

        gaps:
            "Prime Gaps"
    };


    /* =====================================================
       SLIDERS
       ===================================================== */

    $("#numberLimit").on(
        "input",
        function () {

            const value =
                Number(this.value);

            numberLimitValue.textContent =
                value.toLocaleString();

            document.getElementById("viewStatus").textContent = "Press Generate to apply the new limit";
        }
    );


    $("#cellSize").on(
        "input",
        function () {

            cellSizeValue.textContent =
                this.value + " px";


            /*
             * Cell size only affects the Ulam spiral,
             * so it can be redrawn immediately.
             */
            if (
                hasGenerated &&
                currentMode === "ulam"
            ) {

                renderCurrentMode();
            }
        }
    );


    $("#highlightTwins").on(
        "change",
        function () {

            if (
                hasGenerated &&
                currentMode === "ulam"
            ) {

                renderCurrentMode();
            }
        }
    );


    /* =====================================================
       MODE SELECTION
       ===================================================== */

    $(".mode-button, .mode-card").on(
        "click",
        function () {

            const mode =
                $(this).data("mode");


            if (!mode) {
                return;
            }


            setMode(mode);


            if (hasGenerated) {

                renderCurrentMode();
            }
        }
    );


    function setMode(mode) {

        stopZoom();
        currentMode = mode;
        const isSpiral = mode === "ulam";
        document.querySelectorAll("#playZoom,#pauseZoom,#resetView,#zoomSpeed,#loopZoom,#zoomIn,#zoomOut,#fitView,#cellSize,#highlightTwins").forEach(el => el.disabled = !isSpiral);
        document.getElementById("pauseZoom").disabled = true;
        document.querySelector(".animation-controls").setAttribute("aria-disabled", String(!isSpiral));
        document.querySelectorAll(".mode-button").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.mode === mode)));
        document.getElementById("modeDescription").textContent = {
            ulam: "Integers spiral outwards from 1. Dots mark primes; the outlined centre marks 1, which is not prime.",
            distribution: "Each bar counts the primes in an equal interval of integers. The range shown is the generated limit.",
            gaps: "Each point shows the difference between consecutive primes, arranged in prime order."
        }[mode];
        document.querySelector(".legend").hidden = !isSpiral;
        document.getElementById("viewStatus").textContent = isSpiral ? "Ready to explore" : "Static graph view";


        /*
         * Keep both sets of mode controls
         * synchronised.
         */

        $(".mode-button")
            .removeClass("active");

        $(".mode-card")
            .removeClass("active");


        $(
            '.mode-button[data-mode="' +
            mode +
            '"]'
        ).addClass("active");


        $(
            '.mode-card[data-mode="' +
            mode +
            '"]'
        ).addClass("active");


        visualisationTitle.textContent =
            modeNames[mode] ||
            "Prime Visualisation";
    }


    /* =====================================================
       GENERATE
       ===================================================== */

    $("#generateButton, #generateAgainButton").on(
        "click",
        function () {

            generate();
        }
    );


    function generate() {
        stopZoom();

        const limit =
            Number(numberLimit.value);


        /*
         * Generate all primes up to the
         * selected number.
         */

        sieve.generate(limit);


        hasGenerated = true;


        updateStatistics();


        hideCanvasMessage();


        renderCurrentMode();
        document.getElementById("viewStatus").textContent = "Generated " + sieve.limit.toLocaleString() + " integers";
    }


    /* =====================================================
       RENDER CURRENT MODE
       ===================================================== */

    function renderCurrentMode() {

        if (!hasGenerated) {
            return;
        }


        const limit =
            sieve.limit;


        switch (currentMode) {


            /* ---------------------------------------------
               ULAM SPIRAL
               --------------------------------------------- */

            case "ulam":

                ulamSpiral.render(
                    sieve.isPrime,
                    limit,
                    Number(cellSize.value),
                    highlightTwins.checked
                );

                break;


            /* ---------------------------------------------
               PRIME DISTRIBUTION
               --------------------------------------------- */

            case "distribution":

                renderDistribution(
                    sieve.getPrimes(),
                    limit
                );

                break;


            /* ---------------------------------------------
               PRIME GAPS
               --------------------------------------------- */

            case "gaps":

                primeGapRenderer.render(
                    sieve.getPrimes()
                );

                break;
        }
    }


    /* =====================================================
       PRIME DISTRIBUTION
       ===================================================== */

    function renderDistribution(
        primes,
        limit
    ) {

        resizeCanvas();


        const ctx =
            canvas.getContext("2d");


        const width =
            canvas.clientWidth;

        const height =
            canvas.clientHeight;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        ctx.fillStyle =
            "#fbf7ec";


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
         * Margins for the graph.
         */

        const padding = {

            top: 40,

            right: 40,

            bottom: 55,

            left: 65
        };


        const graphWidth =
            width -
            padding.left -
            padding.right;


        const graphHeight =
            height -
            padding.top -
            padding.bottom;


        /*
         * Divide the complete number range
         * into buckets.
         */

        const bucketCount =
            Math.min(
                100,
                Math.max(
                    20,
                    Math.floor(
                        graphWidth / 8
                    )
                )
            );


        const buckets =
            new Array(
                bucketCount
            ).fill(0);


        /*
         * Count how many primes fall
         * inside each bucket.
         */

        for (
            let i = 0;
            i < primes.length;
            i++
        ) {

            const prime =
                primes[i];


            let bucket =
                Math.floor(
                    (
                        prime /
                        limit
                    ) *
                    bucketCount
                );


            if (
                bucket >=
                bucketCount
            ) {

                bucket =
                    bucketCount - 1;
            }


            buckets[bucket]++;
        }


        const maximum =
            Math.max(
                1,
                ...buckets
            );


        /* =================================================
           GRID
           ================================================= */

        ctx.strokeStyle =
            "#e4dccb";

        ctx.lineWidth = 1;


        const horizontalLines = 6;


        for (
            let i = 0;
            i <= horizontalLines;
            i++
        ) {

            const y =
                padding.top +
                (
                    graphHeight *
                    i /
                    horizontalLines
                );


            ctx.beginPath();

            ctx.moveTo(
                padding.left,
                y
            );

            ctx.lineTo(
                padding.left +
                graphWidth,
                y
            );

            ctx.stroke();
        }


        /* =================================================
           BARS
           ================================================= */

        const barWidth =
            graphWidth /
            bucketCount;


        for (
            let i = 0;
            i < bucketCount;
            i++
        ) {

            const value =
                buckets[i];


            const barHeight =
                (
                    value /
                    maximum
                ) *
                graphHeight;


            const x =
                padding.left +
                i *
                barWidth;


            const y =
                padding.top +
                graphHeight -
                barHeight;


            ctx.fillStyle =
                "#244d61";


            ctx.fillRect(
                x + 1,
                y,
                Math.max(
                    1,
                    barWidth - 2
                ),
                barHeight
            );
        }


        /* =================================================
           AXES
           ================================================= */

        ctx.strokeStyle =
            "#9a886c";


        ctx.beginPath();


        ctx.moveTo(
            padding.left,
            padding.top
        );


        ctx.lineTo(
            padding.left,
            padding.top +
            graphHeight
        );


        ctx.lineTo(
            padding.left +
            graphWidth,
            padding.top +
            graphHeight
        );


        ctx.stroke();


        /* =================================================
           LABELS
           ================================================= */

        ctx.fillStyle =
            "#685c4c";


        ctx.font =
            '11px "Courier New", monospace';


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "top";


        const xSteps = 5;


        for (
            let i = 0;
            i <= xSteps;
            i++
        ) {

            const ratio =
                i /
                xSteps;


            const x =
                padding.left +
                graphWidth *
                ratio;


            const value =
                Math.round(
                    limit *
                    ratio
                );


            ctx.fillText(
                value.toLocaleString(),
                x,
                padding.top +
                graphHeight +
                12
            );
        }


        ctx.fillStyle =
            "#685c4c";


        ctx.fillText(
            "Number",
            padding.left +
            graphWidth / 2,
            padding.top +
            graphHeight +
            35
        );


        /*
         * Y axis values.
         */

        ctx.textAlign =
            "right";


        ctx.textBaseline =
            "middle";


        for (
            let i = 0;
            i <= horizontalLines;
            i++
        ) {

            const ratio =
                1 -
                i /
                horizontalLines;


            const value =
                Math.round(
                    maximum *
                    ratio
                );


            const y =
                padding.top +
                graphHeight *
                i /
                horizontalLines;


            ctx.fillText(
                value.toString(),
                padding.left - 10,
                y
            );
        }


        /*
         * Y axis title.
         */

        ctx.save();


        ctx.translate(
            18,
            padding.top +
            graphHeight / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#685c4c";


        ctx.fillText(
            "Primes per interval",
            0,
            0
        );


        ctx.restore();
    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function updateStatistics() {

        const limit =
            sieve.limit;


        limitStat.textContent =
            limit.toLocaleString();


        primeCount.textContent =
            sieve
                .getPrimeCount()
                .toLocaleString();


        const largest =
            sieve.getLargestPrime();


        largestPrime.textContent =
            largest !== null
                ? largest.toLocaleString()
                : "—";

        densityStat.textContent =
            (sieve.getPrimeDensity() * 100).toFixed(2) + "%";

        twinStat.textContent =
            sieve.getTwinPrimePairs().length.toLocaleString();

        const largestGap = sieve.getLargestGap();

        gapStat.textContent =
            largestGap !== null
                ? largestGap.gap.toLocaleString()
                : "—";
    }


    /* =====================================================
       CLEAR
       ===================================================== */

    $("#clearButton").on(
        "click",
        function () {

            stopZoom();
            clearCanvas();

            sieve.reset();

            hasGenerated = false;


            primeCount.textContent =
                "0";


            largestPrime.textContent =
                "—";

            densityStat.textContent = "—";
            twinStat.textContent = "—";
            gapStat.textContent = "—";


            showCanvasMessage(
                "Generate a visualisation to begin."
            );
        }
    );


    function clearCanvas() {

        const ctx =
            canvas.getContext("2d");


        /*
         * Reset transform so the complete physical
         * canvas is cleared even on high-DPI screens.
         */

        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.fillStyle =
            "#fbf7ec";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.restore();
    }


    /* =====================================================
       SAVE PNG
       ===================================================== */

    $("#downloadButton").on(
        "click",
        function () {

            if (!hasGenerated) {

                showCanvasMessage(
                    "Generate a visualisation before saving."
                );

                return;
            }


            const link =
                document.createElement("a");


            const modeName =
                currentMode
                    .replace(
                        /[^a-z0-9]/gi,
                        "-"
                    )
                    .toLowerCase();


            link.download =
                "prime-" +
                modeName +
                "-" +
                sieve.limit +
                ".png";


            link.href =
                canvas.toDataURL(
                    "image/png"
                );


            link.click();
        }
    );


    /* =====================================================
       CANVAS MESSAGE
       ===================================================== */

    function hideCanvasMessage() {

        canvasMessage.style.display =
            "none";
    }


    function showCanvasMessage(
        message
    ) {

        canvasMessage.textContent =
            message;


        canvasMessage.style.display =
            "block";
    }


    /* =====================================================
       CANVAS RESIZING
       ===================================================== */

    function resizeCanvas() {

        const rect =
            canvas
                .getBoundingClientRect();


        const dpr =
            window.devicePixelRatio ||
            1;


        canvas.width =
            Math.floor(
                rect.width *
                dpr
            );


        canvas.height =
            Math.floor(
                rect.height *
                dpr
            );


        const ctx =
            canvas.getContext("2d");


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    /*
     * Redraw the visualisation when the browser
     * changes size.
     *
     * A small delay prevents dozens of expensive
     * redraws while the window is actively resizing.
     */

    let resizeTimer = null;


    $(window).on(
        "resize",
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        if (
                            hasGenerated
                        ) {

                            renderCurrentMode();
                        }

                    },
                    120
                );
        }
    );


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    let zoomFrame = null;
    let zoomRunning = false;
    let zoomLast = 0;
    const maximumAnimatedLimit = 10000000;
    let animationStartLimit = 10000;
    function growSpiral() {
        if (sieve.limit >= maximumAnimatedLimit) return false;
        const oldSide = (Math.ceil(Math.sqrt(sieve.limit)) | 1) + 2;
        const nextLimit = Math.min(maximumAnimatedLimit, sieve.limit * 4);
        sieve.generate(nextLimit);
        numberLimit.value = nextLimit;
        numberLimitValue.textContent = nextLimit.toLocaleString();
        updateStatistics();
        const newSide = (Math.ceil(Math.sqrt(nextLimit)) | 1) + 2;
        // Keep existing dots in the same positions as the larger field loads.
        ulamSpiral.zoom *= newSide / oldSide;
        ulamSpiral.render(sieve.isPrime, nextLimit, 4, highlightTwins.checked);
        document.getElementById("viewStatus").textContent = "Exploring up to " + nextLimit.toLocaleString();
        return true;
    }
    function updateZoomLabel() {
        document.getElementById("zoomValue").textContent = "Zoom " + (ulamSpiral.zoom * (Number(cellSize.value)/4)).toFixed(1).replace(/\.0$/, "") + "×";
    }
    function stopZoom() {
        zoomRunning = false;
        if (zoomFrame !== null) cancelAnimationFrame(zoomFrame);
        zoomFrame = null;
        document.getElementById("playZoom").textContent = "▶ Play zoom-out";
        document.getElementById("pauseZoom").disabled = true;
    }
    function animateZoom(time) {
        if (!zoomRunning) return;
        const elapsed = Math.min(100, time - zoomLast); zoomLast = time;
        const duration = 24000 / Number(document.getElementById("zoomSpeed").value);
        ulamSpiral.zoom = Math.max(1, ulamSpiral.zoom * Math.exp(-Math.log(8)*elapsed/duration));
        ulamSpiral.drawZoom(); updateZoomLabel();
        if (ulamSpiral.zoom <= 1.001) {
            ulamSpiral.zoom = 1; ulamSpiral.drawZoom(); updateZoomLabel();
            if (growSpiral()) {
                zoomLast = performance.now();
            } else if (document.getElementById("loopZoom").checked) {
                sieve.generate(animationStartLimit);
                numberLimit.value = animationStartLimit;
                numberLimitValue.textContent = animationStartLimit.toLocaleString();
                updateStatistics();
                ulamSpiral.zoom = 8;
                ulamSpiral.render(sieve.isPrime, sieve.limit, 4, highlightTwins.checked);
                zoomLast = performance.now();
            } else {
                stopZoom();
                document.getElementById("viewStatus").textContent="Reached 10,000,000 integers";
                return;
            }
        }
        zoomFrame = requestAnimationFrame(animateZoom);
    }
    $("#playZoom").on("click", function(){
        if (currentMode !== "ulam" || zoomRunning) return;
        if (!hasGenerated) generate();
        cellSize.value=4;cellSizeValue.textContent="4 px";ulamSpiral.cellScale=1;
        if (ulamSpiral.zoom <= 1.001) {
            animationStartLimit = sieve.limit;
            ulamSpiral.zoom = 8;
        }
        zoomRunning = true;zoomLast = performance.now();
        this.textContent = "Zooming out…";
        document.getElementById("pauseZoom").disabled = false;
        document.getElementById("viewStatus").textContent="Animation running";
        zoomFrame=requestAnimationFrame(animateZoom);
    });
    $("#pauseZoom").on("click",function(){stopZoom();document.getElementById("viewStatus").textContent="Animation paused";});
    $("#zoomIn,#zoomOut,#fitView,#resetView").on("click",function(){
        stopZoom(); if (!hasGenerated) generate();
        if (this.id === "zoomIn") ulamSpiral.zoom=Math.min(24,ulamSpiral.zoom*1.5);
        else if (this.id === "zoomOut") {
            if (ulamSpiral.zoom <= 1.001) growSpiral();
            ulamSpiral.zoom=Math.max(1,ulamSpiral.zoom/1.5);
        }
        else {ulamSpiral.zoom=1;cellSize.value=4;cellSizeValue.textContent="4 px";ulamSpiral.cellScale=1;}
        ulamSpiral.drawZoom();updateZoomLabel();document.getElementById("viewStatus").textContent="Ready to explore";
    });
    $("#zoomSpeed").on("input",function(){document.getElementById("speedValue").textContent=["Slow","Gentle","Normal","Quick","Fast"][Number(this.value)-1];});
    document.addEventListener("visibilitychange",function(){if(document.hidden && zoomRunning){stopZoom();document.getElementById("viewStatus").textContent="Animation paused";}});
    $("#cellSize").on("input",updateZoomLabel);
    setMode(
        "ulam"
    );


    numberLimitValue.textContent =
        Number(
            numberLimit.value
        ).toLocaleString();


    limitStat.textContent =
        Number(
            numberLimit.value
        ).toLocaleString();


    cellSizeValue.textContent = cellSize.value + " px";
    generate();
});
