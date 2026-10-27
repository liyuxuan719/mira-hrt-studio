# Model Notes

## Scope

MIRA estimates the contribution of **exogenous estradiol** from selected
estradiol esters and transdermal patches. It does not measure blood levels and
does not provide dosing recommendations.

## Implemented forms

- Estradiol valerate injection
- Estradiol cypionate injection
- Estradiol enanthate injection
- Estradiol benzoate injection
- Estradiol undecylate injection
- Twice-weekly estradiol patch
- Once-weekly estradiol patch
- Oral estradiol tablets
- Sublingual / buccal estradiol tablets
- Estradiol transdermal gel

Antiandrogen, GnRH agonist, and progestogen entries are available in the
medication library and dose log, but are intentionally not assigned estradiol
concentration curves. Their mechanism of action, active metabolites, or depot
release behavior cannot be represented safely by the current estradiol model.

## Core assumptions

- Injection and patch models use the three-compartment disposition structure
  and point-estimate parameters adapted from estrannaise.js.
- Oral, sublingual, and gel models adapt the route-specific structures from the
  MIT-licensed Transmtf HRT Tracker, simplified to a fixed 70 kg population.
- Injection inputs use total ester dose in milligrams.
- Patch inputs use the labeled release rate in micrograms per day.
- Oral estradiol uses an assumed 3% bioavailability and first-order absorption.
- Sublingual estradiol uses the recorded hold time to choose a fast mucosal
  fraction. The swallowed fraction can be included or excluded.
- Estradiol gel uses recorded concentration, application area, application
  site, and optional wash time. Vehicle kinetics remain anchored to the
  Oestrogel parameter set.
- Oral food timing, injection carrier/site, and patch brand are stored for
  clinical context but do not alter the current model without validated
  correction parameters.
- Patch replacement interval controls future dose projection. It does not
  redefine the patch's calibrated release/wear model.
- Repeated future doses are generated only from a repeat interval explicitly
  entered by the user.
- The displayed curve is the sum of modeled exogenous contributions. It does
  not add a baseline for endogenous estradiol.
- The shaded 100–200 pg/mL band is a literature monitoring reference, not a
  universal treatment target.
- Real laboratory results are plotted separately and never altered by the
  model.

## Important limitations

Point estimates cannot represent inter-individual variability, product
differences, injection-site effects, adherence, SHBG, liver metabolism,
interactions, or assay differences. Sampling time has a large effect on a
laboratory result. The model must not be used for self-adjustment, diagnosis,
or safety decisions.
