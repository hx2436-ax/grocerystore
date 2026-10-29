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

## Distance Lab — two metrics

Distance Lab compares the same two endpoints using Euclidean distance (the unobstructed straight line) and shortest aisle distance (four-way walking paths around shelves and the counter). Select any two store landmarks, walkable grid locations, the courier, or any of the six shoppers. For shelf locations, measurements end at the shelf service point, not inside the solid shelf.

Start shoppers in the Customers tab or start the courier with Start delivery, then return to Distance Lab to measure live occupant-to-location or occupant-to-occupant distances. Moving occupants use their current interpolated edge position; the algorithm checks both ends of each occupied aisle edge, including the direct connection when both endpoints share one edge. Measurements update about eight times per second. Shoppers who have not entered or already exited are located at the entrance staging point and explicitly labeled that way.

Orange dashed lines show direct distance, teal solid lines show shortest aisle paths, and purple dashed lines show optional routes through ordered waypoints. The same colors appear in the 3D overlay, top-down map and comparison bars. A/B markers identify the selected endpoints. The detour ratio is aisle / direct; coincident endpoints use a ratio of 1. Each grid step is one meter.

Show shelf detour example selects (3,4) and (5,4), on opposite sides of the Water shelf: straight distance 2 m, aisle distance 4 m. With a shared close threshold of 3 m, an agent at A is close to B under Euclidean distance but far under aisle distance. The threshold can be changed for any selected pair.

Bonus: add up to eight ordered waypoints, undo or clear them, or load any shopper's entire planned shopping route. Each segment shows both metrics and the aisle segments are summed into a full route length. Straight segment sums are distinguished from direct endpoint distance; a closed shopping tour has zero endpoint distance but a positive route length. Shopper presets include entry, all required shelves, checkout and exit, but exclude queue repositioning, browsing time and customer collisions.

Run node distance-test.mjs for 46,225 location pairs checked against independent BFS, continuous moving endpoints, same-edge cases, symmetry, route sums, threshold classifications and full shopping tours.
