# 📊 ANALYTICS & REPORTS SYSTEM - IMPLEMENTATION GUIDE
**Plants Mall - Business Intelligence Dashboard**

**Status:** Planning Phase  
**Priority:** 🔴 HIGH (After Staff+PO, or can do in parallel)  
**Estimated Duration:** 6-8 hours  
**Complexity:** Medium  

---

## 📑 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [What We'll Track](#what-well-track)
3. [Database Models & Aggregation](#database-models--aggregation)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages & Dashboards](#frontend-pages--dashboards)
6. [Charts & Visualizations](#charts--visualizations)
7. [Reports Types](#reports-types)
8. [Implementation Steps](#implementation-steps)
9. [Build Timeline](#build-timeline)

---

## 🎯 SYSTEM OVERVIEW

**What is Analytics?**
Analyzing business data to understand:
- How many sales happened?
- How much revenue made?
- Which products sell most?
- Which customers are most valuable?
- What trends are emerging?
- How's the business doing vs. last month?

**Why do we need it?**
- Make data-driven decisions
- Identify top products & customers
- Track growth
- Spot problems early
- Plan inventory better
- Set realistic targets

**Who will use it?**
- 👔 Admin - Overall business performance
- 💰 Accounts Manager - Revenue & financial metrics
- 📦 Procurement Officer - Product demand forecasting
- 🏪 Store Manager - Inventory & stock movement

---

## 📈 WHAT WE'LL TRACK

### **1. SALES ANALYTICS**
```
Metrics to Track:
✅ Total Orders (count)
✅ Total Revenue (sum of order totals)
✅ Average Order Value (revenue / orders)
✅ Orders by Status (pending, confirmed, shipped, delivered)
✅ Orders by Payment Status (pending, completed, failed, refunded)
✅ Revenue trend (daily, weekly, monthly)
✅ Best performing products
✅ Best performing categories
✅ Repeat customers (same customer multiple orders)
✅ New vs. returning customers

Display:
- Cards showing KPIs (Big numbers)
- Line charts for trends
- Pie charts for distribution
- Tables for details
- Date range filtering
```

**Example Dashboard Card:**
```
┌─────────────────────────┐
│ Total Revenue           │
│ ₹2,45,600               │
│ ↑ 12.5% from last month │
└─────────────────────────┘

┌─────────────────────────┐
│ Total Orders            │
│ 156 orders              │
│ ↑ 8 more than last month│
└─────────────────────────┘

┌─────────────────────────┐
│ Average Order Value     │
│ ₹1,573                  │
│ ↑ 5% higher             │
└─────────────────────────┘
```

---

### **2. PRODUCT ANALYTICS**
```
Metrics to Track:
✅ Total Products (count)
✅ Active Products (isActive = true)
✅ Out of Stock Products
✅ Sales by Product
✅ Revenue by Product
✅ Top 10 Bestselling Products
✅ Slow Moving Products (low sales)
✅ Average product rating
✅ Product categories performance
✅ Inventory value (stock * cost)

Display:
- Top Products table
- Bottom Products table
- Category distribution
- Stock level pie chart
- Revenue contribution
```

**Example Report:**
```
Top 10 Bestselling Products
1. Monstera Deliciosa     - 156 units sold - ₹23,400 revenue
2. Pothos Green           - 143 units sold - ₹21,450 revenue
3. Snake Plant            - 128 units sold - ₹19,200 revenue
...
```

---

### **3. CUSTOMER ANALYTICS**
```
Metrics to Track:
✅ Total Customers (count)
✅ Active Customers (placed at least 1 order)
✅ New Customers (joined this month)
✅ Customer Lifetime Value (total spent by customer)
✅ Repeat Purchase Rate (% of customers who bought >1 time)
✅ Average Customer Spend
✅ Most Valuable Customers
✅ Customer Retention Rate
✅ Customer by Region/City
✅ Wishlist analytics (popular items)

Display:
- Top Customers table
- Customer segments
- Regional distribution
- Growth chart
```

**Example Report:**
```
Top 10 Valuable Customers
1. Rajesh Kumar      - ₹15,600 spent in 5 orders
2. Priya Singh       - ₹12,300 spent in 3 orders
3. Amit Patel        - ₹11,200 spent in 4 orders
...
```

---

### **4. FINANCIAL ANALYTICS**
```
Metrics to Track:
✅ Total Revenue
✅ Revenue by Payment Status
✅ Pending Payment Amount (orders not yet paid)
✅ Failed Payment Count & Amount
✅ Refunded Amount
✅ Revenue by Month (trend)
✅ Revenue by Product Category
✅ Discount Amount Given
✅ Net Revenue (after discounts)
✅ Profit Margin (if cost data available)

Display:
- Revenue cards
- Monthly trend chart
- Category breakdown
- Payment status pie chart
```

**Example:**
```
Financial Summary - March 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Revenue:      ₹2,45,600
Gross Discount:     ₹(45,200)
Net Revenue:        ₹2,00,400
Pending Payment:    ₹23,400 (9.5%)
Failed Payments:    ₹5,600
Refunded:           ₹8,200
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **5. INVENTORY ANALYTICS**
```
Metrics to Track:
✅ Total Stock Value (∑ stock * price)
✅ Low Stock Items (< 10 units)
✅ Out of Stock Items
✅ High Stock Items (> 100 units)
✅ Stock Turnover Rate
✅ Inventory Movement (additions/reductions)
✅ Slow Moving Items (not sold in 30 days)
✅ Fast Moving Items (high velocity)
✅ Stock by Category
✅ Average Days in Stock

Display:
- Inventory health cards
- Stock levels chart
- Low stock alerts
- Movement graphs
```

**Example:**
```
Inventory Health
━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Stock Value:    ₹5,60,000
Low Stock Items:      23 products
Out of Stock:         5 products
High Stock Items:     8 products
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **6. ORDER ANALYTICS**
```
Metrics to Track:
✅ Total Orders
✅ Orders by Status
✅ Average Fulfillment Time (order to delivery)
✅ Orders Pending (waiting for processing)
✅ Orders Shipped (in transit)
✅ Orders Delivered (completed)
✅ Orders Cancelled
✅ Return Rate
✅ Order Value Distribution
✅ Peak Order Days

Display:
- Status distribution pie chart
- Fulfillment time trend
- Daily orders chart
- Order value histogram
```

**Example:**
```
Order Status Distribution
Pending:      12 orders
Confirmed:    28 orders
Processing:   15 orders
Shipped:      42 orders
Delivered:    58 orders
Cancelled:    3 orders
━━━━━━━━━━━━━━━━━━━━━━
Total:        158 orders
```

---

## 🗄️ DATABASE MODELS & AGGREGATION

### **NO NEW MODELS NEEDED!**
We use existing models to create analytics:
- ✅ Order model (for sales analytics)
- ✅ Product model (for product analytics)
- ✅ User model (for customer analytics)
- ✅ Address model (for regional analytics)

**Analytics Approach:**
- Use MongoDB aggregation pipeline
- Calculate metrics on-demand (no separate table needed)
- Cache results if needed for performance

---

## 🔌 API ENDPOINTS

### **SALES ANALYTICS ENDPOINTS**

```
GET /api/analytics/sales/overview
Query Params: ?startDate=2026-03-01&endDate=2026-03-31&period=daily
Returns: 
{
  totalOrders: 156,
  totalRevenue: 245600,
  averageOrderValue: 1573,
  ordersByStatus: {
    pending: 12,
    confirmed: 28,
    processing: 15,
    shipped: 42,
    delivered: 58,
    cancelled: 3
  },
  ordersByPaymentStatus: {
    pending: 23,
    completed: 128,
    failed: 5,
    refunded: 0
  },
  trend: [
    { date: "2026-03-01", orders: 8, revenue: 12500 },
    { date: "2026-03-02", orders: 12, revenue: 18900 },
    ...
  ]
}

GET /api/analytics/sales/top-products
Query Params: ?limit=10&startDate=2026-03-01&endDate=2026-03-31
Returns:
{
  products: [
    { 
      productId: "...",
      name: "Monstera Deliciosa",
      unitsSold: 156,
      revenue: 23400,
      discount: 2600
    },
    ...
  ]
}

GET /api/analytics/sales/by-category
Returns:
{
  categories: [
    { name: "Indoor Plants", revenue: 145600, orders: 95 },
    { name: "Flowering", revenue: 100000, orders: 61 },
    ...
  ]
}

GET /api/analytics/sales/revenue-trend
Query Params: ?period=monthly&months=6
Returns:
{
  trend: [
    { month: "2025-10", revenue: 120000 },
    { month: "2025-11", revenue: 135000 },
    { month: "2025-12", revenue: 180000 },
    { month: "2026-01", revenue: 195000 },
    { month: "2026-02", revenue: 220000 },
    { month: "2026-03", revenue: 245600 },
  ]
}
```

---

### **PRODUCT ANALYTICS ENDPOINTS**

```
GET /api/analytics/products/summary
Returns:
{
  totalProducts: 245,
  activeProducts: 242,
  inactiveProducts: 3,
  outOfStock: 5,
  totalInventoryValue: 560000,
  averageRating: 4.5
}

GET /api/analytics/products/low-stock
Returns:
{
  products: [
    {
      productId: "...",
      name: "Rose Plant",
      stock: 3,
      reorderPoint: 10,
      lastSaleDate: "2026-03-14"
    },
    ...
  ]
}

GET /api/analytics/products/slow-moving
Query Params: ?days=30&limit=10
Returns:
{
  products: [
    {
      productId: "...",
      name: "Rare Orchid",
      lastSoldDaysAgo: 45,
      stock: 8,
      unitsSold: 2
    },
    ...
  ]
}

GET /api/analytics/products/category-performance
Returns:
{
  categories: [
    { 
      name: "Indoor Plants",
      totalProducts: 95,
      revenue: 145600,
      ordersCount: 95,
      avgPrice: 1530
    },
    ...
  ]
}
```

---

### **CUSTOMER ANALYTICS ENDPOINTS**

```
GET /api/analytics/customers/summary
Returns:
{
  totalCustomers: 487,
  newCustomers: 45,
  activeCustomers: 128,
  repeatingCustomers: 58,
  averageCustomerLifetimeValue: 2043,
  repeatPurchaseRate: 11.9
}

GET /api/analytics/customers/top-customers
Query Params: ?limit=10
Returns:
{
  customers: [
    {
      customerId: "2603043495",
      name: "Rajesh Kumar",
      email: "rajesh@email.com",
      totalSpent: 15600,
      orderCount: 5,
      lastOrder: "2026-03-14"
    },
    ...
  ]
}

GET /api/analytics/customers/retention
Query Params: ?period=monthly&months=6
Returns:
{
  retention: [
    { month: "2025-10", newCustomers: 25, returningCustomers: 12, rate: 48 },
    { month: "2025-11", newCustomers: 32, returningCustomers: 18, rate: 56 },
    ...
  ]
}

GET /api/analytics/customers/by-region
Returns:
{
  regions: [
    { city: "Delhi", count: 123, revenue: 156000 },
    { city: "Mumbai", count: 98, revenue: 142000 },
    { city: "Bangalore", count: 87, revenue: 131000 },
    ...
  ]
}
```

---

### **FINANCIAL ANALYTICS ENDPOINTS**

```
GET /api/analytics/financial/summary
Query Params: ?startDate=2026-03-01&endDate=2026-03-31
Returns:
{
  totalRevenue: 245600,
  grossDiscount: 45200,
  netRevenue: 200400,
  averageOrderValue: 1573,
  paymentStatus: {
    completed: { count: 128, amount: 201700 },
    pending: { count: 23, amount: 36100 },
    failed: { count: 5, amount: 7800 }
  },
  refunded: 0
}

GET /api/analytics/financial/monthly-trend
Query Params: ?months=12
Returns:
{
  trend: [
    { month: "2025-04", revenue: 95000, discount: 15000, net: 80000 },
    { month: "2025-05", revenue: 110000, discount: 18000, net: 92000 },
    ...
    { month: "2026-03", revenue: 245600, discount: 45200, net: 200400 },
  ]
}

GET /api/analytics/financial/payment-status
Returns:
{
  completed: { count: 128, percentage: 82, amount: 201700 },
  pending: { count: 23, percentage: 14.7, amount: 36100 },
  failed: { count: 5, percentage: 3.2, amount: 7800 },
  refunded: { count: 0, percentage: 0, amount: 0 }
}
```

---

### **INVENTORY ANALYTICS ENDPOINTS**

```
GET /api/analytics/inventory/summary
Returns:
{
  totalStockValue: 560000,
  lowStockItems: 23,
  outOfStockItems: 5,
  overstock: 8,
  averageDaysInStock: 35
}

GET /api/analytics/inventory/alerts
Returns:
{
  lowStock: [
    { productId: "...", name: "Rose", currentStock: 3, minStock: 10 },
    ...
  ],
  outOfStock: [
    { productId: "...", name: "Orchid", stock: 0 },
    ...
  ],
  overstock: [
    { productId: "...", name: "Common Plant", stock: 450, avgDailySales: 2 },
    ...
  ]
}

GET /api/analytics/inventory/movement
Query Params: ?startDate=2026-03-01&endDate=2026-03-31
Returns:
{
  movement: [
    { date: "2026-03-01", added: 50, sold: 23, net: 27 },
    { date: "2026-03-02", added: 0, sold: 18, net: -18 },
    ...
  ]
}

GET /api/analytics/inventory/by-category
Returns:
{
  categories: [
    { name: "Indoor Plants", value: 245000, count: 95, coverage: 35 },
    { name: "Flowering", value: 185000, count: 75, coverage: 28 },
    ...
  ]
}
```

---

### **ORDER ANALYTICS ENDPOINTS**

```
GET /api/analytics/orders/status-distribution
Returns:
{
  statuses: [
    { status: "pending", count: 12, percentage: 7.7 },
    { status: "confirmed", count: 28, percentage: 17.9 },
    { status: "processing", count: 15, percentage: 9.6 },
    { status: "shipped", count: 42, percentage: 26.9 },
    { status: "delivered", count: 58, percentage: 37.2 },
    { status: "cancelled", count: 3, percentage: 1.9 }
  ]
}

GET /api/analytics/orders/fulfillment-time
Returns:
{
  averageDays: 5.2,
  distribution: [
    { range: "1-2 days", count: 45, percentage: 28.8 },
    { range: "3-5 days", count: 68, percentage: 43.6 },
    { range: "6-10 days", count: 28, percentage: 17.9 },
    { range: ">10 days", count: 15, percentage: 9.6 }
  ]
}

GET /api/analytics/orders/daily-trend
Query Params: ?days=30
Returns:
{
  trend: [
    { date: "2026-02-13", orders: 8, revenue: 12500 },
    { date: "2026-02-14", orders: 12, revenue: 18900 },
    ...
    { date: "2026-03-14", orders: 15, revenue: 23600 },
  ]
}
```

---

## 🎨 FRONTEND PAGES & DASHBOARDS

### **MAIN DASHBOARD: /admin/analytics/dashboard**

```
Layout:
┌─────────────────────────────────────────────────────────┐
│ 📊 ANALYTICS DASHBOARD                                  │
│ Date Range: [Start Date] - [End Date]  [Apply Filter]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🟦 KPI CARDS (4-6 cards in row)                        │
│ ┌──────────┬──────────┬──────────┬──────────┐           │
│ │ Revenue  │ Orders   │ Avg Val  │Customers │           │
│ │ ₹2.4L    │ 156      │ ₹1,573   │ 128      │           │
│ │ ↑12.5%   │ ↑8%      │ ↑5%      │ ↑6%      │           │
│ └──────────┴──────────┴──────────┴──────────┘           │
│                                                          │
│ 📈 CHARTS (2 columns)                                   │
│ ┌──────────────────────┬──────────────────────┐         │
│ │ Revenue Trend        │ Orders by Status     │         │
│ │ (Line Chart)         │ (Pie Chart)          │         │
│ │ 6 months data        │ 6 status colors      │         │
│ └──────────────────────┴──────────────────────┘         │
│                                                          │
│ ┌──────────────────────┬──────────────────────┐         │
│ │ Top 10 Products      │ Revenue by Category  │         │
│ │ (Table)              │ (Bar Chart)          │         │
│ │ Name | Sales | Revenue                      │         │
│ └──────────────────────┴──────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### **SALES ANALYTICS: /admin/analytics/sales**

```
Sections:
1. Overview Cards
   - Total Orders
   - Total Revenue
   - Average Order Value
   - Repeat Customers Rate

2. Revenue Trend Chart (6 months)
   - Line chart showing revenue growth
   - Ability to toggle: Daily/Weekly/Monthly

3. Orders Status Breakdown
   - Pie chart: Pending/Confirmed/Processing/Shipped/Delivered/Cancelled
   - Table with order count for each status

4. Best Selling Products
   - Table: Product Name | Units Sold | Revenue | Discount
   - Sort by: Revenue or Units
   - Pagination

5. Revenue by Category
   - Bar chart showing category-wise revenue
   - Hover shows exact amounts
```

---

### **PRODUCT ANALYTICS: /admin/analytics/products**

```
Sections:
1. Product Summary Cards
   - Total Products
   - Active Products
   - Out of Stock
   - Inventory Value

2. Top Products Table
   - Columns: Product Name | Stock | Sales | Revenue | Rating
   - Sort by: Sales or Revenue
   - Link to product details

3. Low Stock Alert
   - Table of products with low stock
   - Current stock | Min required | Days to reorder
   - Color coding: Yellow (low) | Red (critical)

4. Slow Moving Products
   - Products not sold in last 30/60/90 days
   - Last sale date | Current stock | Recommendation

5. Category Performance
   - Table: Category | Products | Revenue | Avg Price
   - Bar chart comparison
```

---

### **CUSTOMER ANALYTICS: /admin/analytics/customers**

```
Sections:
1. Customer Summary Cards
   - Total Customers
   - New Customers (this month)
   - Active Customers
   - Avg Lifetime Value

2. Top Customers Table
   - Columns: Name | Email | Total Spent | Orders | Last Order
   - Link to customer profile
   - Last order date
   - Email contact button

3. Repeat Customer Metrics
   - Repeat customer percentage
   - Average order frequency
   - Retention rate trend

4. Regional Distribution
   - Map showing customer distribution by city
   - Table: City | Customer Count | Total Revenue

5. Customer Growth Chart
   - Monthly new customers trend
   - Cumulative customers trend
```

---

### **FINANCIAL ANALYTICS: /admin/analytics/financial**

```
Sections:
1. Financial Summary Cards
   - Total Revenue
   - Net Revenue (after discounts)
   - Pending Payments
   - Payment Success Rate

2. Revenue Trend (12 months)
   - Line chart with dual axes:
     - Left: Revenue amount
     - Right: Discount percentage
   - See growth and discount impact

3. Payment Status Breakdown
   - Pie chart: Completed/Pending/Failed/Refunded
   - Drill-down to orders for each status

4. Category Revenue
   - Bar chart: Revenue by category
   - Table: Category | Revenue | % of Total | Growth

5. Monthly Comparison
   - Table comparing months
   - Revenue | Discount | Net | Growth % | Payment Success %
```

---

### **INVENTORY ANALYTICS: /admin/analytics/inventory**

```
Sections:
1. Inventory Health Cards
   - Total Stock Value
   - Low Stock Items
   - Out of Stock Items
   - Average Days in Stock

2. Stock Level Distribution
   - Pie chart: Optimal/Low/Critical/Overstock
   - Color coded

3. Low Stock Alerts
   - Red table showing products needing reorder
   - Current Stock | Min Level | Days Until Critical
   - Quick reorder button

4. Stock Movement
   - Line chart showing: Added / Sold / Net
   - Last 30 days trend
   - Identify seasonal patterns

5. Category Stock Analysis
   - Table: Category | Stock Value | Items Count | Turnover Rate
```

---

### **ORDERS ANALYTICS: /admin/analytics/orders**

```
Sections:
1. Order Metrics Cards
   - Total Orders
   - Average Fulfillment Time
   - Pending Orders
   - Cancellation Rate

2. Status Distribution
   - Pie chart: 6 different statuses
   - Table with counts and percentages

3. Daily Orders Trend
   - Bar chart showing orders per day (last 30 days)
   - Identify peak days
   - Helpful for inventory planning

4. Fulfillment Time Analysis
   - Histogram: Distribution of fulfillment times
   - Identify bottlenecks
   - Average days to deliver

5. Order Value Distribution
   - Histogram: Orders by value range
   - ₹0-500 | ₹500-1000 | ₹1000-2000 | ₹2000+
   - Understand customer purchasing patterns
```

---

### **CUSTOM REPORTS: /admin/analytics/reports**

```
Generate Custom Reports:

Dropdown selectors:
- Report Type: Sales / Products / Customers / Financial / Inventory
- Date Range: Start - End
- Group By: Daily / Weekly / Monthly
- Export Format: PDF / CSV / Excel

Available Reports:
1. Sales Report
   - All sales metrics for date range
   - Detailed breakdown by status
   - Exportable

2. Product Performance Report
   - Which products generated most revenue
   - Stock levels
   - Sales trends

3. Customer Report
   - All customer metrics
   - Segmentation
   - Top customers

4. Financial Report
   - Revenue, discounts, net revenue
   - Payment status breakdown
   - Tax/GST tracking (if applicable)

5. Inventory Report
   - Stock levels by category
   - Reorder recommendations
   - Stock movement analysis

Export Options:
✅ CSV (for Excel)
✅ PDF (for printing/sharing)
✅ JSON (for integration)
```

---

## 📊 CHARTS & VISUALIZATIONS

**Libraries to use:**
```
Frontend:
✅ Chart.js or Recharts (both work well)
✅ React Chart Component
✅ Icons from React Icons

Recommendation: Recharts
- Works great with React/Next.js
- ResponsiveContainer (mobile-friendly)
- Multiple chart types
- Easy tooltips and legends
```

**Chart Types:**

```
1. Line Chart - Revenue Trend
   └─ Best for: Time-series data

2. Pie Chart - Status Distribution
   └─ Best for: Showing percentages

3. Bar Chart - Category Comparison
   └─ Best for: Comparing categories

4. Area Chart - Cumulative Growth
   └─ Best for: Stacked data

5. Scatter Plot - Correlation Analysis
   └─ Best for: Finding relationships

6. Table - Detailed Data
   └─ Best for: Exact numbers & sorting
```

---

## 📋 REPORTS TYPES

### **TYPE 1: SALES REPORT** 
```
Content:
- Total Orders, Revenue, Avg Value
- Orders by Status breakdown
- Top 20 Products
- Revenue by Category
- Daily trend chart
- Payment status summary

Use Case: Weekly business review
Frequency: Weekly/Monthly
Owner: Admin/Accounts Manager
```

### **TYPE 2: PRODUCT PERFORMANCE REPORT**
```
Content:
- Top 10 bestsellers
- Bottom 10 slow movers
- Stock analysis
- Category performance
- Inventory value
- Reorder recommendations

Use Case: Inventory planning
Frequency: Weekly/Monthly
Owner: Procurement/Warehouse Manager
```

### **TYPE 3: CUSTOMER INSIGHTS REPORT**
```
Content:
- Total customers, new, active
- Top 20 valuable customers
- Repeat purchase analysis
- Regional breakdown
- Customer growth trend
- Churn analysis

Use Case: Marketing/customer targeting
Frequency: Monthly
Owner: Admin
```

### **TYPE 4: FINANCIAL SUMMARY**
```
Content:
- Revenue, costs, profit
- Payment collection status
- Pending payments
- Discount impact
- Month-on-month comparison

Use Case: Financial planning
Frequency: Monthly
Owner: Accounts Manager/Finance
```

### **TYPE 5: INVENTORY STATUS REPORT**
```
Content:
- Total stock value
- Low stock items
- Out of stock items
- Slow moving items
- Fast moving items
- Stock by category

Use Case: Reorder planning
Frequency: Weekly
Owner: Store/Warehouse Manager
```

---

## 🚀 IMPLEMENTATION STEPS

### **PHASE 1: Backend Setup (2-3 hours)**

**Step 1: Create Analytics Controller**
```
File: backend/src/controllers/analyticsController.ts

Methods to create:
- getSalesOverview()     - Total orders, revenue, avg value
- getSalesTrend()        - Revenue by date
- getTopProducts()       - Best sellers
- getProductSummary()    - Total, active, out-of-stock
- getCustomerSummary()   - Total, new, active customers
- getFinancialSummary()  - Revenue, discounts, net revenue
- getInventorySummary()  - Stock value, low stock items
- getOrdersSummary()     - Order counts by status
- getLowStockProducts()  - Products needing reorder
- getTopCustomers()      - Most valuable customers
```

**Step 2: Create Analytics Routes**
```
File: backend/src/routes/analytics.ts

Routes:
GET  /api/analytics/sales/overview
GET  /api/analytics/sales/trend
GET  /api/analytics/sales/top-products
GET  /api/analytics/products/summary
GET  /api/analytics/products/low-stock
GET  /api/analytics/customers/summary
GET  /api/analytics/customers/top-customers
GET  /api/analytics/financial/summary
GET  /api/analytics/inventory/summary
GET  /api/analytics/orders/summary
GET  /api/analytics/reports/export  (for CSV/PDF export)
```

---

### **PHASE 2: Frontend Setup (2-3 hours)**

**Step 1: Create API Client**
```
File: frontend/src/lib/api.ts (add analyticsAPI)

Methods:
analyticsAPI.getSalesOverview()
analyticsAPI.getSalesTrend()
analyticsAPI.getTopProducts()
analyticsAPI.getProductSummary()
analyticsAPI.getCustomerSummary()
analyticsAPI.getFinancialSummary()
analyticsAPI.getInventorySummary()
analyticsAPI.getOrdersSummary()
...
```

**Step 2: Create Dashboard Pages**
```
/admin/analytics/dashboard       - Main dashboard
/admin/analytics/sales           - Sales metrics
/admin/analytics/products        - Product analytics
/admin/analytics/customers       - Customer analytics
/admin/analytics/financial       - Financial metrics
/admin/analytics/inventory       - Inventory analytics
/admin/analytics/orders          - Order analytics
/admin/analytics/reports         - Custom reports
```

**Step 3: Create Reusable Components**
```
Components:
- MetricCard.tsx         - Show KPI cards
- LineChart.tsx          - Recharts line chart
- PieChart.tsx           - Recharts pie chart
- BarChart.tsx           - Recharts bar chart
- DataTable.tsx          - Sortable/paginated table
- DateRangeFilter.tsx    - Start/end date selector
- ExportButton.tsx       - CSV/PDF export
```

---

### **PHASE 3: Integration & Polish (1-2 hours)**

**Step 1: Add Navigation**
```
Update /admin/layout.tsx sidebar with Analytics link
Create navigation menu for analytics sub-pages
```

**Step 2: Add Real Data**
```
Make API calls to backend
Populate charts with real data
Test with actual database
```

**Step 3: Add Export Functionality**
```
CSV export for all reports
PDF generation (use jsPDF library)
Email reports functionality (later)
```

---

## 📅 BUILD TIMELINE

### **Day 1: Backend (4 hours)**
```
Session 1 (2 hours):
- Create analyticsController.ts with methods
- Implement aggregation pipelines
- Handle date filtering

Session 2 (2 hours):
- Create analytics routes
- Test API endpoints with Postman
- Add error handling
```

### **Day 2: Frontend (4 hours)**
```
Session 1 (2 hours):
- Create analyticsAPI in lib/api.ts
- Create dashboard page
- Create metric cards component

Session 2 (2 hours):
- Create chart components
- Integrate real API data
- Add date range filtering
```

### **Day 3: Pages & Polish (2 hours)**
```
- Create individual analytics pages (sales, products, customers)
- Add export functionality
- Polish UI and responsive design
- Test on mobile
```

---

## 📊 QUICK REFERENCE: What Goes Where

### **Backend (Node.js/Express)**
```
Models: Use existing (Order, Product, User, Address)
Controllers: analyticsController.ts (aggregation logic)
Routes: analytics.ts (API endpoints)
Utilities: Optional - aggregation helpers
```

### **Frontend (Next.js/React)**
```
Pages: /admin/analytics/* (dashboard, sales, products, etc.)
Components: MetricCard, Chart, Table, Filter
API Client: lib/api.ts (analyticsAPI methods)
State: Zustand for filters (or local state)
```

### **Database (MongoDB)**
```
No new collections needed!
Uses existing: orders, products, users, addresses
Aggregation: On-the-fly using aggregation pipeline
Indexing: May need indexes on frequently queried fields
```

---

## ✅ SUCCESS CRITERIA

**When analytics is complete, you should:**
```
✅ See total revenue, orders, customers on dashboard
✅ View charts showing trends (6 months)
✅ See which products are best sellers
✅ Know which customers are most valuable
✅ See low stock items that need reorder
✅ Export reports as CSV/PDF
✅ Filter data by date range
✅ View data by category/status/region
✅ All pages load in <2 seconds
✅ Mobile responsive design
```

---

## 🎓 LEARNING VALUE

By building this system, you'll learn:
```
✅ MongoDB aggregation pipelines (advanced)
✅ Data analysis & business metrics
✅ Chart libraries (Recharts)
✅ State management with filters
✅ CSV/PDF export functionality
✅ Performance optimization (caching, indexing)
✅ Date handling in databases
✅ API design for analytics
```

---

## 🔧 TECH STACK FOR ANALYTICS

**Backend:**
```
✅ Express.js (already have)
✅ MongoDB Aggregation (no new package)
✅ TypeScript (already have)
```

**Frontend:**
```
✅ Next.js (already have)
✅ Recharts (npm install recharts)
✅ React Icons (already have)
✅ TailwindCSS (already have)
```

**Optional (for PDF export):**
```
jsPDF (npm install jspdf)
html2canvas (npm install html2canvas)
Or use server-side: puppeteer
```

---

## 🎯 READY TO START?

This analytics system will give you:
✅ Real business insights
✅ Data-driven decision making
✅ Professional management dashboard
✅ Beautiful charts & reports
✅ Export capability

**Estimated Total Time:** 6-8 hours  
**Complexity:** Medium (intermediate MongoDB + React)  
**Value:** High (essential for running business)

---

**Next Step:** Ready to build Phase 1 - Backend analytics controller?

Would you like to start implementing now? I'll:
1. Create analyticsController.ts with all methods
2. Create analytics routes
3. Test all endpoints
4. Then move to frontend
