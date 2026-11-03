class PrimeGapRenderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.padding = {
            top: 35,
            right: 35,
            bottom: 55,
            left: 65
        };

        this.backgroundColor = "#fbf7ec";
        this.axisColor = "#9a886c";
        this.gridColor = "#e4dccb";
        this.lineColor = "#244d61";
        this.textColor = "#685c4c";
    }


    render(primes) {

        if (!primes || primes.length < 2) {
            this.clear();
            return;
        }

        this.resizeCanvas();

        const gaps = this.calculateGaps(primes);

        this.clear();

        const plotWidth =
            this.displayWidth -
            this.padding.left -
            this.padding.right;

        const plotHeight =
            this.displayHeight -
            this.padding.top -
            this.padding.bottom;

        const maxGap = Math.max(...gaps.map(item => item.gap));

        this.drawGrid(
            plotWidth,
            plotHeight,
            maxGap
        );

        this.drawAxes(
            plotWidth,
            plotHeight
        );

        this.drawGapGraph(
            gaps,
            plotWidth,
            plotHeight,
            maxGap
        );

        this.drawLabels(
            primes,
            plotWidth,
            plotHeight,
            maxGap
        );
    }


    calculateGaps(primes) {

        const gaps = [];

        for (let i = 1; i < primes.length; i++) {

            gaps.push({
                prime: primes[i],
                previousPrime: primes[i - 1],
                gap: primes[i] - primes[i - 1]
            });
        }

        return gaps;
    }


    resizeCanvas() {

        const rect = this.canvas.getBoundingClientRect();

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width =
            Math.floor(rect.width * dpr);

        this.canvas.height =
            Math.floor(rect.height * dpr);

        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        /*
         * After applying the transform, drawing coordinates
         * should use CSS pixel dimensions.
         */

        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }


    clear() {

        const width =
            this.displayWidth ||
            this.canvas.clientWidth;

        const height =
            this.displayHeight ||
            this.canvas.clientHeight;

        this.ctx.save();

        this.ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );

        this.ctx.fillStyle =
            this.backgroundColor;

        this.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.ctx.restore();
    }


    drawGrid(
        plotWidth,
        plotHeight,
        maxGap
    ) {

        const ctx = this.ctx;

        const left = this.padding.left;
        const top = this.padding.top;

        const horizontalLines = 6;
        const verticalLines = 10;

        ctx.save();

        ctx.strokeStyle =
            this.gridColor;

        ctx.lineWidth = 1;


        /*
         * Horizontal grid lines
         */

        for (
            let i = 0;
            i <= horizontalLines;
            i++
        ) {

            const y =
                top +
                (
                    plotHeight *
                    i /
                    horizontalLines
                );

            ctx.beginPath();

            ctx.moveTo(
                left,
                y
            );

            ctx.lineTo(
                left + plotWidth,
                y
            );

            ctx.stroke();
        }


        /*
         * Vertical grid lines
         */

        for (
            let i = 0;
            i <= verticalLines;
            i++
        ) {

            const x =
                left +
                (
                    plotWidth *
                    i /
                    verticalLines
                );

            ctx.beginPath();

            ctx.moveTo(
                x,
                top
            );

            ctx.lineTo(
                x,
                top + plotHeight
            );

            ctx.stroke();
        }

        ctx.restore();
    }


    drawAxes(
        plotWidth,
        plotHeight
    ) {

        const ctx = this.ctx;

        const left = this.padding.left;
        const top = this.padding.top;

        ctx.save();

        ctx.strokeStyle =
            this.axisColor;

        ctx.lineWidth = 1;


        /*
         * Y axis
         */

        ctx.beginPath();

        ctx.moveTo(
            left,
            top
        );

        ctx.lineTo(
            left,
            top + plotHeight
        );

        ctx.stroke();


        /*
         * X axis
         */

        ctx.beginPath();

        ctx.moveTo(
            left,
            top + plotHeight
        );

        ctx.lineTo(
            left + plotWidth,
            top + plotHeight
        );

        ctx.stroke();

        ctx.restore();
    }


    drawGapGraph(
        gaps,
        plotWidth,
        plotHeight,
        maxGap
    ) {

        const ctx = this.ctx;

        const left = this.padding.left;
        const top = this.padding.top;

        const denominator =
            Math.max(1, gaps.length - 1);

        const verticalMax =
            Math.max(1, maxGap);

        ctx.save();

        ctx.strokeStyle =
            this.lineColor;

        ctx.lineWidth = 1.5;

        ctx.lineJoin = "round";

        ctx.beginPath();


        for (
            let i = 0;
            i < gaps.length;
            i++
        ) {

            const x =
                left +
                (
                    i /
                    denominator
                ) *
                plotWidth;

            const y =
                top +
                plotHeight -
                (
                    gaps[i].gap /
                    verticalMax
                ) *
                plotHeight;

            if (i === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }

        ctx.stroke();

        ctx.restore();


        /*
         * Draw individual points only when there are
         * few enough primes for them to remain visible.
         */

        if (gaps.length <= 2000) {

            this.drawPoints(
                gaps,
                plotWidth,
                plotHeight,
                verticalMax
            );
        }
    }


    drawPoints(
        gaps,
        plotWidth,
        plotHeight,
        maxGap
    ) {

        const ctx = this.ctx;

        const left = this.padding.left;
        const top = this.padding.top;

        const denominator =
            Math.max(1, gaps.length - 1);

        ctx.save();

        ctx.fillStyle =
            this.lineColor;


        for (
            let i = 0;
            i < gaps.length;
            i++
        ) {

            const x =
                left +
                (
                    i /
                    denominator
                ) *
                plotWidth;

            const y =
                top +
                plotHeight -
                (
                    gaps[i].gap /
                    maxGap
                ) *
                plotHeight;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }


    drawLabels(
        primes,
        plotWidth,
        plotHeight,
        maxGap
    ) {

        const ctx = this.ctx;

        const left = this.padding.left;
        const top = this.padding.top;

        ctx.save();

        ctx.fillStyle =
            this.textColor;

        ctx.font =
            '11px "Courier New", monospace';


        /*
         * Y axis labels
         */

        ctx.textAlign = "right";

        ctx.textBaseline = "middle";

        const ySteps = 6;

        for (
            let i = 0;
            i <= ySteps;
            i++
        ) {

            const value =
                Math.round(
                    maxGap *
                    (
                        1 -
                        i / ySteps
                    )
                );

            const y =
                top +
                plotHeight *
                i /
                ySteps;

            ctx.fillText(
                value.toString(),
                left - 10,
                y
            );
        }


        /*
         * X axis labels
         */

        ctx.textAlign = "center";

        ctx.textBaseline = "top";

        const xSteps = 5;

        const firstPrime =
            primes[0];

        const lastPrime =
            primes[primes.length - 1];

        for (
            let i = 0;
            i <= xSteps;
            i++
        ) {

            const ratio =
                i / xSteps;

            const x =
                left +
                plotWidth *
                ratio;

            const value =
                Math.round(
                    firstPrime +
                    (
                        lastPrime -
                        firstPrime
                    ) *
                    ratio
                );

            ctx.fillText(
                value.toLocaleString(),
                x,
                top + plotHeight + 12
            );
        }


        /*
         * Axis titles
         */

        ctx.fillStyle = "#685c4c";

        ctx.textAlign = "center";

        ctx.fillText(
            "Prime Number",
            left + plotWidth / 2,
            top + plotHeight + 35
        );


        ctx.save();

        ctx.translate(
            18,
            top + plotHeight / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "Gap",
            0,
            0
        );

        ctx.restore();

        ctx.restore();
    }
}