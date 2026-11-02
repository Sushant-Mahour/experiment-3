# Procedure: Toe Impact Test for Safety Footwear

This procedure describes the systematic step-by-step protocol for evaluating the impact resistance and clearance retention of protective footwear in accordance with **EN ISO 20345 / IS 15298 (Part 2)** and **ASTM F2413** using the Virtual Lab Simulator.

---

## Experimental Apparatus Required
1. **Vertical Drop Tower Machine:** Fitted with twin precision guide rails, electromagnet release, and anti-rebound catching arm.
2. **Standard Striker:** Calibrated mass assembly ($20.0 \pm 0.1\text{ kg}$) fitted with an alloy steel wedge blade ($90^\circ$ apex angle, $3.0\text{ mm}$ rounded edge radius).
3. **Solid Base Anvil:** Steel block ($\ge 600\text{ kg}$) bolted rigidly to the foundation.
4. **Specimen Clamping Fixture:** Heavy screw clamp mechanism with articulated footwear shoe holders.
5. **Clearance Sensor:** Cylindrical modelling clay (plasticine) sensor ($25.0\text{ mm}$ diameter, $22.0\text{ mm}$ standard height).
6. **Digital Measuring Micrometer/Caliper:** Reading to $0.01\text{ mm}$.
7. **Inspection Loupe / Magnifying Lens:** For structural crack and fracture inspection.

---

## Step-by-Step Procedure

### Step 1: Specimen Selection & Cap Material Verification
1. Inspect the cut footwear specimen to ensure the inner protective toe cavity is free from dirt, adhesive residues, or loose threads.
2. Select the protective toe cap material from the specimen inventory:
   - **Steel Alloy Cap:** Standard ductile alloy steel, high strength with plastic yield behavior.
   - **Aluminium Alloy Cap:** Lightweight aerospace alloy, ductile plastic deformation.
   - **Fiberglass / Composite Cap:** Non-metallic, non-magnetic, electrical hazard resistant with high elastic recovery.
   - **Carbon Fiber Cap:** Ultra-rigid, lightweight composite with high stiffness-to-weight ratio.
   - **Soft Toe (Reference Specimen):** Unreinforced work shoe without protective reinforcement (EN ISO 20347 baseline).

### Step 2: Modelling Clay Sensor Preparation & Positioning
1. Verify the initial height of the calibrated modelling clay cylinder on the test bench (Standard height: **$22.0\text{ mm}$**, diameter: **$25.0\text{ mm}$**).
2. Insert the clay cylinder into the protective toe cap cavity.
3. Position the cylinder vertically beneath the highest point of the toe cap dome, along the central longitudinal axis where maximum dynamic impact deflection will occur.

### Step 3: Specimen Clamping onto the Base Anvil
1. Position the specimen forefoot onto the hardened steel anvil wedge directly beneath the plumb-line of the falling striker.
2. Engage the screw clamping fixture and rotate clockwise until the specimen heel and forefoot are firmly clamped.
3. Verify that the clamping clamp firmly grips the footwear to prevent slipping, shifting, or tilting during impact without pre-compressing the toe box.

### Step 4: Machine Configuration & Energy Setup
1. Select the testing standard protocol from the control console:
   - **EN ISO 20345 (200 Joules):** Calibrated striker mass $m = 20.0\text{ kg}$, drop height $h = 1019\text{ mm}$, theoretical impact velocity $v = 4.47\text{ m/s}$.
   - **ASTM F2413 (101.7 Joules):** Calibrated striker mass $m = 20.0\text{ kg}$, drop height $h = 518\text{ mm}$, theoretical impact velocity $v = 3.19\text{ m/s}$.
   - **Custom Configuration:** Enables manual adjustment of striker mass ($10\text{ to }30\text{ kg}$) and drop height ($100\text{ to }1500\text{ mm}$) for over-energy research testing.
2. Confirm the machine setup parameters. The hoist cable will position the striker assembly at the computed vertical height.

### Step 5: Striker Release & Dynamic Impact Execution
1. Verify laboratory safety interlocks:
   - Clear the drop path zone along the vertical guide rails.
   - Ensure the anti-rebound catcher arm is in the armed stand-by position.
2. Select the visualization playback speed (**1.0x Realtime**, **0.25x Slow-Motion**, or **0.05x Super Slow-Motion**).
3. Depress the **RELEASE STRIKER** button to de-energize the electromagnet.
4. The striker drops in free fall along the rails, striking the apex of the toe cap.
5. As the striker impacts and decelerates, note the peak reaction force ($F_{\text{peak}}$) and dynamic deflection.
6. The rebound catcher engages immediately upon the first upward bounce to catch the striker pin, eliminating secondary impact strikes.

### Step 6: Post-Impact Evaluation & Verdict
1. **Clay Cylinder Extraction:** Carefully remove the deformed modelling clay cylinder from the shoe cavity without touching or distorting its upper surface.
2. **Clearance Measurement:** Place the deformed cylinder under the digital caliper. Record the compressed minimum clearance height ($h_{\text{clearance}}$) to the nearest $0.01\text{ mm}$.
3. **Structural Inspection:**
   - Use the magnifying inspection lens to examine the exterior and interior surfaces of the toe cap dome.
   - Check for any through-cracks, splits, brittle shattering, or puncture tears.
4. **Close-Up Dent & FEA Inspection:** Open the close-up inspection visualizer to observe the permanent dent crater, stress distribution contours, and material condition.
5. **Verdict Determination:**
   - **PASS:** Clearance meets or exceeds the required limit ($\ge 14.0\text{ mm}$ for EN size 8; $\ge 12.7\text{ mm}$ for ASTM size 8) **AND** the cap remains intact without through-cracks.
   - **FAIL:** Clearance is below the standard limit **OR** the cap exhibits structural cracks/fractures.

