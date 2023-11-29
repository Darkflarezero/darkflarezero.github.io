// toggles and buttons
const statButton = document.querySelector('#stat-button');
const statToggle = document.querySelector('#stat-toggle');
const resetButton = document.querySelector('#reset-button');
const calcButton = document.querySelector('#calc-button');
const dotButton = document.querySelector('#dot-button');

// offensive modifiers
const str = document.querySelector('#str');
const dex = document.querySelector('#dex');
const int = document.querySelector('#int');
const boost = document.querySelector('#boost');
const minDmg = document.querySelector('#min-dmg');
const maxDmg = document.querySelector('#max-dmg');
const dmg = document.querySelector('#dmg');
const baseDamage = document.querySelector('#base-dmg');

// defensive modifiers
const res = document.querySelector('#res');
const dr = document.querySelector('#dr');

// more stats


// damage calc 
const hits = document.querySelector('#hits');
const crits = document.querySelector('#crits');
const totalDamageTaken = document.querySelector('#dmg-total');
const averageDamagePerHit = document.querySelector('#dph-avg');
const averageDamagePerCrit = document.querySelector('#dpc-avg');
const expectedDamage = document.querySelector('#exp-dmg');
const percentagePerHit = document.querySelector('#percent-hit');
const totalPercentage = document.querySelector('#percent-total');

// dot calc
const minDotDamage = document.querySelector('#min-dot-dmg');
const maxDotDamage = document.querySelector('#max-dot-dmg');
const avgDisplayedDotDamage = document.querySelector('#avg-dot-dmg');
const expectedDotDmg = document.querySelector('#exp-dot');
const dotTickDamage = document.querySelector('#dot-tick');
const dotTickPercentage = document.querySelector('#dot-percent');

// variables
let minBaseDamage, maxBaseDamage, avgBaseDamage;
let totalDamageMod, totalDotMod, totalCritMod;

// resets all parameters to 0
const reset = () => {
    const inputs = document.querySelectorAll('input');
    for (let i of inputs) {
        i.value = 0;
    }
    baseDamage.value = '0 - 0 (avg. 0)';
    expectedDamage.value = '0% - 0% (avg. 0%)';
    percentagePerHit.value = '0% - 0% (avg. 0%)';
    totalPercentage.value = '0% - 0% (avg. 0%)';
    dotTickPercentage.value = '0% - 0% (avg. 0%)';
};

// calculates various important variables
const calcRatios = () => {
    let mainstat = parseInt(str.value);
    if (parseInt(dex.value) > mainstat) { mainstat = dex.value; }
    if (parseInt(int.value) > mainstat) { mainstat = int.value; }
    dmg.value = (parseInt(minDmg.value) + parseInt(maxDmg.value)) / 2;
    const statDmg = Math.floor(mainstat / 10);
    minBaseDamage = minDmg.value - statDmg;
    maxBaseDamage = maxDmg.value - statDmg;
    avgBaseDamage = dmg.value - statDmg;
    baseDamage.value = `${minBaseDamage} - ${maxBaseDamage} (avg. ${avgBaseDamage})`;

    // apply damage mods from main stats and boost
    const strMod = str.value * 3 / 20;
    const dexMod = dex.value / 40;
    const dotMod = dex.value / 4;
    const intMod = int.value / 10;

    // calculate mods to outgoing direct damage
    let dmgMod = 1 + strMod / 100;
    dmgMod *= 1 + dexMod / 100;
    dmgMod *= 1 + boost.value / 100;

    // calculate mods to incoming direct damage
    let defMod = (100 - res.value) / 100;
    defMod *= (100 - dr.value) / 100;

    // calculate mod to incoming dot damage
    const dotDefMod = (100 - res.value) / 100;

    // calculate mods to outgoing critical direct damage
    let critMod = 1.75 + intMod / 100;
    critMod *= 1 + dexMod / 100;
    critMod *= 1 + boost.value / 100;

    // calculate final mods based on outgoing and incoming damage
    totalDamageMod = dmgMod * defMod;
    totalDotMod = dotMod * dotDefMod;
    totalCritMod = critMod * defMod;

    if (dmg.value <= 0 || avgBaseDamage <= 0 || parseInt(minDmg.value) > parseInt(maxDmg.value)) {
        return false;
    }
    return true;
};

// calculate hit damage
const calcDamage = () => {
    if (calcRatios()) {
        if (hits.value == 0) {
            console.log('Number of hits cannot be 0.');
            return;
        }
        if (crits.value > hits.value) {
            console.log('Number of crits cannot exceed number of hits.');
            return;
        }
        if (totalDamageTaken.value < 0) {
            console.log('Damage taken should not be less than 0.');
            return;
        }

        // average damage taken per hit
        const nonCritHits = hits.value - crits.value;

        // calculate average damage of hits and crits
        const baseDamageValue = totalDamageTaken.value / ((nonCritHits * totalDamageMod) + (crits.value * totalCritMod));
        const avgDmgPerHit = baseDamageValue * totalDamageMod;
        const avgDmgPerCrit = baseDamageValue * totalCritMod;

        // how much damage a 100% attack would do
        const minExpDmg = minDmg.value * totalDamageMod;
        const maxExpDmg = maxDmg.value * totalDamageMod;
        const avgExpDmg = dmg.value * totalDamageMod;

        // 1 hit as a percentage compared to 100%
        const minPercentPerHit = avgDmgPerHit / maxExpDmg * 100;
        const maxPercentPerHit = avgDmgPerHit / minExpDmg * 100;
        const avgPercentPerHit = avgDmgPerHit / avgExpDmg * 100;

        // all hits as a percentage compared to 100%
        const minPercentTotal = minPercentPerHit * hits.value;
        const maxPercentTotal = maxPercentPerHit * hits.value;
        const avgPercentTotal = avgPercentPerHit * hits.value;

        // update inputs with values
        averageDamagePerHit.value = avgDmgPerHit.toFixed(2);
        averageDamagePerCrit.value = avgDmgPerCrit.toFixed(2);
        expectedDamage.value = `${Math.round(minExpDmg)} - ${Math.round(maxExpDmg)} (avg. ${Math.round(avgExpDmg)})`;
        percentagePerHit.value = `${minPercentPerHit.toFixed(2)}% - ${maxPercentPerHit.toFixed(2)}% (avg. ${avgPercentPerHit.toFixed(2)}%)`;
        totalPercentage.value = `${minPercentTotal.toFixed(2)}% - ${maxPercentTotal.toFixed(2)}% (avg. ${avgPercentTotal.toFixed(2)}%)`;
    } else {
        console.log('Error in modifiers.');
    }
};

// calculate DoT damage
const calcDoT = () => {
    if (calcRatios()) {
        if (minDotDamage.value > maxDotDamage.value) {
            console.log('Minimum DoT damage cannot exceed maximum DoT damage.');
            return;
        }

        // average written DoT damage
        const avgDotDamage = (parseInt(minDotDamage.value) + parseInt(maxDotDamage.value)) / 2;

        // how much damage a 100% DoT would do
        const minExpDot = minBaseDamage * totalDotMod;
        const maxExpDot = maxBaseDamage * totalDotMod;
        const avgExpDot = avgBaseDamage * totalDotMod;

        // expected damage of DoT
        const minDotTick = minDotDamage.value * totalDotMod;
        const maxDotTick = maxDotDamage.value * totalDotMod;
        const avgDotTick = avgDotDamage * totalDotMod;

        // DoT damage as a percentage compared to 100%
        const minDotPercent = minDotTick / avgExpDot * 100;
        const maxDotPercent = maxDotTick / avgExpDot * 100;
        const avgDotPercent = avgDotTick / avgExpDot * 100;

        // update inputs with values
        avgDisplayedDotDamage.value = avgDotDamage;
        expectedDotDmg.value = `${Math.round(minExpDot)} - ${Math.round(maxExpDot)} (avg. ${Math.round(avgExpDot)})`;
        dotTickDamage.value = `${Math.round(minDotTick)} - ${Math.round(maxDotTick)} (avg. ${Math.round(avgDotTick)})`;
        dotTickPercentage.value = `${minDotPercent.toFixed(2)}% - ${maxDotPercent.toFixed(2)}% (avg. ${avgDotPercent.toFixed(2)}%)`;
    } else {
        console.log('Error in modifiers.');
    }
};

// init function
const init = () => {
    // on change events
    str.addEventListener('change', calcRatios);
    dex.addEventListener('change', calcRatios);
    int.addEventListener('change', calcRatios);
    boost.addEventListener('change', calcRatios);
    minDmg.addEventListener('change', calcRatios);
    maxDmg.addEventListener('change', calcRatios);
    res.addEventListener('change', calcRatios);
    dr.addEventListener('change', calcRatios);

    // button functionality
    statButton.addEventListener('click', () => { statToggle.classList.toggle('is-hidden') });
    calcButton.addEventListener('click', calcDamage);
    dotButton.addEventListener('click', calcDoT);
    resetButton.addEventListener('click', reset);
};

init();