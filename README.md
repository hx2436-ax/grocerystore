# Corner — Grocery Store Lab

An English-language, single-floor Three.js simulation with nine dedicated shelf categories, capacity-constrained deliveries, and six shoppers with different shopping needs. State is local to the browser and resets on reload. Three.js and fonts load from public CDNs.

## Use

Serve this directory through a static HTTP server and open index.html. For GitHub Pages, use the repository root on main. Choose Customers or Delivery to change the control panel. Drag to orbit; scroll to zoom. Use Top / Perspective for an overhead view.

- Start shoppers: six staggered arrivals enter at (1,15), collect individual lists, queue at (13,14), pay, and leave at (1,15). Select a shopper to show their dashed route. Inspect all lists and baskets in the right panel.
- Start delivery: the courier carries optimized loads from (1,1) to assigned shelves and returns after each trip. The solid green line shows the current delivery trip. Shopping and delivery run simultaneously and pause independently. Speed changes walking speed for both.
- Shelves start with six retail items each. Customers remove actual quantities and deliveries add inventory. Unavailable goods are recorded and skipped; stock never goes below zero. Delivered / Inbound measures cumulative inbound delivery, not current inventory.
- Reset store, Reset all, cargo changes, or replaying a completed simulation reset both simulations and restore opening stock. Browsing takes 0.8 seconds per shelf and checkout takes two seconds per shopper. Speed changes do not change these timers.

## Model and optimization

One grid cell is one meter. Shelf cells and counter cell (14,14) are solid obstacles. Movement follows four-way aisle paths. People are not moving obstacles: paths may overlap. Checkout serves one person at a time in first-come order; this is a flow demonstration rather than a pedestrian collision model.

Deliveries use BFS aisle distances and Held–Karp tours for shelf subsets. Up to 14 cargo items, subset partition dynamic programming gives the global minimum total distance including every return to the depot. Larger cargo sets use four packing candidates with minimum marginal route-cost insertion and exact per-trip tours, labeled approximate overall. The baseline is one item per round trip. Items cannot be split, and overweight items are rejected.

Each shopper's shelf order is optimized by exhaustive permutation search from entry through required categories to checkout. Quantities affect inventory; each required shelf is visited once. Waiting and browsing times are excluded from route optimization. Checkout has one cashier and six standing positions.

## Validation

Run node test.mjs and node customer-test.mjs from this directory. Checks cover delivery capacity, quantities, obstacle avoidance, depot returns, distinct lists, FIFO checkout, one cashier, inventory conservation, sold-out behavior, and all shoppers exiting.
