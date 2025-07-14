## 1.1.1

- `Updated`
  - Added `Arrival` and `Depart` actions to the `Incarnate` Summons
    - **_Note_** using these actions directly would be missing any `RollOptions` from the original token/spellcasting and as such extra attention should be paid to specific interactions
    - IE: If you would gain +2 circumstance bonus on saving throws against `Goblins` that would need to be manually toggled
  - Added a `dc` attribute to key the saves on in `Incarnate` actions (captured at the point they are `Arrive`)

## 1.1.0

- `New`
  - Added Summon support for the following spell/feats:
    - `Call Ursine Ally`
    - `Light` (requires JB2a)
    - `Healing Servitor` - Includes homemade art for it
    - `Tempest of Shades` - Includes Homemade art for it
  - Added Feature to allow summons to be named based on the creature that summoned it
  - Added appropriate traits to summons when summoned
- `Updated`
  - Requires **Foundry Summons** `2.3.1`
  - For Summons with 1 option, it now skips straight to the summon interface (@Sasane)

## 1.0.4

- `New`
  - Support for `Phantasmal Minion` spell
- `Fixed`
  - Fixed V12 support (@Sasane)

## 1.0.3

- `Updated`
  - Set the Summon's alliance to that of the summoner (@Sasane)
  - Added a recommendation for the `PF2e Sustain Reminder` module to track summons duration
  - Preparing for future handling of other use cases `Incarnate` spells etc.

## 1.0.2

- Actually released the changes from `1.0.1`

## 1.0.1

- `Changes`
  - a sort order dropdown (@Sasano)
  - a filter by trait when multiple traits were possible (@Sasano)
  - a "Only with image" checkbox (@Sasano)
  - Removed extraneous `Pf2e Toolbelt` code (@Sasano)

## 1.0.0

- `New`
  - Includes support for all official spells with the `Summon` trait
  - When a Spell with the summon tag is `Cast` it will pop up with the Foundry Summons Interface with the appropriate list of summons
  - _Mega Credit to **@Vauxs** for update Foundry Summons which and **@Sasano** for the original macro that interfaced with it <3_
