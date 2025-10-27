import { updateUserActivity } from "./updateUserActivity.js";
import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup } from './alert_popup.js';

document.addEventListener('DOMContentLoaded', function () {
    if(document.getElementById('limit')) {
        initLimitCalculator();
        loadCalculatorHistory('limit');
    }
    if(document.getElementById('derivative')) {
        initDerivativeCalculator();
        loadCalculatorHistory('derivative');
    }
    if(document.getElementById('integral')) {
        initIntegralCalculator();
        loadCalculatorHistory("integral");
    }
});

function isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

function parseInput(input) {
    const result = math.simplify(input
        .toLowerCase()
        .replace(/π/g, ' pi ')
        .replace(/∞|infinity/g, 'Infinity')
        .replace(/log/g, 'log10')
        .replace(/ln/g, 'log')
        .replace(/\|([^|]+)\|/g, 'abs($1)')
        .trim()).toString();
    return result;
}

function parseOutput(output) {
    return ((math.simplify(output))
        .toString())
        .replace(/pi/g, 'π')
        .replace(/\blog\b/g, 'ln')
        .replace(/\blog10\b/g, 'log')
        .replace(/abs\(([^)]+)\)/g, '|$1|')
        // .replace(/\s*\*\s*/g, " ");
}

function formatNumber(num) {
    if(Math.abs(num) < 1e-4) return "0";
    if(!isFinite(num) || math.abs(num) > 999999999) return num > 0 ? "∞" : "-∞";
    const tolerance = 1e-4;

    const piApproximation = Math.PI;

    const piFactor180 = num / piApproximation * 180;
    const piRoundedFactor180 = Math.round(piFactor180);
    const piRoundedFactor = piRoundedFactor180 / 180;
    const piRoundedFactorLiteral = Math.round(piRoundedFactor);
    const piRoundedFactorFraction = math.fraction(piRoundedFactor);

    if(Math.abs(piFactor180 - piRoundedFactor180) < tolerance) {
        if(piRoundedFactor ===  1) return  "π";
        if(piRoundedFactor === -1) return "-π";
        if(piRoundedFactor === piRoundedFactorLiteral) return `${piRoundedFactor}π`;
        if(piRoundedFactorFraction.n === 1) return `π/${piRoundedFactorFraction.d}`;
        return `${piRoundedFactorFraction.n}π/${piRoundedFactorFraction.d}`;
    }

    const eApproximation = math.e;
    const eFactor = num / eApproximation;
    const eRoundedFactor = Math.round(eFactor);
    if(Math.abs(eFactor - eRoundedFactor) < tolerance) {
        if(eRoundedFactor ==  1) return  "e";
        if(eRoundedFactor == -1) return "-e";
        return `${eRoundedFactor}e`;
    }

    const powerOfApproximations = [piApproximation, eApproximation]
    const power12 = Math.pow(num, 12);
    for(let powerOfApproximation of powerOfApproximations) {
        const exponentApproximation = Math.log(Math.abs(power12)) / Math.log(powerOfApproximation);
        const exponentRounded = Math.round(exponentApproximation);
        const exponentRoundedPer12 = exponentRounded / 12;
        const exponentApproximationVal = Math.pow(powerOfApproximation, exponentRoundedPer12);
        if(exponentRoundedPer12 && Math.abs(exponentApproximationVal - Math.abs(num)) < tolerance) {
            return `${num > 0 ? "" : "-"}${exponentRoundedPer12 == .5 ? "√" : ""}${powerOfApproximation == piApproximation ? "π" : "e"}${exponentRoundedPer12 != .5 ? `^${exponentRoundedPer12 == Math.round(exponentRoundedPer12) ? exponentRoundedPer12 : `(${formatNumber(exponentRoundedPer12)})`}` : ""}`;
        }
    }

    const logEApproximation = math.log10(eApproximation);
    const logEFactor = num / logEApproximation;
    const logERoundedFactor = Math.round(logEFactor);
    if(Math.abs(logEFactor - logERoundedFactor) < tolerance) {
        if(logERoundedFactor ==  1) return  "log(e)";
        if(logERoundedFactor == -1) return "-log(e)";
        return `${logERoundedFactor}log(e)`;
    }
    
    if(Math.abs(num - Math.round(num)) < tolerance) return Math.round(num).toString();
    
    const fraction = math.fraction(num);
    if(fraction.d !== 1 && (fraction.d < 10**4 || fraction.n < 10**4)) {
        return `${fraction.n}/${fraction.d}`;
    }
    return num.toFixed(5).replace(/\.?0+$/, "").replace(/pi/g, "π");
}

function initCanvas(canvas, placeholder) {
    if(canvas.chart) {
        canvas.chart.destroy();
    }
    placeholder.style.display = 'flex';
}

function generatePoints(func, start, end, numPoints = 1000) {
    let xStartValid = start;
    let xEndValid = end;
    if(!isFiniteNumber(start) && !isFiniteNumber(end)) {
        xStartValid = -5;
        xEndValid =  5;
    }
    else if(!isFiniteNumber(start)) {
        xStartValid = xMax - 10;
    }
    else if(!isFiniteNumber(end)) {
        xEndValid = start + 10;
    }

    const points = [];
    const parser = math.parse(func);
    const f = parser.compile();
    const step = (xEndValid - xStartValid) / (numPoints - 1);
    for(let i = 0; i < numPoints; i++) {
        const x = xStartValid + i * step;
        try {
            const y = f.evaluate({x: x});
            if(isFinite(y)) {
                points.push({ x, y });
            }
        } catch(error) {
            console.error("Error evaluating function:", error);
        }
    }
    return points;
}

function drawGraph(canvas, datasets, xMin, xMax, yMin, yMax, limitPoint = null, placeholder) {
    placeholder.style.display = 'none';

    let xMinValid = xMin;
    let xMaxValid = xMax;
    if(!isFiniteNumber(xMin) && !isFiniteNumber(xMax)) {
        xMinValid = -5;
        xMaxValid =  5;
    }
    else if(!isFiniteNumber(xMin)) {
        xMinValid = xMax - 10;
    }
    else if(!isFiniteNumber(xMax)) {
        xMaxValid = xMin + 10;
    }

    let yMinValid = yMin;
    let yMaxValid = yMax;
    if(!isFiniteNumber(yMin) && !isFiniteNumber(yMax)) {
        yMinValid = -5;
        yMaxValid =  5;
    }
    else if(!isFiniteNumber(yMin)) {
        yMinValid = yMax - 10;
    }
    else if(!isFiniteNumber(yMax)) {
        yMaxValid = yMin + 10;
    }

    const range = Math.abs(yMaxValid - yMinValid);
    if(range > 50) {
        if(yMinValid < -25 && yMaxValid > 25) {
            yMinValid = -5;
            yMaxValid =  5;
        }
        else if(yMinValid < -25) {
            yMinValid = yMaxValid - 10;
        }
        else {
            yMaxValid = yMinValid + 10;
        }
    }
    else if(range > 5) {
        yMinValid = Math.ceil(yMinValid);
        yMaxValid = Math.floor(yMaxValid);
    }

    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'scatter',
        data: { 
            datasets: datasets.map(dataset => ({
                ...dataset,
                showLine: true,
                pointRadius: 0
            }))
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    type: 'linear', 
                    position: 'bottom',
                    min: xMinValid,
                    max: xMaxValid,
                    title: {
                        display: true,
                        text: 'x'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return formatNumber(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawOnChartArea: true
                    }
                },
                y: {
                    min: yMinValid,
                    max: yMaxValid,
                    title: {
                        display: true,
                        text: 'y'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return formatNumber(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawOnChartArea: true
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if(label) {
                                label += ': ';
                            }
                            if(context.parsed.y !== null) {
                                label += `(${formatNumber(context.parsed.x)}, ${formatNumber(context.parsed.y)})`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    if(limitPoint && isFiniteNumber(limitPoint.x) && isFiniteNumber(limitPoint.y)) {
        canvas.chart.options.plugins.annotation = {
            annotations: {
                point1: {
                    type: 'point',
                    xValue: limitPoint.x,
                    yValue: limitPoint.y,
                    backgroundColor: 'red',
                    radius: 8,
                    borderColor: 'white',
                    borderWidth: 2
                }
            }
        }
        canvas.chart.update();
    }
}

function drawLimitGraph(func, x, limit) {
    const limitColour = getComputedStyle(document.querySelector('.limit-title')).color;
    const limitGraph = document.getElementById('limit-graph');
    const limitGraphPlaceholder = document.getElementById('limit-graph-placeholder');

    initCanvas(limitGraph, limitGraphPlaceholder);

    const points = generatePoints(func, x-5, x+5);
    const yValues = points.map(p => p.y);
    let yMin = Math.min(...yValues);
    let yMax = Math.max(...yValues);
    if(yMax - yMin < 1e-10) {
        yMin -= 1;
        yMax += 1;
    }
    
    drawGraph(limitGraph, [{
        label: 'Function',
        data: points,
        borderColor: limitColour,
        fill: false
    }], x - 5, x + 5, yMin, yMax, {x: x, y: limit}, limitGraphPlaceholder);
}

function drawDerivativeGraph(func, derivativeFunc) {
    const derivativeColour = getComputedStyle(document.querySelector('.derivative-title')).color;
    
    const derivativeGraphOriginal = document.getElementById('derivative-graph-original');
    const derivativeGraphDerived  = document.getElementById('derivative-graph-derived');

    const derivativeGraphOriginalPlaceholder = document.getElementById('derivative-graph-original-placeholder');
    const derivativeGraphDerivedPlaceholder  = document.getElementById('derivative-graph-derived-placeholder');
    
    initCanvas(derivativeGraphOriginal, derivativeGraphOriginalPlaceholder);
    initCanvas(derivativeGraphDerived,  derivativeGraphDerivedPlaceholder);

    const points = generatePoints(func, -5, 5);
    const derivativePoints = generatePoints(derivativeFunc, -5, 5);
    
    const yValuesOriginal = points.map(p => p.y).filter(y => isFinite(y));
    let yMinOriginal = Math.min(...yValuesOriginal);
    let yMaxOriginal = Math.max(...yValuesOriginal);
    if(yMaxOriginal - yMinOriginal < 1e-10 ) {
        yMinOriginal -= 1;
        yMaxOriginal += 1;
    }
    
    const yValuesDerivative = derivativePoints.map(p => p.y).filter(y => isFinite(y));
    let yMinDerivative = Math.min(...yValuesDerivative);
    let yMaxDerivative = Math.max(...yValuesDerivative);

    console.log(yMinDerivative, yMaxDerivative);

    if(yMaxDerivative - yMinDerivative < 1e-10) {
        yMinDerivative -= 1;
        yMaxDerivative += 1;
    }

    drawGraph(derivativeGraphOriginal, [{
        label: 'Original Function',
        data: points,
        borderColor: derivativeColour,
        fill: false
    }], -5, 5, yMinOriginal, yMaxOriginal, null, derivativeGraphOriginalPlaceholder);

    drawGraph(derivativeGraphDerived, [{
        label: 'Derivative Function',
        data: derivativePoints,
        borderColor: 'red',
        fill: false
    }], -5, 5, yMinDerivative, yMaxDerivative, null, derivativeGraphDerivedPlaceholder);
}

function drawIntegralGraph(func, lower, upper, result) {
    let lowerGraph = lower;
    let upperGraph = upper;
    
    lowerGraph = lower !== undefined ? lower : -4;
    upperGraph = upper !== undefined ? upper : 4;

    const integralGraph   = document.getElementById('integral-graph');
    const integratedGraph = document.getElementById('integrated-graph');

    const integralGraphPlaceholder   = document.getElementById('integral-graph-placeholder');
    const integratedGraphPlaceholder = document.getElementById('integrated-graph-placeholder');
    
    const integralColour = getComputedStyle(document.querySelector('.integral-title')).color;
    const integralBackgroundColour = (getComputedStyle(document.querySelector('.topic-integral-background')).backgroundColor).replace('rgb', 'rgba').replace(')', ', .5)');

    initCanvas(integralGraph, integralGraphPlaceholder);
    initCanvas(integratedGraph, integratedGraphPlaceholder);
    
    const points = generatePoints(func, lowerGraph - 1, upperGraph + 1);
    const yValues = points.map(p => p.y).filter(y => isFinite(y));
    let yMin = Math.min(...yValues, 0);
    let yMax = Math.max(...yValues);
    if(yMax - yMin < 1e-10) {
        yMin -= 1;
        yMax += 1;
    }

    if(lower !== undefined && upper !== undefined) {
        drawGraph(integralGraph, [
            {
                label: 'Function',
                data: points,
                borderColor: integralColour,
                fill: false
            },
            {
                label: 'Integral Area',
                data: points.filter(p => p.x >= lowerGraph && p.x <= upperGraph),
                borderColor: integralColour,
                backgroundColor: integralBackgroundColour,
                fill: true
            }
        ], lowerGraph - 1, upperGraph + 1, yMin, yMax, null, integralGraphPlaceholder);
    }
    else {
        drawGraph(integralGraph, [{
            label: 'Function',
            data: points,
            borderColor: integralColour,
            fill: false
        }], lowerGraph - 1, upperGraph + 1, yMin, yMax, null, integralGraphPlaceholder);  
    }

    const pointsIntegrated = generatePoints(result, lowerGraph - 1, upperGraph + 1);
    const yValuesIntegrated = pointsIntegrated.map(p => p.y).filter(y => isFinite(y));
    let yMinIntegrated = Math.min(...yValuesIntegrated, 0);
    let yMaxIntegrated = Math.max(...yValuesIntegrated);
    if(yMaxIntegrated - yMinIntegrated < 1e-10) {
        yMinIntegrated -= 1;
        yMaxIntegrated += 1;
    }

    drawGraph(integratedGraph, [{
        label: 'Integrated Function',
        data: pointsIntegrated,
        borderColor: 'red',
        fill: false
    }], lowerGraph - 1, upperGraph + 1, yMinIntegrated, yMaxIntegrated, null, integratedGraphPlaceholder);
}

function calculateLimit(func, x) {
    const h = 1e-10;
    const parser = math.parse(func);
    const f = parser.compile();
    
    const leftLimit = f.evaluate({x: x - h});
    const rightLimit = f.evaluate({x: x + h});

    let result;
    let detail;

    if(isNaN(leftLimit) && isNaN(rightLimit) || leftLimit.im && rightLimit.im) {
        result = "Undefined";
        detail = {
            info: "Undefined"
        }
    }
    else if(leftLimit.im || rightLimit.im || isNaN(leftLimit) || isNaN(rightLimit)) {
        result = formatNumber(f.evaluate({x: x}));
        detail = {
            limit: f.evaluate({x: x})
        }
    }
    else if(!isFinite(leftLimit) && !isFinite(rightLimit)) {
        if(leftLimit * rightLimit < 0) {
            result = "Left: -∞, Right: ∞, Limit does not exist";
            detail = {
                limitLeft: -Infinity,
                limitRight: Infinity,
                info: "Does not exist"
            }
        } else if(leftLimit < 0) {
            result = "-∞";
            detail = {
                limit: -Infinity
            }
        } else {
            result = "∞";
            detail = {
                limit: Infinity
            }
        }
    } else if(!isFinite(leftLimit)) {
        result = "Left: " + (leftLimit < 0 ? "-∞" : "∞") + ", Right: " + formatNumber(rightLimit) + ", Limit does not exist";
        detail = {
            limitLeft: (leftLimit < 0 ? -Infinity : Infinity),
            limitRight: rightLimit,
            info: "Does not exist"
        }
    } else if(!isFinite(rightLimit)) {
        result = "Left: " + formatNumber(leftLimit) + ", Right: " + (rightLimit < 0 ? "-∞" : "∞") + ", Limit does not exist";
        detail = {
            limitLeft: leftLimit,
            limitRight: (rightLimit < 0 ? -Infinity : Infinity),
            info: "Does not exist"
        }
    } else if(Math.abs(leftLimit - rightLimit) < 1e-6) {
        result = formatNumber(leftLimit);
        detail = {
            limit: leftLimit
        }
    } else {
        result = `Left: ${formatNumber(leftLimit)}, Right: ${formatNumber(rightLimit)}, Limit does not exist`;
        detail = {
            limitLeft: leftLimit,
            limitRight: rightLimit,
            info: "Does not exist"
        }
    }
    return Object.assign(() => result, detail);
}

function calculateIntegral(func, lower, upper) {
    const n = 1000000;
    let sum = 0;

    const dx = (upper - lower) / n;
    const parser = math.parse(func);
    const f = parser.compile();

    for(let i = 0; i < n; i++) {
        const x1 = lower + i * dx;
        const x2 = x1 + dx;
        const y1 = f.evaluate({x: x1});
        const y2 = f.evaluate({x: x2});
        sum += (y1 + y2) * dx / 2;
    }

    if(!isFinite(lower) || !isFinite(upper) || math.abs(sum) > 999999999) {
        const fint = (math.simplify(Algebrite.integral(func).toString())).toString();
        
        const fintUpper = calculateLimit(fint, upper - 1e-4);
        const fintLower = calculateLimit(fint, lower + 1e-4);

        console.log(fintUpper.limit, fintUpper.limitLeft);
        console.log(fintLower.limit, fintUpper.limitRight);

        if(fintUpper.info == "Undefined" || fintLower.info == "Undefined") {
            return "Undefined";
        }
        else if(isFinite(fintUpper.limit) && isFinite(fintLower.limit)) {
            sum = fintUpper.limit - fintLower.limit;
        }
        else {
            return "Divergent"
        }
    }

    return formatNumber(sum);
}

function initLimitCalculator() {
    const limitFunction = document.getElementById('limit-function');
    const limitX = document.getElementById('limit-x');
    const calculateLimitBtn = document.getElementById('calculate-limit');
    const limitResult = document.getElementById('limit-result');
    
    calculateLimitBtn.addEventListener('click', () => {
        const funcRaw = limitFunction.value.trim();
        const xRaw = limitX.value.trim(); 

        if(!funcRaw && !xRaw) {
            limitResult.textContent = 'Error: Function and x approaches cannot be empty.';
            return;
        }
        if(!funcRaw) {
            limitResult.textContent = 'Error: Function cannot be empty.';
            return;
        }
        if(!xRaw) {
            limitResult.textContent = 'Error: x approaches cannot be empty.';
            return;
        }

        try {
            const x = math.evaluate(parseInput(xRaw));
            const xParsed = formatNumber(x);

            const func = parseInput(funcRaw);
            const funcParsed = parseOutput(func);

            const resultRaw = calculateLimit(func, x);
            const result = resultRaw();

            limitResult.textContent = `Limit ${funcParsed} as x approaches ${xParsed}: ${result}`;

            drawLimitGraph(func, x, resultRaw.limit);

            updateCalculatorHistory("limit", {
                func: funcParsed,
                xApproaches: xParsed,
                result: result,
                limit: formatNumber(resultRaw.limit) || null,
                timeStamp: new Date().toISOString()
            });

            setTimeout(() => loadCalculatorHistory('limit'), 500);
        } catch(error) {
            console.error(error);
            limitResult.textContent = 'Error: ' + error.message;
        }
    });
}

function initDerivativeCalculator() {
    const derivativeFunction = document.getElementById('derivative-function');
    const calculateDerivativeBtn = document.getElementById('calculate-derivative');
    const derivativeResult = document.getElementById('derivative-result');

    calculateDerivativeBtn.addEventListener('click', () => {
        const funcRaw = derivativeFunction.value.trim();
        if(funcRaw) {
            try {
                const func = parseInput(funcRaw);
                const funcParsed = parseOutput(func);

                const derivativeFunc = math.derivative(func, 'x', { simplify: false }).toString();
                const result = parseOutput(derivativeFunc);

                derivativeResult.textContent = `Derivative ${funcParsed}: ${result}`;

                drawDerivativeGraph(func, derivativeFunc);

                updateCalculatorHistory("derivative", {
                    func: funcParsed,
                    result,
                    timeStamp: new Date().toISOString()
                });

                setTimeout(() => loadCalculatorHistory('derivative'), 500);
            } catch(error) {
                derivativeResult.textContent = 'Error: ' + error.message;
            }
        }
        else {
            derivativeResult.textContent = 'Error: Function cannot be empty.';
        }
    });
}

function initIntegralCalculator() {
    const integralFunction = document.getElementById('integral-function');
    const integralLower = document.getElementById('integral-lower');
    const integralUpper = document.getElementById('integral-upper');
    const calculateIntegralBtn = document.getElementById('calculate-integral');
    const integralResultFunction = document.getElementById('integral-result-function');
    const integralResult = document.getElementById('integral-result');

    calculateIntegralBtn.addEventListener('click', () => {
        integralResult.textContent = '‎';
        
        const funcRaw = integralFunction.value.trim();
        const lowerRaw = integralLower.value.trim();
        const upperRaw = integralUpper.value.trim();

        console.log(typeof lowerRaw, typeof upperRaw);
        
        if(!funcRaw && !lowerRaw && !upperRaw) {
            integralResultFunction.textContent = 'Error: Function, lower bound, and upper bound cannot be empty.';
            return;
        }
        else if(!funcRaw && !lowerRaw) {
            integralResultFunction.textContent = 'Error: Function and lower bound cannot be empty.';
            return;
        }
        else if(!funcRaw && !upperRaw) {
            integralResultFunction.textContent = 'Error: Function and upper bound cannot be empty.';
            return;
        }
        else if(!funcRaw) {
            integralResultFunction.textContent = 'Error: Function cannot be empty.';
            return;
        }
        else if(!upperRaw && lowerRaw) {
            integralResultFunction.textContent = 'Error: Upper bound cannot be empty or empty the lower bound too.';
            return;
        }
        else if(!lowerRaw && upperRaw) {
            integralResultFunction.textContent = 'Error: Lower bound cannot be empty or empty the upper bound too.';
            return;
        }
        else {
            const func  = parseInput(funcRaw);
            const funcParsed = parseOutput(func);

            const lower = math.evaluate(parseInput(lowerRaw));
            const lowerParsed = formatNumber(lower);

            const upper = math.evaluate(parseInput(upperRaw));
            const upperParsed = formatNumber(upper);

            let result;
            let resultParsed;

            let integral;

            try {
                result = Algebrite.integral(func).toString();
                resultParsed = parseOutput(result);
                integralResultFunction.textContent = `Integral ${funcParsed}: ${resultParsed} + C`;
            }
            catch(error) {
                integralResultFunction.textContent = 'Error during integrate the function: ' + error.message;
                if(error.message === "Stop: integral: sorry, could not find a solution") {
                    integralResultFunction.textContent += ". Try simplify it.";
                }
                else {
                    integralResultFunction.textContent += ".";
                }
            }

            try {
                if(lowerRaw && upperRaw) {
                    integral = calculateIntegral(func, lower, upper);
                    integralResult.textContent = `Integral ${funcParsed} from ${lowerParsed} to ${upperParsed}: ${(integral)}`;
                }

                drawIntegralGraph(func, lower, upper, result);
                
                updateCalculatorHistory("integral", {
                    func: funcParsed,
                    lower: lowerRaw ? lowerParsed : null,
                    upper: upperRaw ? upperParsed : null,
                    resultFunc: resultParsed || null,
                    resultNum: integral || null,
                    timeStamp: new Date().toISOString()
                });

                loadCalculatorHistory("integral");
            }
            catch(error) {
                integralResult.textContent = 'Error during calculate the integral value: ' + error.message;
            }
        }
    });
}

async function updateCalculatorHistory(type, data) {
    const userUID = sessionStorage.getItem("kalkulukovaUID");
    if(userUID) {
        try {
            let isIn = false;

            const historyRef = ref(database, `users/${userUID}/activities/calculators/${type}`);
            const snapshot = await get(historyRef);

            if(snapshot.exists()) {
                const historyData = snapshot.val();
                Object.entries(historyData).forEach(([key, value]) => {
                    if(data.func === value.func && (
                           type === "limit" && data.xApproaches === value.xApproaches 
                        || type === "derivative" 
                        || type === "integral" && data.lower === value.lower && data.upper === value.upper)
                    ) {
                        isIn = true;
                    }
                });
            }

            if(!isIn) {
                updateUserActivity("calculators", type, data);
            }
        }
        catch(error) {
            console.error("Error updating history:", error);
            alertPopup("Error updating history", error.message);
        }
    }
}

async function loadCalculatorHistory(type) {
    const userUID = sessionStorage.getItem("kalkulukovaUID");
    if(userUID) {
        try {
            const historyRef = ref(database, `users/${userUID}/activities/calculators/${type}`);
            const snapshot = await get(historyRef);

            if(snapshot.exists()) {
                document.getElementById("history").style.display = "block";

                const historyItemContainer = document.getElementById("historyItemContainer");
                historyItemContainer.innerHTML = "";
                
                const historyData = snapshot.val();
                Object.entries(historyData).forEach(([key, value]) => {
                    let historyItem = document.createElement("button");
                    historyItem.classList.add("calculator-history-item");

                    let historyItemResult = document.createElement("p");

                    let func;
                    let x;
                    let lower;
                    let upper;
                    let result;
                    let resVal;
                    let resNum;
                    let resNumVal;

                    if(type === "limit") {
                        func = value.func;
                        x = value.xApproaches;
                        resVal = value.result;

                        result = `Limit ${func} as x approaches ${x}: ${resVal}`;
                        historyItemResult.innerText  = result;
                    }
                    else if(type === "derivative") {
                        func = value.func;
                        resVal = value.result;

                        result = `Derivative ${func}: ${resVal}`;
                        historyItemResult.innerText  = result;
                    }
                    else if(type === "integral") {
                        func = value.func;
                        lower = value.lower || "";
                        upper = value.upper || "";

                        resVal = value.resultFunc;
                        resNumVal = value.resultNum;
                        
                        result = `Integral ${func}: ${resVal} + C`;

                        let historyItemResultFunc = document.createElement("div");
                        historyItemResultFunc.innerText = result;  
                        historyItemResultFunc.style.marginBottom = "8px";                 
                        historyItemResult.appendChild(historyItemResultFunc);
                        
                        resNum = `Integral ${func} from ${lower} to ${upper}: ${resNumVal}`; 
        
                        let historyItemResultNum = document.createElement("div");
                        historyItemResultNum.innerText = resNumVal != null ? resNum : "‎";

                        historyItemResult.appendChild(historyItemResultNum);
                    }
                    
                    historyItem.appendChild(historyItemResult);

                    const timeStamp = new Date(value.timeStamp)
                    let historyItemTimeStamp = document.createElement("p");
                    historyItemTimeStamp.innerText = timeStamp;
                    historyItemTimeStamp.classList.add("timeStamp");
                    historyItem.appendChild(historyItemTimeStamp);

                    historyItem.addEventListener('click', () => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });

                        if(type === "limit") {
                            document.getElementById('limit-function').value = func;
                            document.getElementById('limit-x').value = x;

                            document.getElementById('limit-result').textContent = result;
                            
                            setTimeout(() => drawLimitGraph(parseInput(func), parseInput(x), value.limit), 200);
                        }
                        else if(type === "derivative") {
                            document.getElementById('derivative-function').value = func;

                            document.getElementById('derivative-result').textContent = result;
                            
                            setTimeout(() => drawDerivativeGraph(parseInput(func), parseInput(resVal)), 200);
                        }
                        else if(type === "integral") {
                            document.getElementById('integral-function').value = func;
                            document.getElementById('integral-lower').value = lower;
                            document.getElementById('integral-upper').value = upper;
                            document.getElementById('integral-result-function').textContent = result;
                            document.getElementById('integral-result').textContent = resNumVal ? resNum : "‎";

                            setTimeout(() => drawIntegralGraph(parseInput(func), math.evaluate(parseInput(lower)), math.evaluate(parseInput(upper)), parseInput(resVal)), 200);
                        }
                    });

                    historyItemContainer.appendChild(historyItem);
                });
            }
        }
        catch(error) {
            console.error("Error fetching history:", error);
            alertPopup("Error fetching history", error.message);
        }
    }
}