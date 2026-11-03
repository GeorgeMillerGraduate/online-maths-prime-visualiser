class PrimeSieve {

    constructor(limit = 10000) {

        this.limit = limit;

        this.isPrime = [];

        this.primes = [];
    }


    /*
     * Generate all prime numbers from 2 up to the
     * current limit using the Sieve of Eratosthenes.
     */
    generate(limit = this.limit) {

        this.limit = Math.max(
            2,
            Math.floor(limit)
        );

        /*
         * Start by assuming every number is prime.
         */
        this.isPrime =
            new Uint8Array(this.limit + 1);

        this.isPrime.fill(1);


        /*
         * 0 and 1 are not prime.
         */
        this.isPrime[0] = 0;
        this.isPrime[1] = 0;


        /*
         * We only need to test possible factors
         * up to the square root of the limit.
         */
        for (
            let number = 2;
            number * number <= this.limit;
            number++
        ) {

            /*
             * If this number has already been marked
             * composite, it cannot eliminate anything new.
             */
            if (!this.isPrime[number]) {
                continue;
            }


            /*
             * Begin at number².
             *
             * Smaller multiples have already been removed
             * by smaller prime factors.
             */
            for (
                let multiple = number * number;
                multiple <= this.limit;
                multiple += number
            ) {

                this.isPrime[multiple] = 0;
            }
        }


        /*
         * Build an array containing the actual primes.
         */
        this.primes = [];

        for (
            let number = 2;
            number <= this.limit;
            number++
        ) {

            if (this.isPrime[number]) {

                this.primes.push(number);
            }
        }


        return this.primes;
    }


    /*
     * Check whether a particular number is prime.
     */
    check(number) {

        number = Math.floor(number);

        if (
            number < 0 ||
            number > this.limit
        ) {

            return false;
        }

        return this.isPrime[number] === 1;
    }


    /*
     * Return all generated primes.
     */
    getPrimes() {

        return this.primes;
    }


    /*
     * Return the number of primes found.
     */
    getPrimeCount() {

        return this.primes.length;
    }


    /*
     * Return the largest generated prime.
     */
    getLargestPrime() {

        if (this.primes.length === 0) {
            return null;
        }

        return this.primes[
            this.primes.length - 1
        ];
    }


    /*
     * Calculate the gaps between consecutive primes.
     *
     * Example:
     *
     * primes:
     * 2, 3, 5, 7, 11
     *
     * gaps:
     * 1, 2, 2, 4
     */
    getPrimeGaps() {

        const gaps = [];

        for (
            let i = 1;
            i < this.primes.length;
            i++
        ) {

            gaps.push({
                previousPrime:
                    this.primes[i - 1],

                prime:
                    this.primes[i],

                gap:
                    this.primes[i] -
                    this.primes[i - 1]
            });
        }

        return gaps;
    }


    /*
     * Return the largest gap discovered between
     * consecutive primes.
     */
    getLargestGap() {

        if (this.primes.length < 2) {
            return null;
        }

        let largestGap = 0;

        let previousPrime = null;

        let prime = null;


        for (
            let i = 1;
            i < this.primes.length;
            i++
        ) {

            const gap =
                this.primes[i] -
                this.primes[i - 1];


            if (gap > largestGap) {

                largestGap = gap;

                previousPrime =
                    this.primes[i - 1];

                prime =
                    this.primes[i];
            }
        }


        return {
            gap: largestGap,
            previousPrime: previousPrime,
            prime: prime
        };
    }


    /*
     * Return the proportion of integers up to the
     * limit that are prime.
     */
    getPrimeDensity() {

        if (this.limit < 2) {
            return 0;
        }

        return (
            this.primes.length /
            this.limit
        );
    }


    /* Return pairs such as (3, 5), (5, 7), (11, 13). */
    getTwinPrimePairs() {

        const pairs = [];

        for (let i = 1; i < this.primes.length; i++) {

            if (this.primes[i] - this.primes[i - 1] === 2) {

                pairs.push({
                    first: this.primes[i - 1],
                    second: this.primes[i]
                });
            }
        }

        return pairs;
    }


    /*
     * Clear the generated data.
     */
    reset() {

        this.isPrime = [];

        this.primes = [];
    }
}
