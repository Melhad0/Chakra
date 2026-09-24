/**
 * BreakInfinity.js - Lightweight Arbitrary Precision Decimal Engine
 * Engineered for Incremental & Idle Games.
 * Handles numbers up to 10^(9e15).
 */

export class Decimal {
    constructor(value) {
        this.mantissa = 0;
        this.exponent = 0;

        if (value === undefined || value === null) {
            this.mantissa = 0;
            this.exponent = 0;
        } else if (value instanceof Decimal) {
            this.mantissa = value.mantissa;
            this.exponent = value.exponent;
        } else if (typeof value === "number") {
            this.fromNumber(value);
        } else if (typeof value === "string") {
            this.fromString(value);
        } else {
            this.mantissa = 0;
            this.exponent = 0;
        }
    }

    static from(val) {
        if (val instanceof Decimal) return val;
        return new Decimal(val);
    }

    fromNumber(num) {
        if (isNaN(num)) {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }
        if (!isFinite(num)) {
            this.mantissa = num > 0 ? 1 : -1;
            this.exponent = 9e15;
            return;
        }
        if (num === 0) {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }

        const exp = Math.floor(Math.log10(Math.abs(num)));
        this.mantissa = num / Math.pow(10, exp);
        this.exponent = exp;
        this.normalize();
    }

    fromString(str) {
        str = str.trim().toLowerCase();
        if (str === "" || str === "nan") {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }
        if (str.includes("e")) {
            const parts = str.split("e");
            const m = parseFloat(parts[0]);
            const e = parseInt(parts[1], 10);
            if (isNaN(m) || isNaN(e)) {
                this.mantissa = 0;
                this.exponent = 0;
            } else {
                this.mantissa = m;
                this.exponent = e;
                this.normalize();
            }
        } else {
            const num = parseFloat(str);
            this.fromNumber(num);
        }
    }

    normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return;
        }
        while (Math.abs(this.mantissa) >= 10) {
            this.mantissa /= 10;
            this.exponent += 1;
        }
        while (Math.abs(this.mantissa) < 1 && this.mantissa !== 0) {
            this.mantissa *= 10;
            this.exponent -= 1;
        }
        if (this.exponent <= -300) {
            this.mantissa = 0;
            this.exponent = 0;
        }
    }

    isZero() {
        return this.mantissa === 0;
    }

    isPositive() {
        return this.mantissa > 0;
    }

    isNegative() {
        return this.mantissa < 0;
    }

    abs() {
        const d = new Decimal(this);
        d.mantissa = Math.abs(d.mantissa);
        return d;
    }

    neg() {
        const d = new Decimal(this);
        d.mantissa = -d.mantissa;
        return d;
    }

    cmp(other) {
        const o = Decimal.from(other);
        if (this.isZero() && o.isZero()) return 0;
        if (this.mantissa > 0 && o.mantissa <= 0) return 1;
        if (this.mantissa < 0 && o.mantissa >= 0) return -1;

        if (this.mantissa > 0 && o.mantissa > 0) {
            if (this.exponent > o.exponent) return 1;
            if (this.exponent < o.exponent) return -1;
            if (this.mantissa > o.mantissa) return 1;
            if (this.mantissa < o.mantissa) return -1;
            return 0;
        }

        // Both negative
        if (this.exponent > o.exponent) return -1;
        if (this.exponent < o.exponent) return 1;
        if (this.mantissa > o.mantissa) return -1;
        if (this.mantissa < o.mantissa) return 1;
        return 0;
    }

    eq(other) { return this.cmp(other) === 0; }
    neq(other) { return this.cmp(other) !== 0; }
    lt(other) { return this.cmp(other) < 0; }
    lte(other) { return this.cmp(other) <= 0; }
    gt(other) { return this.cmp(other) > 0; }
    gte(other) { return this.cmp(other) >= 0; }

    add(other) {
        const o = Decimal.from(other);
        if (this.isZero()) return new Decimal(o);
        if (o.isZero()) return new Decimal(this);

        const expDiff = this.exponent - o.exponent;
        if (expDiff > 16) return new Decimal(this);
        if (expDiff < -16) return new Decimal(o);

        const alignedM = this.mantissa + o.mantissa * Math.pow(10, -expDiff);
        const res = new Decimal();
        res.mantissa = alignedM;
        res.exponent = this.exponent;
        res.normalize();
        return res;
    }

    sub(other) {
        return this.add(Decimal.from(other).neg());
    }

    mul(other) {
        const o = Decimal.from(other);
        if (this.isZero() || o.isZero()) return new Decimal(0);

        const res = new Decimal();
        res.mantissa = this.mantissa * o.mantissa;
        res.exponent = this.exponent + o.exponent;
        res.normalize();
        return res;
    }

    div(other) {
        const o = Decimal.from(other);
        if (o.isZero()) return new Decimal(0);
        if (this.isZero()) return new Decimal(0);

        const res = new Decimal();
        res.mantissa = this.mantissa / o.mantissa;
        res.exponent = this.exponent - o.exponent;
        res.normalize();
        return res;
    }

    pow(power) {
        const p = typeof power === "number" ? power : Decimal.from(power).toNumber();
        if (p === 0) return new Decimal(1);
        if (this.isZero()) return new Decimal(0);

        const num = this.toNumber();
        if (Math.abs(num) < 1e10 && Math.abs(p) < 20) {
            return new Decimal(Math.pow(num, p));
        }

        const logVal = (this.exponent + Math.log10(this.mantissa)) * p;
        const newExp = Math.floor(logVal);
        const newM = Math.pow(10, logVal - newExp);
        const res = new Decimal();
        res.mantissa = newM;
        res.exponent = newExp;
        res.normalize();
        return res;
    }

    max(other) {
        return this.gte(other) ? this : Decimal.from(other);
    }

    min(other) {
        return this.lte(other) ? this : Decimal.from(other);
    }

    toNumber() {
        if (this.exponent > 308) return Infinity;
        if (this.exponent < -308) return 0;
        return this.mantissa * Math.pow(10, this.exponent);
    }

    toString() {
        if (this.isZero()) return "0";
        if (this.exponent >= -2 && this.exponent <= 5) {
            const val = this.toNumber();
            return val % 1 === 0 ? val.toString() : val.toFixed(2).replace(/\.?0+$/, "");
        }
        return `${this.mantissa.toFixed(4)}e${this.exponent >= 0 ? "+" : ""}${this.exponent}`;
    }

    toJSON() {
        return this.toString();
    }
}
