# Complete Driver Workflow Documentation

## 📱 Driver App Features

### Dashboard (`/dashboard/driver`)
Your home screen shows:
- **Kegs On Truck**: Live count of kegs in your possession
- **Pending Deliveries**: Awaiting manager acceptance
- **Completed Today**: Successful deliveries count
- **Quick Actions**: Scan, Create Delivery, Refresh

### Key Screens
1. `/dashboard/driver` - Main hub
2. `/scan` - QR scanner for loading/returning kegs
3. `/deliveries/new` - Create new delivery
4. `/deliveries/[id]` - View delivery status

---

## 🔄 Complete Daily Workflow

### Part 1: Morning Loading (Warehouse)

**Objective:** Load assigned kegs onto your truck

**Steps:**
1. Clock in to work
2. Get company phone from supervisor (already logged into your driver account)
3. Open app → You're on the dashboard
4. Walk to your assigned keg pile
5. Tap "📷 Scan Keg"
6. **Scan each keg's QR code one by one:**
   ```
   Scan Keg #1 → "✓ Keg-001 loaded"
   Scan Keg #2 → "✓ Keg-002 loaded"
   Scan Keg #3 → "✓ Keg-003 loaded"
   ...
   ```
7. As you scan, physically load them onto truck
8. Dashboard updates: "Kegs On Truck: 12"

**Database Updates:**
- Each scan updates `kegs.current_holder` to your driver ID
- Records `last_scan` timestamp
- Creates entry in `keg_scans` table

**Time:** ~2-3 minutes for 12 kegs

---

### Part 2: Create Delivery (Before Each Stop)

**Objective:** Notify restaurant you're coming with specific kegs

**When:** Ideally before leaving warehouse or while en route

**Steps:**
1. Tap "Create Delivery" on dashboard (or nav menu)
2. **Select Destination:**
   - Choose restaurant from dropdown
   - Example: "Restaurant abc123"
3. **Select Kegs:**
   - Checkboxes for each keg on truck
   - Or tap "Select All" if delivering everything to this stop
   - Each keg shows: Name, Type, Size, Deposit ($30)
4. **Add Notes (Optional):**
   - "Arriving at 2:30 PM"
   - "Call when outside - back entrance"
5. Tap "📦 Create Delivery"
6. **Confirmation:** 
   ```
   ✅ Delivery created!
   3 kegs ready for drop-off.
   The restaurant manager will be notified.
   ```

**What Happens:**
- Creates entry in `deliveries` table (status: PENDING)
- Creates entries in `delivery_items` table
- Restaurant manager sees pending delivery on their dashboard
- You can track status on your dashboard

**Time:** ~30 seconds per delivery

---

### Part 3: At Restaurant (Drop-Off)

**Objective:** Physically deliver kegs, get digital acceptance

**Your Actions:**
1. **Park and unload** kegs physically
2. **Hand over to manager** (or leave at designated spot)
3. **Manager's job:** They open their app and accept delivery
4. **You wait** for confirmation (usually 15 seconds)
5. **Get notification:** "✅ Delivery accepted"

**You DO NOT scan anything here!** 
- Manager scans or accepts on their phone
- This creates the blockchain receipt
- Updates keg ownership from you to restaurant

**What Happens Behind the Scenes:**
- Manager taps "Accept & Sign" on their app
- Blockchain transaction executes (NFT transfer)
- `deliveries.status` updates to ACCEPTED
- `kegs.current_holder` updates to restaurant
- Your dashboard updates: "Kegs On Truck" decreases

**Time:** ~15 seconds (for manager to accept)

**Your Dashboard Update:**
- "Pending Deliveries" decreases by 1
- "Completed Today" increases by 1
- "Kegs On Truck" decreases by delivered count

---

### Part 4: Multiple Stops

Repeat Parts 2 & 3 for each stop on your route:

```
Stop 1: Create delivery → Drop off → Wait for acceptance
Stop 2: Create delivery → Drop off → Wait for acceptance
Stop 3: Create delivery → Drop off → Wait for acceptance
...
```

**Route Optimization Tips:**
- Create all deliveries at start of day (if known)
- Or create each delivery 10 minutes before arriving
- Gives managers advance notice

---

### Part 5: End of Day (Return to Warehouse)

**Objective:** Return empty kegs, complete shift

**Empty Kegs Handling:**

**Option A: Supervisor Handles**
- You physically drop empties at designated area
- Supervisor scans them in later
- You're done - hand phone back

**Option B: You Scan Them**
1. Tap "📷 Scan Keg"
2. Scan each empty's QR code
3. App detects it's empty (from POS data)
4. Updates to "returned to brewery"
5. `kegs.current_holder` becomes NULL or warehouse

**Shift Completion:**
- Review dashboard: All deliveries should be ACCEPTED
- Check "Kegs On Truck" = 0 (or just empties)
- Hand phone to supervisor
- Clock out

**Time:** ~2-3 minutes for scanning empties

---

## 🎯 Summary of Your Interactions

| Time of Day | Action | App Time | Physical Time |
|-------------|--------|----------|---------------|
| Morning | Scan kegs to load | 2-3 min | 15-20 min |
| Before stop | Create delivery | 30 sec | 0 min |
| At stop | Wait for acceptance | 15 sec | 5-10 min unload |
| End of day | Scan empties | 2-3 min | 5 min |
| **Total** | **~8 min** | **~60 min** |

**Total app time per day: Less than 10 minutes!**

---

## 📊 What You See vs What Manager Sees

### Your View (Driver Dashboard)
```
Kegs On Truck: 12
Pending Deliveries: 1 (waiting for acceptance)
Completed Today: 2

Recent Deliveries:
- Restaurant abc123 | 3 kegs | ACCEPTED ✅
- Restaurant def456 | 5 kegs | PENDING ⏳
```

### Manager's View (Restaurant Dashboard)
```
Pending Deliveries: 1 REQUIRES ACTION

🚚 Delivery Arrived from Hop City Brewing
✓ Hazy IPA (1/2BBL) - $30
✓ Pilsner (1/4BBL) - $30
Total: 2 kegs, $60 deposit

[Accept & Sign] [Reject]
```

---

## 🚨 Exception Handling

### Scenario 1: Manager Not Accepting
**Problem:** You delivered kegs but manager hasn't accepted yet

**What You See:**
- Dashboard shows "Pending Deliveries: 1"
- Orange badge "PENDING"

**What To Do:**
1. Give it 2-3 minutes (they might be busy)
2. Call/text manager: "Hey, delivered 3 kegs, can you accept in the app?"
3. Wait for notification
4. If still pending after 10 min, contact dispatch

---

### Scenario 2: Manager Rejects Delivery
**Problem:** Manager says "Wrong beer" or "Didn't order this"

**What You See:**
- Notification: "❌ Delivery rejected - Wrong beer style"
- Dashboard shows "REJECTED" status

**What To Do:**
1. Load kegs back onto truck
2. Call dispatch/supervisor
3. Kegs still in your possession (current_holder = you)
4. Supervisor will reassign or return to brewery

---

### Scenario 3: Damaged Keg
**Problem:** Notice keg is dented/damaged while loading

**What To Do:**
1. Scan it anyway (to track it)
2. In delivery notes, write: "Keg-123 damaged - photo attached"
3. Take photo (future feature)
4. Notify supervisor
5. Still deliver or set aside per company policy

---

### Scenario 4: Picking Up Empties at Stop
**Problem:** Restaurant has empties to return

**What To Do:**

**Option A (Recommended):**
- Load empties onto truck physically
- **Don't scan them yet**
- Scan when back at warehouse

**Option B:**
- Scan empties at restaurant
- App marks them as "in your possession"
- Scan again at warehouse to complete return

**Why:** Keeps full kegs and empties separate in system

---

## 🔐 Blockchain for Drivers

### What Happens When Manager Accepts?

1. **Manager taps "Accept & Sign"**
2. **Blockchain transaction executes:**
   - Transfers NFT ownership from your wallet to restaurant wallet
   - Creates immutable receipt with transaction hash
   - Example: `0xabc123...` on Base blockchain
3. **You get confirmation:**
   - "✅ Delivery accepted"
   - "Blockchain TX: 0xabc123..."

### Why This Matters for You

| Old Way (Paper) | New Way (Blockchain) |
|-----------------|----------------------|
| Manager can lose signature | Signature permanent on blockchain |
| Disputes: "I never got 5 kegs" | Blockchain shows exact count |
| You're liable if paper lost | Blockchain proves you delivered |

**Bottom Line:** Protects you from false claims!

---

## 💡 Pro Tips

1. **Scan while loading** - Don't batch scan, scan as you go
2. **Create deliveries early** - Managers appreciate advance notice
3. **Use notes** - ETA, special instructions
4. **Check pending before leaving** - Don't leave if manager hasn't accepted
5. **Keep phone charged** - Critical for scanning
6. **Report broken QR codes** - Supervisor can reprint
7. **Screenshot completed deliveries** - If you want personal records

---

## 📞 Support

### Common Issues

**QR code won't scan:**
- Clean camera lens
- Better lighting
- Hold steady 6-8 inches away

**App slow:**
- Check internet connection
- Close and reopen app
- Ask supervisor for different phone

**Lost phone:**
- Immediately report to supervisor
- Account will be locked
- New phone assigned

**Forgot to scan a keg:**
- Tell supervisor ASAP
- They can manually update database
- Or scan it at next opportunity

---

## 🎯 Success Metrics

**What Good Looks Like:**

- ✅ All kegs scanned before leaving warehouse
- ✅ Deliveries created before each stop
- ✅ All deliveries ACCEPTED (not pending at end of day)
- ✅ "Kegs On Truck" = 0 at end of shift
- ✅ All empties returned

**Red Flags:**
- ❌ Multiple pending deliveries at end of day
- ❌ Kegs still on truck after route
- ❌ Rejected deliveries

---

## 📋 Daily Checklist

### Start of Shift
- [ ] Get phone, verify login
- [ ] Check today's route/assignments
- [ ] Scan all kegs while loading (one by one)
- [ ] Verify "Kegs On Truck" count matches physical

### During Route (Per Stop)
- [ ] Create delivery for stop
- [ ] Drive to destination
- [ ] Unload kegs physically
- [ ] Wait for manager acceptance
- [ ] Verify notification received
- [ ] Move to next stop

### End of Shift
- [ ] All deliveries show ACCEPTED
- [ ] Scan empties (if your job)
- [ ] "Kegs On Truck" = 0
- [ ] Report any issues to supervisor
- [ ] Hand phone back

---

**You're all set! The app does the tracking, you do the driving.** 🚚

