# Algorithm Problems Reference Guide

## Table of Contents

1. [Total Active Time](#1-total-active-time)
2. [Nearest Neighbouring City](#2-nearest-neighbouring-city)
3. [Employee Free Time with Start Time and End Time and Min Duration](#3-employee-free-time-with-start-time-and-end-time-and-min-duration)
4. [Multiple Employees Free Time (No Start and End Times)](#4-multiple-employees-free-time-no-start-and-end-times)
5. [Menu Tree Count Changes](#5-menu-tree-count-changes)
6. [Valid Sudoku](#6-valid-sudoku)
7. [Sudoku Solver](#7-sudoku-solver)
8. [Closest Dasher  Nearest K Dasher](#8-closest-dasher--nearest-k-dasher)
9. [Nearest Dashmart](#9-nearest-dashmart)
10. [Number of Islands](#10-number-of-islands)
11. [Max Area of Island](#11-max-area-of-island)
12. [Longest Path Duplicate Numbers Within a Matrix](#12-longest-path-duplicate-numbers-within-a-matrix)
13. [Longest Increasing Path in Matrix](#13-longest-increasing-path-in-matrix)
14. [Validate Order Path (Walking Only on Neighbors of Same Value)](#14-validate-order-path-walking-only-on-neighbors-of-same-value)
15. [Validate Order Paths \[P1, P2, D1, D2\]](#15-validate-order-paths-p1-p2-d1-d2)
16. [Find the Longest Valid Subarray](#16-find-the-longest-valid-subarray)
17. [Follow Up Valid Order Path - Given N Find All Valid Orders](#17-follow-up-valid-order-path---given-n-find-all-valid-orders)
18. [Analyze User History](#18-analyze-user-history)
19. [Available Deliveries (Dashers Rewards, High Tier, Low Tier)](#19-available-deliveries-dashers-rewards-high-tier-low-tier)
20. [Maximum Amount of Money Dasher Earns from Given Deliveries](#20-maximum-amount-of-money-dasher-earns-from-given-deliveries)
21. [Dices Permutations](#21-dices-permutations)
22. [Eligible Chef Orders](#22-eligible-chef-orders)
23. [Maximum Calories Within Budget](#23-maximum-calories-within-budget)
24. [LRU Cache](#24-lru-cache)
25. [Search Suggestion System for Restaurants](#25-search-suggestion-system-for-restaurants)

---

## 1. Total Active Time

Given a sequence of timestamps & actions of a dasher's activity within a day, we would like to know the active time of the dasher. Idle time is defined as the dasher has NO delivery at hand. (That means all items have been dropped off at this moment and the dasher is just waiting for another pickup) Active time equals total time minus idle time. Below is an example. Dropoff can only happen after pickup. 12:00am means midnight and 12:00pm means noon. All the time is within a day.

```python
activity = [
    "8:30am | pickup",
    "9:10am | dropoff",
    "10:20am | pickup",
    "12:15pm | pickup",
    "12:45pm | dropoff",
    "2:25pm | dropoff"
]
```

### Code

```python
class Solution:
    def get_minutes(self, t):
        timestamp = t.strip().lower()
        time, ampm = timestamp[:-2], timestamp[-2:]

        hrs, mins = map(int, time.split(':'))

        if ampm == 'pm' and hrs != 12:
            hrs += 12
        elif ampm == 'am' and hrs == 12:
            hrs = 0

        return hrs * 60 + mins

    def get_active_time(self, activity):
        if not activity:
            return 0

        events = []
        for a in activity:
            timestamp, action = a.split('|')
            events.append((self.get_minutes(timestamp.strip()), action.strip()))

        events.sort()

        prev_time = events[0][0]
        idle_time = 0
        order_count = 0

        for time, event_type in events:
            # If dasher was idle before this event → accumulate idle time
            if order_count == 0:
                idle_time += time - prev_time

            # Update delivery count
            if event_type == 'pickup':
                order_count += 1
            else:
                order_count -= 1

            prev_time = time

        total_time = events[-1][0] - events[0][0]
        return total_time - idle_time
```

### COMPLEXITY

O(n) time, minimal memory

---

## 2. Nearest Neighbouring City

A number of cities are arranged on a graph that has been divided up like an ordinary Cartesian plane. Each city is located at an integral (x, y) coordinate intersection. City names and locations are given in the form of three arrays: c, x, and y, which are aligned by the index to provide the city name (c[i]), and its coordinates, (x[i], y[i]). Determine the name of the nearest city that shares either an x or a y coordinate with the queried city. If no other cities share an x or y coordinate, return 'NONE'. If two cities have the same distance to the queried city, q[i], consider the one with an alphabetically shorter name (i.e. 'ab' < 'aba' < 'abb') as the closest choice. The distance is the Manhattan distance, the absolute difference in x plus the absolute difference in y.

### CODE

```python
class Solution:
    def get_nearest_city(self, cities, x, y, queries):
        n = len(cities)
        x_map = {}
        y_map = {}
        c_map = {cities[i]:i for i in range(n)}

        for i in range(n):
            if x[i] not in x_map:
                x_map[x[i]] = []
            x_map[x[i]].append((y[i], cities[i]))

            if y[i] not in y_map:
                y_map[y[i]] = []
            y_map[y[i]].append((x[i], cities[i]))

        for key in x_map:
            x_map[key].sort()
        for key in y_map:
            y_map[key].sort()

        results = []
        for q in queries:
            c_idx = c_map[q]
            xq, yq = x[c_idx], y[c_idx]

            x_neighbors = x_map[xq]
            pos = next(i for i, v in enumerate(x_neighbors) if v[1] == q)

            best_city = ""
            best_distance = float('inf')

            # check left X neighbor
            if pos - 1 >= 0:
                yn, city = x_neighbors[pos - 1]
                dis = abs(yn - yq)
                if dis < best_distance or (dis == best_distance and city < best_city):
                    best_distance = dis
                    best_city = city

            # check right X neighbor
            if pos + 1 < len(x_neighbors):
                yn, city = x_neighbors[pos + 1]
                dis = abs(yn - yq)
                if dis < best_distance or (dis == best_distance and city < best_city):
                    best_distance = dis
                    best_city = city

            y_neighbors = y_map[yq]
            pos = next(i for i, v in enumerate(y_neighbors) if v[1] == q)

            # check left Y neighbor
            if pos - 1 >= 0:
                xn, city = y_neighbors[pos - 1]
                dis = abs(xn - xq)
                if dis < best_distance or (dis == best_distance and city < best_city):
                    best_distance = dis
                    best_city = city

            # check right Y neighbor
            if pos + 1 < len(y_neighbors):
                xn, city = y_neighbors[pos + 1]
                dis = abs(xn - xq)
                if dis < best_distance or (dis == best_distance and city < best_city):
                    best_distance = dis
                    best_city = city

            if best_city == "":
                results.append("NONE")
            else:
                results.append(best_city)

        return results
```

### Complexity

My solution runs in O(N log K + Q·K) time, where K is the largest number of cities that share the same x or y coordinate.
Building the groups takes O(N), sorting each group takes O(N log K), and answering each query takes O(K) because I only scan the cities sharing the queried x or y value.
The space complexity is O(N), because I store two maps grouping all cities.

---

## 3. Employee Free Time with Start Time and End Time and Min Duration

Given a list of time blocks where a particular person is already booked/busy, a start and  end time to search between, a minimum duration to search for, find all the blocks of time that a person is free for a potential meeting that will last the aforementioned durationGiven: starttime, endtime, duration, meetingslist -> suggestedmeetingtimes

### CODE

```python
class Solution:
    def freeTime(self, meetings, startTime, endTime, minDuration):
        if not meetings:
            if endTime - startTime >= minDuration:
                return [[startTime, endTime]]
            return []
        
        # Sort by start time
        meetings.sort(key=lambda x: x[0])
        
        # Merge overlapping meetings
        merged = [meetings[0]]
        for start, end in meetings[1:]:
            last_start, last_end = merged[-1]
            if start <= last_end:
                merged[-1][1] = max(last_end, end)
            else:
                merged.append([start, end])
        
        free_times = []
        curr = startTime

        for s, e in merged:
            # Ignore meetings that ended before our window pointer
            if e <= curr:
                continue

            # If there's a free gap before this meeting starts
            if s > curr:
                if s - curr >= minDuration:
                    free_times.append([curr, s])

            # Move pointer to the end of the meeting
            curr = max(curr, e)

            # Correct break condition
            if curr >= endTime:
                break

        # Final free slot after all meetings
        if curr < endTime and endTime - curr >= minDuration:
            free_times.append([curr, endTime])

        return free_times
```

### COMPLEXITY

O(N log N)

---

## 4. Multiple Employees Free Time (No Start and End Times)

### code

```python
# LeetCode provides Interval class:
# class Interval:
#     def __init__(self, start, end):
#         self.start = start
#         self.end = end

class Solution:
    def employeeFreeTime(self, schedule: 'List[List[Interval]]') -> 'List[Interval]':
        
        # 1. Flatten all intervals
        all_intervals = []
        for emp in schedule:
            for it in emp:
                all_intervals.append(it)

        # 2. Sort intervals by start time
        all_intervals.sort(key=lambda it: it.start)

        # 3. Merge intervals using merged[-1]
        merged = [all_intervals[0]]

        for it in all_intervals[1:]:
            last = merged[-1]

            # Overlapping or touching intervals
            if it.start <= last.end:
                last.end = max(last.end, it.end)
            else:
                merged.append(it)

        # 4. Free time = gaps between merged intervals
        free = []
        for i in range(1, len(merged)):
            prev_end = merged[i-1].end
            next_start = merged[i].start

            if prev_end < next_start:
                free.append(Interval(prev_end, next_start))

        return free
```

---

## 5. Menu Tree Count Changes

### Code

```python
class Node:
    def __init__(self, key, val, children):
        self.key = key
        self.val = val
        self.children = children

class Solution:
    def get_subtree_size(self, node):
        if not node:
            return 0
        count = 1
        for child in node.children:
            count += self.get_subtree_size(child)
        return count

    def get_child(self, node):
        res = {}
        if not node:
            return res
        for child in node.children:
            res[child.key]= child
        return res

    def menuPath(self, oldMenu, newMenu, oldParent=None, newParent=None):
        if not oldMenu and not newMenu:
            return 0
        
        if not oldMenu:
            return self.get_subtree_size(newMenu)
        if not newMenu:
            return self.get_subtree_size(oldMenu)

        count = 0
        if oldMenu.val != newMenu.val:
            count += 1
        
        if oldParent != newParent:
            return self.get_subtree_size(oldMenu)+self.get_subtree_size(newMenu)
        
        oldChild = self.get_child(oldMenu)
        newChild = self.get_child(newMenu)

        for key in oldChild:
            count += self.menuPath(oldChild[key], newChild.get(key, None), oldMenu.key, newMenu.key)
        
        for key in newChild:
            if key not in oldChild:
                count += self.get_subtree_size(newChild[key])
        return count
```

### Complexity

TIME COMPLEXITY: O(N)
Because every node in both trees is visited exactly once.
 Subtree additions and deletions use get_subtree_size, but each node in that subtree is counted once and never reprocessed.
SPACE COMPLEXITY: O(N)
Because of: recursion depth (worst case)
temporary child maps
subtree counting

---

## 6. Valid Sudoku

```python
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        cols = defaultdict(set)
        rows = defaultdict(set)
        squares = defaultdict(set)
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    continue
                if ( board[r][c] in rows[r]
                    or board[r][c] in cols[c]
                    or board[r][c] in squares[(r // 3, c // 3)]):
                    return False
                cols[c].add(board[r][c])
                rows[r].add(board[r][c])
                squares[(r // 3, c // 3)].add(board[r][c])
        return True
```

Space and time o(n2) -> as n is 9 o(81) constant time

---

## 7. Sudoku Solver

Use backtracking

### code

```python
class Solution:
    def solveSudoku(self, board: List[List[str]]) -> None:
        rows = defaultdict(set)
        cols = defaultdict(set)
        squares = defaultdict(set)
        # Collect empty cells and fill tracking sets
        empties = []
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    empties.append((r, c))
                else:
                    v = board[r][c]
                    rows[r].add(v)
                    cols[c].add(v)
                    squares[(r // 3, c // 3)].add(v)
        def backtrack(i):
            # All cells filled → sudoku solved
            if i == len(empties):
                return True
            r, c = empties[i]
            box = (r // 3, c // 3)
            for d in map(str, range(1, 10)):
                if d not in rows[r] and d not in cols[c] and d not in squares[box]:
                    board[r][c] = d
                    rows[r].add(d)
                    cols[c].add(d)
                    squares[box].add(d)
                    # Recurse
                    if backtrack(i + 1):
                        return True
                    board[r][c] = "."
                    rows[r].remove(d)
                    cols[c].remove(d)
                    squares[box].remove(d)
            return False
        backtrack(0)
```

### Complexity

Sudoku is a backtracking search problem.
This algorithm uses DFS backtracking.
The worst-case time is exponential, O(9^E), where E is the number of empty cells.
But constraint pruning using row/column/square sets makes it run very fast in practice

---

## 8. Closest Dasher / Nearest K Dasher

Heap based approach

### Code

```python
class Location:
    def __init__(self, longitude, latitude):
        self.longitude = longitude
        self.latitude = latitude
class Dasher:
    def __init__(self, dasher_id, lastLocation, rating):
        self.id = dasher_id
        self.lastLocation = lastLocation
        self.rating = rating
def findClosestDashers_heap(restaurantLoc, dashers):
    heap = []
    for d in dashers:
        dist = math.sqrt(
            (restaurantLoc.longitude - d.lastLocation.longitude) ** 2 +
            (restaurantLoc.latitude - d.lastLocation.latitude) ** 2
        )

        # Push into min-heap
        heapq.heappush(heap, (dist, -d.rating, d.id))
    result = []
    for _ in range(3):
        if heap:
            _, _, dasher_id = heapq.heappop(heap)
            result.append(dasher_id)
    return result
```

### Complexity

Time complexity:
Push n elements into heap
Building a heap using heappush n times → O(n log n)
 (Because each push is O(log n))
Pop 3 smallest elements → 3 × O(log n) → O(log n)
f you build the heap using heapq.heapify() (one operation), then:
heapify → O(n)
pop 3 → O(log n)
Space Complexity
Heap of size n → O(n)

---

## 9. Nearest Dashmart

### code

```python
def get_closest_dashmart(grid, locations):
    rows, cols = len(grid), len(grid[0])
    dist = [[-1] * cols for _ in range(rows)]
    q = deque()
    # Step 1: Add all dashmarts to queue
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'D':
                q.append((r, c))
                dist[r][c] = 0
    directions = [(1,0), (-1,0), (0,-1), (0,1)]
    # Step 2: Multi-source BFS
    while q:
        r, c = q.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'X' and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1
                    q.append((nr, nc))
     result = []
    for r, c in locations:
        if 0 <= r < rows and 0 <= c < cols:
            result.append(dist[r][c])
        else:
            result.append(-1)
    return result
```

### Complexity

Time and space for BFS=O(R×C)
We perform one BFS starting from all DashMarts simultaneously.
In BFS:Every cell is visited at most once
Every cell is enqueued at most once
Each visit takes O(1) time
So:
Time for BFS=O(R×C)\text{Time for BFS} = O(R \times C)Time for BFS=O(R×C)

---

## 10. Number of Islands

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        if not grid:
            return 0
        islands = 0
        directions = [(0,1), (-1, 0), (1,0), (0,-1)]
        rows, cols = len(grid), len(grid[0])
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    islands += 1
                    grid[r][c] = 0
                    q = deque([(r,c)])
                    while q:
                        row, col = q.popleft()
                        for dr, dc in directions:
                            nr, nc = dr+row, dc+col
                            if (0 <= nr < rows) and (0 <= nc < cols) and grid[nr][nc] == '1':
                                q.append((nr, nc))
                                grid[nr][nc] = 0
        return islands
```

Time and space complexity = o(n*m) n is rows and m iis cols

---

## 11. Max Area of Island

```python
class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        if not grid:
            return 0
        directions = [(0,1), (1,0), (0,-1), (-1,0)]
        maxArea = 0
        rows, cols = len(grid), len(grid[0])
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    area = 0
                    grid[r][c] = 0
                    q = deque([(r, c)])

                    while q:
                        row, col = q.popleft()
                        area += 1
                        for dr, dc in directions:
                            nr, nc = dr+row, dc+col

                            if((0 <= nr < rows) and (0 <= nc < cols) and (grid[nr][nc] == 1)):
                                grid[nr][nc] = 0
                                q.append((nr,nc))
                    maxArea = max(maxArea, area)
        return maxArea
```

Every cell is visited once, and BFS for each island processes only its land cells.
 Total time = O(m × n).
Space Complexity:
 In the worst case (all land), the BFS queue may store all grid cells.
 So space = O(m × n).

---

## 12. Longest Path Duplicate Numbers Within a Matrix

(variant of max area of island instead of 1's and 0's it will have different values)

```python
def longestSameValueRegion(matrix):
    if not matrix:
        return 0

    rows, cols = len(matrix), len(matrix[0])
    directions = [(1,0), (0,1), (-1,0), (0,-1)]
    maxArea = 0

    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == '#':
                continue

            value = matrix[r][c]
            area = 0

            q = deque([(r, c)])
            matrix[r][c] = '#'

            while q:
                row, col = q.popleft()
                area += 1

                for dr, dc in directions:
                    nr, nc = row + dr, col + d
                    if (
                        0 <= nr < rows and
                        0 <= nc < cols and
                        matrix[nr][nc] == value):
                        matrix[nr][nc] = '#'      
                        q.append((nr, nc))

            maxArea = max(maxArea, area)

    return maxArea
```

---

## 13. Longest Increasing Path in Matrix

From every node we need to verify all the path and in this process we need to calculate  repeated nodes. So we can use dp memozation.

```python
class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        if not matrix:
            return 0
        rows, cols = len(matrix), len(matrix[0])
        dp = [[0]*cols for _ in range(rows)]
        directions = [(0,1), (1,0), (0,-1), (-1,0)]

        def dfs(r, c):
            if dp[r][c] != 0:
                return dp[r][c]
            
            best = 1
            for dr, dc in directions:
                nr, nc = dr+r, dc+c
                if ((0 <= nr < rows) and (0 <= nc < cols) and matrix[nr][nc] > matrix[r][c]):
                    best = max(best, 1+dfs(nr, nc))
            dp[r][c] = best
            return best
            
        longest = 0
        for r in range(rows):
            for c in range(cols):
                longest = max(longest, dfs(r,c))
        return longest
```

### Time and space complexity

We check 4 neighbors

We perform O(1) work outside recursive calls
So total work is bounded by:
O(rows×cols)
Why not exponential?
Because:Without memo: exponential
With memo: each cell's DFS is computed once and cached
Every subsequent DFS hit returns instantly

---

## 14. Validate Order Path (Walking Only on Neighbors of Same Value)

Given a grid of numbers, find the longest path you can take by walking only on adjacent numbers of the same value. You cannot walk on the same number twice in the same path.
We cannot use memoization because the longest path from a cell depends on which cells were already visited, so the result is not fixed for that cell.
Therefore we must use DFS with backtracking to explore all possible simple paths, because different visited histories produce different path lengths.

```python
def longest_same_value_path(matrix):
    if not matrix:
        return 0

    rows, cols = len(matrix), len(matrix[0])
    directions = [(1,0), (-1,0), (0,1), (0,-1)]

    def dfs(r, c, visited, value):
        visited.add((r, c))
        best = 1
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if (
                0 <= nr < rows and
                0 <= nc < cols and
                (nr, nc) not in visited and
                matrix[nr][nc] == value
            ):
                best = max(best, 1 + dfs(nr, nc, visited, value))
        visited.remove((r, c))   # backtrack
        return best
    longest = 0
    for r in range(rows):
        for c in range(cols):
            visited = set()
            longest = max(longest, dfs(r, c, visited, matrix[r][c]))
    return longest
```

### Time and space complexity:

There are R × C possible starting cells.
From each cell, DFS can branch up to 4 directions.
Each DFS path can continue for up to R × C steps.
You cannot revisit, so every branch explores a new subset of unvisited cells.
Thus worst-case:
O(R×C×4(R×C))O(R \times C \times 4^{(R \times C)})
O(R×C×4(R×C))
Space complexity: O(R×C)

---

## 15. Validate Order Paths [P1, P2, D1, D2]

Delivery guys pick ups and deliveries for order, figure out if the given list is valid or not.
[P1, P2, D1, D2]==>valid [d1, d2,

```python
class Solution:
    def isValidRoute(self, events):
        picked = set()
        delivered = set()
        for e in events:
            order_type = e[0]   # 'P' or 'D'
            order = e[1:]       # the ID
            if order_type == 'P':
                # Cannot pick same order twice or after delivery
                if order in picked or order in delivered:
                    return False
                picked.add(order)
            else:  # 'D'
                # Cannot deliver before pickup
                if order not in picked:
                    return False
                if order in delivered:
                    return False
                delivered.add(order)
        # Car must be empty: every pick must have a matching delivery
        return picked == delivered
```

Time and space complexity = o(n)

---

## 16. Find the Longest Valid Subarray

(follow up of validate order paths)

```python
class Solution:
    def isValidRoute(self, events):
        picked = set()
        delivered = set()
        for e in events:
            t = e[0]
            order = e[1:]
            if t == 'P':
                if order in picked or order in delivered:
                    return False
                picked.add(order)
            else: if order not in picked:
                    return False
                if order in delivered:
                    return False
                delivered.add(order)
        return picked == delivered
    def longestValidSubarray(self, events):
        if self.isValidRoute(events):
            return len(events)
        pickup = set()
        deliveries = set()
        left = 0
        best = 0
        for right in range(len(events)):
            t, order = events[right][0], events[right][1:]
            if t == 'P':
                while order in pickup or order in deliveries:
                    la, lo = events[left][0], events[left][1:]
                    if la == 'P':
                        pickup.remove(lo)
                    else:
                        deliveries.remove(lo)
                  left += 1
                pickup.add(order)
            else:
                while order not in pickup:
                    la, lo = events[left][0], events[left][1:]
                    if la == 'P':
                        pickup.remove(lo)
                    else:
                        deliveries.remove(lo)
                    left += 1
                while order in deliveries:
                    la, lo = events[left][0], events[left][1:]
                    if la == 'P':
                        pickup.remove(lo)
                    else: deliveries.remove(lo)
                    left += 1
                deliveries.add(order)
                pickup.remove(order)
            if not pickup:
                best = max(best, right - left + 1)
        return best
```

Time and space: o(n)

---

## 17. Follow Up Valid Order Path - Given N Find All Valid Orders

```python
def generate_valid_orders(n):
    result = []
    path = []
    delivered = set()

    def backtrack(next_pickup):
        if len(path) == 2 * n:
            result.append(path.copy())
            return

        # Option 1: place the next pickup (must be in ascending order)
        if next_pickup <= n:
            path.append(f"P{next_pickup}")
            backtrack(next_pickup + 1)
            path.pop()

        # Option 2: deliver any picked but not-delivered order
        for order in range(1, next_pickup):
            if order not in delivered:
                delivered.add(order)
                path.append(f"D{order}")
                backtrack(next_pickup)
                path.pop()
                delivered.remove(order)

    backtrack(1)
    return result
```

---

## 18. Analyze User History

```python
from collections import defaultdict, Counter

class Solution:
    def mostVisitedPattern(self, username, timestamp, website):
        
        # Step 1: Sort visits by timestamp
        visits = sorted(zip(timestamp, username, website))
        
        # Step 2: Build per-user visit history
        user_history = defaultdict(list)
        for time, user, site in visits:
            user_history[user].append(site)
        
        # Step 3: Count patterns
        pattern_count = Counter()
        
        for user, sites in user_history.items():
            n = len(sites)
            if n < 3:
                continue
            
            seen_patterns = set()
            
            # Correct index iteration for triples i < j < k
            for i in range(n - 2):
                for j in range(i + 1, n - 1):
                    for k in range(j + 1, n):
                        seen_patterns.add((sites[i], sites[j], sites[k]))
            
            # Each pattern counted once per user
            for pat in seen_patterns:
                pattern_count[pat] += 1
        
        # Step 4: Find best pattern
        best_pattern = sorted(
            pattern_count,
            key=lambda p: (-pattern_count[p], p)
        )[0]
        
        return list(best_pattern)
```

The triple nested loops generate all 3-website combinations for each user.
 In the worst case a user visited all N websites, so the number of patterns is C(N,3) = O(N³).
 Everything else—sorting, grouping, scanning—is smaller, so the total time complexity is O(N³).
Space = o(N)

---

## 19. Available Deliveries (Dashers Rewards, High Tier, Low Tier)

```python
from datetime import datetime, timedelta

class Dasher:
    def __init__(self, idx, tier):
        self.idx = idx
        self.tier = tier

class Delivery:
    def __init__(self, idx, pickup_time, store_id):
        self.idx = idx
        self.pickup_time = pickup_time
        self.store_id = store_id
    
class Solution:
    def get_available_deliveries(self, dasher, deliveries):
        current_time = datetime.now()
        available = []

        for d in deliveries:
            pickup = d.pickup_time

            # Rule 1: Ignore deliveries >= 2 days away
            if pickup - current_time >= timedelta(days=2):
                continue
            
            # Rule 2: Same-day deliveries → always visible
            if pickup.date() == current_time.date():
                available.append(d)
                continue

            # Rule 3: Next-day deliveries
            if pickup.date() == current_time.date() + timedelta(days=1):

                # High-tier unlocks at 18:00
                if current_time.hour >= 18 and dasher.tier == 'high':
                    available.append(d)

                # Low-tier unlocks at 19:00
                elif current_time.hour >= 19 and dasher.tier == 'low':
                    available.append(d)

        return available
```

Time Complexity: O(n), because we scan each delivery once and all checks are O(1).
Space Complexity: O(n) in the worst case for the list of available deliveries

---

## 20. Maximum Amount of Money Dasher Earns from Given Deliveries

(this is a dp problem weighted interval scheduling) because we need to explore all solutions. We should not confine to small intervals and skip valid solutions.

```python
class Solution:
    def maximumWeight(self, intervals: List[List[int]]) -> int:
        # Sort by end time
        intervals.sort(key=lambda x: x[1])
        n = len(intervals)
        start = [interval[0] for interval in intervals]
        end   = [interval[1] for interval in intervals]
        price = [interval[2] for interval in intervals]
        # Build prev array
        prev = [-1] * n
        for i in range(n):
            for j in range(i-1, -1, -1):
                if end[j] <= start[i]:
                    prev[i] = j
                    break
        # DP array
        dp = [0] * n
        dp[0] = price[0]

        for i in range(1, n):
            # Option 1: take interval i
            take = price[i]
            if prev[i] != -1:
                take += dp[prev[i]]
            # Option 2: skip interval i
            skip = dp[i-1]
            # Best of take vs skip
            dp[i] = max(take, skip)
        return dp[-1]
```

Time complexity o(n2) we can use binary search and optimix\ze this to o(nlogn)
Space is o(n)

### Optimized:

Add  binary search method

```python
def find_prev(i):
    # We want the rightmost j < i such that end[j] <= start[i]
    left, right = 0, i - 1
    ans = -1
    while left <= right:
        mid = (left + right) // 2
        if end[mid] <= start[i]:
            ans = mid
            left = mid + 1   # try to find a later compatible job
        else:
            right = mid - 1
    return ans

for i in range(n):
    prev[i] = find_prev(i)
```

---

## 21. Dices Permutations

```python
def dice_permutations(n):
    result = []
    path = []

    def backtrack():
        if len(path) == n:
            result.append(path[::])
            return
        
        for face in range(1, 7):
            path.append(face)     # choose
            backtrack()           # explore
            path.pop()            # un-choose (backtrack)

    backtrack()
    return result
```

Time complexity 6^n

---

## 22. Eligible Chef Orders

Heap and doubly linked list. Brute force will take o(n). Everytime we are scanning for eligible items even though only neighbors of one result changes.
Removing from middle of list is expensive o(n)

To optimize we will use doubly linked list for o(1) for removal and without scanning the list every time we will only check the neighbors of the removed element. 
Time complexity is o(nlogn)

IsActive is used to check if we push duplicates on to heap

```python
import heapq

class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None
        self.isActive = True

class Solution:

    def isEligible(self, node):
        # if already removed
        if not node.isActive:
            return False
        
        left = node.prev
        right = node.next

        # Single node remaining
        if not left and not right:
            return True

        # Node at left boundary
        if not left and right:
            return node.val > right.val

        # Node at right boundary
        if left and not right:
            return node.val > left.val

        # Middle node
        return node.val > left.val and node.val > right.val

    def chef_order(self, order_ids):
        n = len(order_ids)
        if n == 0:
            return []
        
        # Build DLL nodes
        nodes = [Node(v) for v in order_ids]
        
        for i in range(n):
            if i > 0:
                nodes[i].prev = nodes[i - 1]
            if i < n - 1:
                nodes[i].next = nodes[i + 1]

        # Initial heap of eligible nodes
        heap = []
        for node in nodes:
            if self.isEligible(node):
                heapq.heappush(heap, (node.val, node))
        
        res = []

        while heap:
            val, node = heapq.heappop(heap)

            # Skip stale entries
            if not node.isActive or not self.isEligible(node):
                continue

            # Remove from result
            res.append(val)
            node.isActive = False

            # Remove from DLL
            left = node.prev
            right = node.next

            if left:
                left.next = right
            if right:
                right.prev = left

            # Check neighbors for new eligibility
            for neighbor in (left, right):
                if neighbor and neighbor.isActive and self.isEligible(neighbor):
                    heapq.heappush(heap, (neighbor.val, neighbor))

        return res
```

### Time and space

You push at most O(n) neighbors (each node can become eligible multiple times)
But each heap operation is still O(log n)
Even with stale entries, the total heap operations remain bounded by O(n log n).Cost = O(n log n)

---

## 23. Maximum Calories Within Budget

You are making choices: If you buy an item → you spend money and gain calories
If you skip it → you save money but may lose calories
For each item, you must answer:
"Is it better to take this item or skip it?"
This leads to Dynamic Programming because: Solutions to bigger budgets depend on smaller budgets and We can build the answer step-by-step

```python
def max_calories(budget, items):  
    # items: list of (cost, calories)
    dp = [0] * (budget + 1)

    for cost, cal in items:
        for b in range(budget, cost - 1, -1):
            dp[b] = max(dp[b], dp[b - cost] + cal)

    return dp[budget]
```

Time complexity is o(n*budget)
Space: o(budget)

---

## 24. LRU Cache

```python
class Node:
    def __init__(self, dasher_id, delivery_id):
        self.dasher_id = dasher_id
        self.delivery_id = delivery_id
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}  # dasher_id -> Node

        # dummy head and tail
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    # helper: remove a node from linked list
    def remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    # helper: insert node right after head (as MRU)
    def insert_at_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, dasher_id):
        if dasher_id not in self.map:
            return -1

        node = self.map[dasher_id]
        self.remove(node)
        self.insert_at_head(node)
        return node.delivery_id

    def put(self, dasher_id, delivery_id):
        # if exists → update + move to head
        if dasher_id in self.map:
            node = self.map[dasher_id]
            self.remove(node)
         

        # else create a new node
        node = Node(dasher_id, delivery_id)
        self.map[dasher_id] = node
        self.insert_at_head(node)

        # eviction
        if len(self.map) > self.capacity:
            lru = self.tail.prev
            self.remove(lru)
            del self.map[lru.dasher_id]
```

---

## 25. Search Suggestion System for Restaurants

(search for entire query)

Use trie because searching for a prefix will take o(len(prefix))
Insertion will take o(len(word))
Handles arbitrary characters (spaces too)

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.suggestions = []   # store up to K suggestions

class RestaurantTrie:
    def __init__(self, K):
        self.root = TrieNode()
        self.K = K

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]

            # add to suggestions
            if len(node.suggestions) < self.K:
                node.suggestions.append(word)
                node.suggestions.sort()
            else:
                # keep smallest K lexicographically
                if word < node.suggestions[-1]:
                    node.suggestions[-1] = word
                    node.suggestions.sort()

    def query(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return []
            node = node.children[ch]
        return node.suggestions

def restaurantSuggestions(restaurants, queries, K=3):
    restaurants.sort()
    trie = RestaurantTrie(K)

    # build trie
    for r in restaurants:
        trie.insert(r)

    result = []
    for q in queries:
        result.append(trie.query(q))
    return result
```

Building the Trie takes O(N · L) time and space, where N = number of products and L = average length, since each character is inserted once.

Searching a prefix takes O(P + K) time, where P is prefix length and K is the time to collect the top suggestions.

Space is O(N · L) because every character of every product is stored once in the Trie, including spaces.