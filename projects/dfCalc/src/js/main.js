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
const damageType = document.querySelector('#dmg-type');

// defensive modifiers
const res = document.querySelector('#res');
const dr = document.querySelector('#dr');

// more stats
const strMod = document.querySelector('#str-mod');
const dexMod = document.querySelector('#dex-mod');
const dotMod = document.querySelector('#dot-mod');
const intMod = document.querySelector('#int-mod');
const dmgMod = document.querySelector('#dmg-mod');
const critMod = document.querySelector('#crit-mod');
const defMod = document.querySelector('#def-mod');
const dotDefMod = document.querySelector('#dot-def-mod');
const totalDamageMod = document.querySelector('#total-dmg-mod');
const totalCritMod = document.querySelector('#total-crit-mod');
const totalDotMod = document.querySelector('#total-dot-mod');

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
let adjustedMinDamage, adjustedMaxDamage, adjustedAvgDamage;

// TODO: Factor in variable mainstat/boost
// TODO: Add stat damage only calculator option
// TODO: Add weapon + stat dmg DoT calculator option


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
    let highestMainstat = parseInt(str.value);
    if (parseInt(dex.value) > highestMainstat) { highestMainstat = dex.value; }
    if (parseInt(int.value) > highestMainstat) { highestMainstat = int.value; }
    const statDmg = Math.floor(highestMainstat / 10);
    minBaseDamage = minDmg.value - statDmg;
    maxBaseDamage = maxDmg.value - statDmg;
    avgBaseDamage = (parseInt(minDmg.value) + parseInt(maxDmg.value)) / 2 - statDmg;
    baseDamage.value = `${minBaseDamage} - ${maxBaseDamage} (avg. ${avgBaseDamage})`;

    let typedMainstat;
    switch (damageType.value) {
        case 'melee':
            typedMainstat = str.value;
            break;
        case 'pierce':
            typedMainstat = dex.value;
            break;
        case 'magic':
        default:
            typedMainstat = int.value;
            break;
    }
    const typedStatDmg = Math.floor(typedMainstat / 10);
    adjustedMinDamage = minBaseDamage + typedStatDmg;
    adjustedMaxDamage = maxBaseDamage + typedStatDmg;
    adjustedAvgDamage = avgBaseDamage + typedStatDmg;
    dmg.value = `${adjustedMinDamage} - ${adjustedMaxDamage} (avg. ${adjustedAvgDamage})`;

    // apply damage mods from main stats and boost
    strMod.value = 1 + str.value * 3 / 2000;
    dexMod.value = 1 + dex.value / 4000;
    dotMod.value = 1 + dex.value / 400;
    intMod.value = 1 + int.value / 1000;

    // calculate mods to outgoing direct damage
    dmgMod.value = strMod.value;
    dmgMod.value *= dexMod.value;
    dmgMod.value *= 1 + boost.value / 100;

    // calculate mods to incoming direct damage
    defMod.value = (100 - res.value) / 100;
    defMod.value *= (100 - dr.value) / 100;

    // calculate mod to incoming dot damage
    dotDefMod.value = (100 - res.value) / 100;

    // calculate mods to outgoing critical direct damage
    critMod.value = 0.75 + parseFloat(intMod.value);
    critMod.value *= dexMod.value;
    critMod.value *= 1 + boost.value / 100;

    // calculate final mods based on outgoing and incoming damage
    totalDamageMod.value = dmgMod.value * defMod.value;
    totalCritMod.value = critMod.value * defMod.value;
    totalDotMod.value = dotMod.value * dotDefMod.value;

    if (dmg.value <= 0 || avgBaseDamage <= 0 || parseInt(minDmg.value) > parseInt(maxDmg.value)) {
        return false;
    }
    return true;
};

// calculate hit damage
const calcDamage = () => {
    if (calcRatios()) {
        if (parseInt(hits.value) == 0) {
            console.log('Number of hits cannot be 0.');
            return;
        }
        if (parseInt(crits.value) > parseInt(hits.value)) {
            console.log('Number of crits cannot exceed number of hits.');
            return;
        }
        if (parseInt(totalDamageTaken.value) < 0) {
            console.log('Damage taken should not be less than 0.');
            return;
        }

        // average damage taken per hit
        const nonCritHits = hits.value - crits.value;

        // calculate average damage of hits and crits
        const baseDamageValue = totalDamageTaken.value / ((nonCritHits * totalDamageMod.value) + (crits.value * totalCritMod.value));
        const avgDmgPerHit = baseDamageValue * totalDamageMod.value;
        const avgDmgPerCrit = baseDamageValue * totalCritMod.value;

        // how much damage a 100% attack would do
        const minExpDmg = adjustedMinDamage * totalDamageMod.value;
        const maxExpDmg = adjustedMaxDamage * totalDamageMod.value;
        const avgExpDmg = adjustedAvgDamage * totalDamageMod.value;

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
        if (parseInt(minDotDamage.value) > parseInt(maxDotDamage.value)) {
            console.log('Minimum DoT damage cannot exceed maximum DoT damage.');
            return;
        }

        // average written DoT damage
        const avgDotDamage = (parseInt(minDotDamage.value) + parseInt(maxDotDamage.value)) / 2;

        // how much damage a 100% DoT would do
        const minExpDot = minBaseDamage * totalDotMod.value;
        const maxExpDot = maxBaseDamage * totalDotMod.value;
        const avgExpDot = avgBaseDamage * totalDotMod.value;;

        // expected damage of DoT
        const minDotTick = minDotDamage.value * totalDotMod.value;;
        const maxDotTick = maxDotDamage.value * totalDotMod.value;;
        const avgDotTick = avgDotDamage * totalDotMod.value;;

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
    damageType.addEventListener('change', calcRatios);
    res.addEventListener('change', calcRatios);
    dr.addEventListener('change', calcRatios);

    // button functionality
    statButton.addEventListener('click', () => { statToggle.classList.toggle('is-hidden') });
    calcButton.addEventListener('click', calcDamage);
    dotButton.addEventListener('click', calcDoT);
    resetButton.addEventListener('click', reset);
};

init();