# Corner — Customers, Delivery Robot and Proximity

An English-language, roofless Three.js convenience-store simulation with nine merchandise categories, six shoppers, an axial delivery robot and a cashier. State is local to the browser. Serve the directory via HTTP; GitHub Pages uses main / repository root. Three.js and fonts load from public CDNs.

## Movement and capacity

Customers walk in arbitrary directions through visible free-floor segments. Fixtures are inflated by a 0.38 m body margin before visibility testing. A visibility graph through accessible floor waypoints guides routes around fixtures; it is not an eight-heading motion restriction. Moving people replan in short segments. Route distance is shortest within this waypoint visibility graph, rather than an exact continuous-space geodesic.

The wheeled delivery robot moves only horizontally and vertically along grid axes. Its default load limit is 24 kg, increased from 6 kg; it remains editable. Payload boxes on its deck update as goods are delivered. The default 12 inbound items fit into one 54 m static trip at the new load limit. Robot planning uses axial shortest paths and includes the return to depot. Actual movement may be longer due to people and yielding.

Up to 14 cargo items, Held–Karp shelf tours and subset partitioning give the globally shortest static packing/tour plan. Larger sets use explicitly labeled approximate packing with exact per-trip tours. Items are indivisible, and an item heavier than the load limit is rejected.

## Proximity rules and highlights

Open the Proximity tab for live rule states, color legend, recent events and one-click demonstrations. Highlight and sensing-circle visibility can be switched off without disabling the rules.

1. Personal space: if center distance is below 1.5 m, moving speed is multiplied by 0.45. Amber circles and emissive materials show slowdown. The shared corridor controller stops or reroutes a step before it would violate 0.9 m clearance. Red marks this preemptive safety stop; agents never need to collide first.
3. Pickup range: if walking distance to a required shelf service point is at most 0.6 m and stock is available, the customer pauses and picks for 1.5 s. The customer, stock, shelf frame and pickup zone glow green. Stock is deducted once on completion; partial/unavailable quantities are recorded without negative inventory. This can occur before reaching the exact service-point center.
4. Robot gives way: a constant-velocity forecast looks up to two seconds ahead. If a closing encounter predicts separation below 1.2 m, the robot waits at an aisle junction and customers get priority. Purple highlights connect robot, customer and predicted meeting point. The robot may take a safe axial detour after waiting. Full swept corridor reservations separately protect movement between junctions. A brief afterglow makes short pickup/yield events visible.

Demonstrations reset the store and stage real agents using these same rules. They are not prerecorded effects. A staged robot demo starts near a shelf, so its distance readout starts at the staged position. Reset all restores a normal depot/entry run.

## Store and shopping

The roofless model has rear coolers, central gondolas, bakery/produce fixtures, a side coffee counter and checkout near the entrance. The cashier occupies a protected staff enclosure. It is a simplified adaptation, not a surveyed replica. References:
- https://cityclerk.lacity.org/onlinedocs/2015/15-0715_misc_06-08-15.pdf#page=10
- https://jaycompdevelopment.com/convenience-store-design/

Default arrivals are 12 s apart; walking speed is 0.9 m/s. Arrival gap and speed remain adjustable. Pace scales walking speed, not arrival gaps or checkout time. Shelf picking lasts 1.5 s and payment lasts 3 s. Shelves begin with six items; purchases remove stock and robot deliveries add it. People who are paused or picking remain physical obstacles. Entry waits until the doorway is clear. A first-come queue serves one customer at a time.

Depot: (1,1). Entry: (3,1). Exit: (4,1). Queue front: (12,3). One axial grid step is one meter. The 0.9 m center clearance covers the model's pedestrian and robot footprints. The thresholds are teaching-model parameters.

## Distance Lab

Compare Euclidean distance with a walkable customer route for positions, live customers and the robot's current position. Actual arbitrary coordinates are supported. The robot's dispatch plan instead uses axial routes. Distance lines, a map, comparison bars, adjustable close/far threshold and ordered multistop routes remain available. The gondola example is 2 m direct versus 6 m walking distance at a 3 m close threshold. Static measurements ignore temporary people; motion respects them.

## Validation

Run node test.mjs, node customer-test.mjs, node distance-test.mjs, node motion-test.mjs and node proximity-test.mjs. Checks include packing/load limits, 32,400 visibility-route pairs against independent Floyd–Warshall, arbitrary-direction people, strictly axial robot movement, early pickup and inventory conservation, predictive yield cases, swept collision clearance, pauses and completion of the full store run.
