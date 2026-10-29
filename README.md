# Corner — Roofless Convenience Store

An English-language Three.js teaching simulation: nine merchandise categories, six shoppers, one courier, a cashier, and a Distance Lab. State is local to the browser. Three.js and fonts load from public CDNs. Serve this directory via HTTP; GitHub Pages uses main / repository root.

## Store layout

The scene is a roofless dollhouse with tiled flooring, full back/right walls, cut-down front/left walls, transparent storefront glazing and a double entrance. Rear coolers hold Water, Milk and Cold drinks. Central gondolas hold Snacks, Canned food, Personal care and Paper goods. Bakery and produce fixtures sit toward the front/left, beside a coffee / food-to-go counter. Checkout faces the entrance and the cashier occupies a protected staff enclosure.

This is a simplified arrangement inspired by a real 7-Eleven public floor plan (sheet A3, PDF page 10) and convenience-store design guidance, not a dimensionally surveyed replica:
- https://cityclerk.lacity.org/onlinedocs/2015/15-0715_misc_06-08-15.pdf#page=10
- https://jaycompdevelopment.com/convenience-store-design/

The grid spans 15 x 15 nodes, with 1 m cardinal steps. Inbound depot: (1,1). Customer entry: (3,1). Adjacent exit: (4,1). Checkout queue front: (12,3); following positions extend along the aisle. Fixture nodes, the coffee counter and staff enclosure are not public walkways.

## Shopping and movement

Default customer arrivals are 12 seconds apart (formerly 2.5 seconds), and base walking speed is 0.9 m/s (formerly 5 m/s at Normal). Controls allow an arrival gap of 6–60 seconds and speed of 0.3–1.4 m/s. Changing arrival spacing resets the store. The Pace selector multiplies walking speeds only; it does not alter arrival gaps, browsing or checkout timers. Browsing takes 1.5 seconds per shelf and payment takes 3 seconds.

Eight-direction A* routes use 1 m orthogonal edges and sqrt(2) m diagonal edges. Diagonals cannot cut blocked fixture corners. All shoppers and the courier share one traffic controller. It reserves entire swept edge corridors with 0.9 m center-to-center clearance, preventing head-on swaps, crossing diagonals and overlap with stationary/paused people. A blocked person waits or replans around the obstruction. Entry waits until the door is clear. The cashier is a fixed obstacle inside the staff enclosure. Both simulations can run and pause independently.

Each shopper has a different list and shelf visit order. Shelf order minimizes static aisle distance from entry to checkout; live collision avoidance can add waiting or detours. Shelves begin with six items each. Purchases remove actual quantities; deliveries add them. Missing goods are recorded, and stock never goes negative. Customers queue and pay one at a time in first-come order.

## Deliveries

Quantities, item weights and carrying capacity are adjustable. Each trip starts and ends at the depot. Weighted aisle routes feed Held–Karp shelf tours. With up to 14 individual items, subset partitioning gives the globally shortest static delivery plan; larger sets use explicitly labeled approximate packing with exact tours per trip. The baseline is one item per round trip. Items are indivisible and overweight items are rejected.

Planned distance excludes people and waiting. Actual walk in the dispatch readout includes avoidance detours, so it can exceed the plan. Reset store / Reset all, cargo changes and replay reset both simulations and restore opening stock.

## Distance Lab

Compare Euclidean distance with the shortest weighted aisle distance for two locations or live occupants. Moving endpoints are measured at their actual positions on cardinal or diagonal edges. A/B markers, 3D lines, a top-down map and comparison bars share consistent colors. Arriving shoppers are measured at entry; exited shoppers at the adjacent exit, with explicit status labels.

The gondola example measures (6,6) to (8,6): direct 2 m, aisle 6 m. A 3 m close threshold classifies the same endpoints as close geometrically but far by walking. The threshold is adjustable.

Bonus routes support up to eight ordered waypoints and full shopper presets, including entry, required shelves, checkout and the adjacent exit. Segment distances are summed; the straight segment sum is distinct from direct endpoint distance. Static measurement paths ignore temporary people; movement respects them.

## Validation

Run node test.mjs, node customer-test.mjs, node distance-test.mjs, and node motion-test.mjs. Checks cover delivery capacity and quantities, weighted diagonal shortest paths against independent Dijkstra, corner cutting, fractional moving measurements, stock conservation, FIFO checkout, head-on swaps, crossing diagonals, paused obstacles, swept collision clearance and six shoppers plus the courier completing all work.
