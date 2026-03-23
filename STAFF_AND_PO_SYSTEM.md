# 🏢 STAFF & PURCHASE ORDER MANAGEMENT SYSTEM
**Plants Mall - Complete Implementation Guide**

**Status:** Planning Phase  
**Last Updated:** 14 March 2026  
**Version:** 1.0

---

## 📑 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [How Everything Works Together](#how-everything-works-together)
3. [Staff Roles & Permissions](#staff-roles--permissions)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Frontend Pages](#frontend-pages)
7. [Purchase Order Workflow](#purchase-order-workflow)
8. [Implementation Phases](#implementation-phases)
9. [Simple Step-by-Step Guide](#simple-step-by-step-guide)

---

## 🎯 SYSTEM OVERVIEW

This system manages:
- **👥 Employee Management** - Staff, roles, permissions, departments
- **📦 Purchase Orders** - Ordering inventory from suppliers
- **📋 Goods Receipt** - Receiving and verifying ordered items
- **💳 Invoice & Payment** - Tracking bills and payments to suppliers
- **📊 Approval Workflow** - Multi-level approvals for purchases

**Why?** To automate and control how the company buys inventory, who approves what, and track payments.

---

## 🔄 HOW EVERYTHING WORKS TOGETHER

### **The Complete Flow:**

```
1. WAREHOUSE SEES LOW STOCK
   ↓
2. WAREHOUSE MANAGER RAISES PURCHASE REQUEST
   "We need 100 Monstera plants"
   ↓
3. PROCUREMENT OFFICER CREATES PURCHASE ORDER
   "Sending to Supplier ABC"
   ↓
4. ACCOUNTS MANAGER APPROVES (Checks Budget)
   "Yes, we have ₹50,000 budget. Approved!"
   ↓
5. PO SENT TO SUPPLIER
   Supplier receives and confirms
   ↓
6. GOODS ARRIVE AT WAREHOUSE
   ↓
7. STORE MANAGER CREATES GOODS RECEIPT NOTE (GRN)
   "Received 100 plants. All good condition"
   ↓
8. SUPPLIER SENDS INVOICE
   "You owe me ₹15,000 + GST"
   ↓
9. ACCOUNTS MANAGER REVIEWS INVOICE
   Checks if GRN matches Invoice
   ↓
10. FINANCE OFFICER PROCESSES PAYMENT
    "Paying ₹17,700 by bank transfer"
    ↓
11. PAYMENT DONE ✅
    Complete!
```

**In Simple Words:**
- Stock Low → Request → Create Order → Boss Approves → Order Sent → Goods Arrive → Verify & Note → Bill Comes → Check Bill → Pay → Done

---

## 👥 STAFF ROLES & PERMISSIONS

### **1. ADMIN** 🔴
**What they do:** Everything. Overall boss.
```
✅ Create/Edit/Delete staff
✅ Create/Edit/Delete suppliers
✅ Approve POs
✅ View all reports
✅ Manage permissions
✅ Access all modules
```

---

### **2. PROCUREMENT OFFICER** 📦
**What they do:** Creates purchase orders

```
✅ View suppliers
✅ Create Purchase Orders
✅ Track PO status
✅ Update delivery status
✅ View products to order
❌ Cannot: Approve POs, Pay bills, Change prices
```

**Example Action:**
- "Monstera stock is low. I'll create a PO for 100 units from Supplier ABC"

---

### **3. ACCOUNTS MANAGER** 💰
**What they do:** Approves budgets and payments

```
✅ View POs waiting for approval
✅ Approve/Reject POs (checks budget)
✅ View invoices
✅ Verify invoice vs GRN vs PO match
✅ View payment reports
❌ Cannot: Create POs, Create staff, Delete anything
```

**Example Action:**
- "This PO costs ₹15,000. Budget available is ₹50,000. APPROVED!"

---

### **4. STORE/WAREHOUSE MANAGER** 📍
**What they do:** Receives and verifies goods

```
✅ View incoming POs
✅ Create Goods Receipt Notes (GRN)
✅ Check received items
✅ Mark damaged items
✅ Update inventory
❌ Cannot: Create POs, Approve anything, Process payments
```

**Example Action:**
- "100 plants arrived. 98 good condition, 2 damaged. Creating GRN."

---

### **5. INVENTORY MANAGER** 📊
**What they do:** Monitors stock levels

```
✅ View current stock
✅ Raise purchase requests
✅ Generate stock reports
✅ Forecast demand
❌ Cannot: Create POs directly, Approve anything
```

**Example Action:**
- "Monstera stock is 5 units. Need 100 more. Creating request."

---

### **6. FINANCE OFFICER** 🏦
**What they do:** Processes payments

```
✅ View invoices
✅ Create payment records
✅ Generate payment reports
✅ View payment history
❌ Cannot: Approve POs, Change invoice amounts
```

**Example Action:**
- "Invoice approved. Paying ₹17,700 via bank transfer."

---

### **7. DELIVERY BOY / LOGISTICS** 🚚
**What they do:** Tracks shipments (optional)

```
✅ View orders to be delivered
✅ Update delivery status
✅ Add delivery notes
❌ Cannot: Modify orders, Create invoices
```

---

## 🗄️ DATABASE MODELS

### **1. ENHANCED STAFF MODEL**

**File:** `backend/src/models/Staff.ts` (NEW)

```typescript
Staff {
  _id: ObjectId
  
  // Personal Info
  name: String (required)
  email: String (required, unique)
  phone: String (10 digits)
  address: String
  dateOfBirth: Date
  profilePhoto: String (URL)
  
  // Employment Info
  staffId: String (auto-generated like "STF-2603-001")
  role: String (enum: "admin", "procurement", "accounts_manager", "store_manager", "inventory_manager", "finance", "delivery")
  department: String (enum: "Procurement", "Finance", "Warehouse", "Admin", "Logistics")
  position: String (e.g., "Senior Manager", "Officer")
  joiningDate: Date
  
  // Salary & Bank (Optional)
  salary: Number
  bankAccount: String
  bankIFSC: String
  
  // Reporting
  reportingTo: ObjectId (reference to another Staff - their manager)
  
  // Permissions (controlled by role)
  permissions: [String] (e.g., ["can_create_po", "can_approve_po"])
  
  // Status
  isActive: Boolean (default: true)
  status: String (enum: "active", "inactive", "on_leave", "terminated")
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId (which admin created this)
}
```

**Example Data:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@plants.com",
  "phone": "9876543210",
  "staffId": "STF-2603-001",
  "role": "procurement",
  "department": "Procurement",
  "position": "Senior Procurement Officer",
  "joiningDate": "2024-01-15",
  "reportingTo": "admin_id_123",
  "isActive": true,
  "permissions": ["can_create_po", "can_view_suppliers"]
}
```

---

### **2. PURCHASE ORDER MODEL**

**File:** `backend/src/models/PurchaseOrder.ts` (NEW)

```typescript
PurchaseOrder {
  _id: ObjectId
  
  // PO Identification
  poNumber: String (auto-generated like "PO-2603-00001")
  vendor: String (name/id from suppliers list)
  
  // Who created/approved it
  createdBy: ObjectId (reference to Staff - Procurement Officer)
  approvedBy: ObjectId (reference to Staff - Accounts Manager, nullable initially)
  
  // Line Items (products being ordered)
  lineItems: [
    {
      productId: ObjectId (reference to Product)
      productName: String
      quantity: Number
      unitOfMeasure: String (enum: "pieces", "kg", "liter", "box")
      unitPrice: Number
      totalPrice: Number (quantity × unitPrice)
      description: String
    }
  ]
  
  // Amounts
  subtotal: Number
  taxRate: Number (percentage like 5, 18)
  taxAmount: Number
  totalAmount: Number (subtotal + tax)
  
  // Delivery Info
  expectedDeliveryDate: Date
  deliveryAddress: String
  
  // Payment Terms
  paymentTerms: String (enum: "COD", "Net 30", "Net 60", "Advance")
  paymentMethod: String (enum: "Bank Transfer", "Cheque", "UPI", "Cash")
  
  // Notes & References
  notes: String (special instructions)
  internalNotes: String (notes for staff only)
  referenceNumber: String (e.g., PR-2603-001 if from purchase request)
  
  // Status Tracking
  status: String (enum: "DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "INVOICED", "PAID", "CANCELLED")
  
  // Key Dates
  createdAt: Date
  approvedAt: Date (when accounts manager approved)
  sentAt: Date (when sent to supplier)
  deliveredAt: Date (when goods received)
  
  // Tracking
  isUrgent: Boolean (flag for quick processing)
  archived: Boolean (default: false)
}
```

**Example Data:**
```json
{
  "poNumber": "PO-2603-00001",
  "vendor": "Supplier ABC Plants",
  "createdBy": "STF-2603-001",
  "approvedBy": null,
  "lineItems": [
    {
      "productName": "Monstera Deliciosa",
      "quantity": 100,
      "unitOfMeasure": "pieces",
      "unitPrice": 150,
      "totalPrice": 15000
    }
  ],
  "subtotal": 15000,
  "taxRate": 18,
  "taxAmount": 2700,
  "totalAmount": 17700,
  "expectedDeliveryDate": "2026-03-21",
  "paymentTerms": "Net 30",
  "status": "PENDING_APPROVAL",
  "createdAt": "2026-03-14"
}
```

---

### **3. GOODS RECEIPT NOTE (GRN) MODEL**

**File:** `backend/src/models/GoodsReceiptNote.ts` (NEW)

```typescript
GoodsReceiptNote {
  _id: ObjectId
  
  // GRN Identification
  grnNumber: String (auto-generated like "GRN-2603-001")
  poId: ObjectId (reference to PurchaseOrder)
  poNumber: String (copy for easy reference)
  
  // Who received it
  receivedBy: ObjectId (reference to Staff - Store Manager)
  receivedDate: Date
  
  // What was received
  lineItems: [
    {
      productId: ObjectId
      productName: String
      orderedQuantity: Number
      receivedQuantity: Number
      damagedQuantity: Number
      shortageQuantity: Number
      qualityStatus: String (enum: "OK", "DAMAGED", "SHORTAGE")
      remarks: String (notes about issues)
    }
  ]
  
  // Overall Status
  status: String (enum: "RECEIVED", "VERIFIED", "REJECTED")
  rejectionReason: String (if status is REJECTED)
  
  // Verification
  verifiedBy: ObjectId (supervisor who verified)
  verifiedAt: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Example Data:**
```json
{
  "grnNumber": "GRN-2603-001",
  "poNumber": "PO-2603-00001",
  "receivedBy": "STF-2603-004",
  "receivedDate": "2026-03-21",
  "lineItems": [
    {
      "productName": "Monstera Deliciosa",
      "orderedQuantity": 100,
      "receivedQuantity": 98,
      "damagedQuantity": 2,
      "shortageQuantity": 0,
      "qualityStatus": "DAMAGED",
      "remarks": "2 plants damaged in transit"
    }
  ],
  "status": "VERIFIED",
  "verifiedBy": "STF-2603-005"
}
```

---

### **4. SUPPLIER INVOICE MODEL**

**File:** `backend/src/models/SupplierInvoice.ts` (NEW)

```typescript
SupplierInvoice {
  _id: ObjectId
  
  // Invoice Identification
  invoiceNumber: String (from supplier - required)
  poId: ObjectId (reference to PurchaseOrder)
  poNumber: String
  vendor: String
  
  // Invoice Details
  invoiceDate: Date
  dueDate: Date
  
  // Amounts
  subtotal: Number
  taxRate: Number
  taxAmount: Number
  totalAmount: Number
  
  // Payment Info
  paymentTerms: String (e.g., "Net 30")
  
  // GRN Matching
  grnId: ObjectId (reference to GoodsReceiptNote)
  grnMatched: Boolean (has GRN been matched?)
  
  // 3-Way Matching Status
  // Match: PO amount = GRN received = Invoice amount (should match)
  matchingStatus: String (enum: "NOT_MATCHED", "MATCHED", "DISCREPANCY")
  discrepancyNotes: String (if not matched)
  
  // Status
  status: String (enum: "PENDING", "PARTIALLY_PAID", "PAID", "CANCELLED")
  
  // Received By
  receivedAt: Date (when invoice received)
  receivedBy: String (email of person who uploaded)
  
  // Timestamps
  createdAt: Date
}
```

**Example Data:**
```json
{
  "invoiceNumber": "INV-S123-2603",
  "poNumber": "PO-2603-00001",
  "vendor": "Supplier ABC Plants",
  "invoiceDate": "2026-03-21",
  "dueDate": "2026-04-20",
  "subtotal": 15000,
  "taxRate": 18,
  "taxAmount": 2700,
  "totalAmount": 17700,
  "grnNumber": "GRN-2603-001",
  "matchingStatus": "MATCHED",
  "status": "PENDING",
  "receivedAt": "2026-03-22"
}
```

---

### **5. PAYMENT RECORD MODEL**

**File:** `backend/src/models/Payment.ts` (NEW)

```typescript
Payment {
  _id: ObjectId
  
  // Payment Identification
  paymentId: String (auto-generated like "PAY-2603-001")
  invoiceId: ObjectId (reference to SupplierInvoice)
  invoiceNumber: String
  
  // Payment Details
  amountPaid: Number
  paymentDate: Date
  dueDate: Date (from invoice)
  
  // Payment Method
  paymentMode: String (enum: "NEFT", "RTGS", "CHEQUE", "UPI", "CASH")
  referenceNumber: String (e.g., NEFT transaction ID, cheque number)
  bankName: String
  
  // Who processed it
  processedBy: ObjectId (reference to Staff - Finance Officer)
  
  // Status
  status: String (enum: "PENDING", "PROCESSING", "SUCCESS", "FAILED", "RETURNED")
  failureReason: String (if status is FAILED)
  
  // Notes
  notes: String
  
  // Timestamps
  createdAt: Date
  completedAt: Date (when payment went through)
}
```

**Example Data:**
```json
{
  "paymentId": "PAY-2603-001",
  "invoiceNumber": "INV-S123-2603",
  "amountPaid": 17700,
  "paymentDate": "2026-03-28",
  "paymentMode": "NEFT",
  "referenceNumber": "NEFT202603280001",
  "bankName": "HDFC Bank",
  "processedBy": "STF-2603-006",
  "status": "SUCCESS",
  "completedAt": "2026-03-28"
}
```

---

### **6. SUPPLIER MODEL**

**File:** `backend/src/models/Supplier.ts` (NEW)

```typescript
Supplier {
  _id: ObjectId
  
  // Basic Info
  supplierName: String (required)
  registrationName: String (official company name)
  
  // Contact Details
  email: String
  phone: String (primary contact)
  alternatePhone: String
  
  // Address
  address: String
  city: String
  state: String
  pincode: String
  
  // Tax Info
  panNumber: String
  gstNumber: String
  
  // Banking Details
  bankAccountNumber: String
  bankName: String
  bankIFSC: String
  
  // Product Categories
  productCategories: [String] (e.g., ["Indoor Plants", "Outdoor Plants"])
  
  // Terms
  defaultPaymentTerms: String (e.g., "Net 30")
  minOrderValue: Number
  leadTime: Number (in days - how long delivery takes)
  
  // Rating & Performance
  rating: Number (1-5 stars)
  totalOrders: Number
  onTimeDeliveryRate: Number (percentage)
  qualityRate: Number (percentage)
  
  // Status
  isActive: Boolean (can we order from them?)
  
  // Primary Contact Person
  contactPerson: String
  contactDesignation: String
  contactPhone: String
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Example Data:**
```json
{
  "supplierName": "Supplier ABC Plants",
  "registrationName": "ABC Plants Pvt Ltd",
  "email": "contact@abcplants.com",
  "phone": "9876543210",
  "gstNumber": "18AABCU1234H1Z0",
  "productCategories": ["Indoor Plants", "Outdoor Plants"],
  "defaultPaymentTerms": "Net 30",
  "minOrderValue": 5000,
  "leadTime": 7,
  "rating": 4.5,
  "totalOrders": 25,
  "onTimeDeliveryRate": 95,
  "isActive": true
}
```

---

## 🔌 API ENDPOINTS

### **STAFF MANAGEMENT APIs**

```
// Create staff
POST /api/staff
Body: { name, email, phone, role, department, salary, ... }
Returns: { staffId, name, email, ... }
Auth: Admin only

// Get all staff
GET /api/staff?role=procurement&department=Finance&search=rajesh
Returns: { staff: [], pagination: {} }
Auth: Admin, Accounts Manager

// Get staff details
GET /api/staff/:id
Returns: { staff: { ...full details } }
Auth: Admin, their own profile

// Update staff
PUT /api/staff/:id
Body: { name, phone, department, ... }
Returns: { message, staff }
Auth: Admin, self

// Delete staff
DELETE /api/staff/:id
Auth: Admin only

// Update staff status (active/inactive)
PATCH /api/staff/:id/status
Body: { status: "active" or "inactive" }
Auth: Admin only

// Reset staff password
PATCH /api/staff/:id/password
Body: { newPassword }
Auth: Admin only
```

---

### **PURCHASE ORDER APIs**

```
// Create PO
POST /api/purchase-orders
Body: {
  vendor,
  lineItems: [...],
  expectedDeliveryDate,
  paymentTerms,
  notes,
  ...
}
Returns: { poNumber, status: "DRAFT", ... }
Auth: Procurement Officer

// Get all POs
GET /api/purchase-orders?status=PENDING_APPROVAL&vendor=ABC
Returns: { pos: [...], pagination: {} }
Auth: All staff (filtered by role)

// Get PO details
GET /api/purchase-orders/:id
Returns: { po: { ...full details } }
Auth: All staff

// Update PO (can only update DRAFT ones)
PUT /api/purchase-orders/:id
Body: { lineItems, expectedDeliveryDate, ... }
Returns: { message, po }
Auth: Procurement Officer who created it

// Submit PO for approval
PATCH /api/purchase-orders/:id/submit
Returns: { status: "PENDING_APPROVAL", ... }
Auth: Procurement Officer

// Approve PO (by Accounts Manager)
PATCH /api/purchase-orders/:id/approve
Body: { approverComments: "Approved. Budget sufficient." }
Returns: { status: "APPROVED", approvedBy, approvedAt }
Auth: Accounts Manager

// Reject PO
PATCH /api/purchase-orders/:id/reject
Body: { rejectionReason: "Budget not available" }
Returns: { status: "REJECTED", ... }
Auth: Accounts Manager

// Cancel PO
PATCH /api/purchase-orders/:id/cancel
Body: { cancellationReason: "... }
Auth: Procurement Officer, Accounts Manager

// Delete PO (only DRAFT status)
DELETE /api/purchase-orders/:id
Auth: Procurement Officer who created it
```

---

### **GOODS RECEIPT NOTE APIs**

```
// Create GRN
POST /api/grn
Body: {
  poId,
  lineItems: [...received details...],
  receivedDate,
  ...
}
Returns: { grnNumber, status: "RECEIVED", ... }
Auth: Store Manager

// Get all GRNs
GET /api/grn?status=VERIFIED&poNumber=PO-2603-00001
Returns: { grns: [...], pagination: {} }
Auth: Store Manager, Accounts Manager

// Get GRN details
GET /api/grn/:id
Returns: { grn: { ...full details } }
Auth: Store Manager, Accounts Manager

// Update GRN (before verification)
PUT /api/grn/:id
Body: { lineItems, receivedDate, ... }
Auth: Store Manager who created it

// Verify GRN (mark as verified)
PATCH /api/grn/:id/verify
Body: { verifierComments: "..." }
Returns: { status: "VERIFIED", verifiedBy, verifiedAt }
Auth: Supervisor/Manager
```

---

### **SUPPLIER INVOICE APIs**

```
// Create/Upload Invoice
POST /api/invoices
Body: {
  invoiceNumber,
  poId,
  vendor,
  invoiceDate,
  dueDate,
  totalAmount,
  ...
}
Returns: { invoiceId, status: "PENDING", ... }
Auth: Accounts Manager

// Get all invoices
GET /api/invoices?status=PENDING&vendor=ABC&dueDate=2026-04
Returns: { invoices: [...], pagination: {} }
Auth: Accounts Manager, Finance Officer

// Get invoice details
GET /api/invoices/:id
Returns: { invoice: { ...full details, matchingStatus, ... } }
Auth: Accounts Manager, Finance Officer

// Match invoice with GRN and PO (3-way match)
PATCH /api/invoices/:id/match-grn
Body: { grnId }
Returns: { matchingStatus: "MATCHED" or "DISCREPANCY", ... }
Auth: Accounts Manager

// Approve invoice for payment
PATCH /api/invoices/:id/approve
Body: { approvalComments: "..." }
Returns: { status: "APPROVED", ... }
Auth: Accounts Manager

// Update invoice status
PATCH /api/invoices/:id/status
Body: { status: "PARTIALLY_PAID" or "PAID" }
Auth: Finance Officer
```

---

### **PAYMENT RECORD APIs**

```
// Create payment record
POST /api/payments
Body: {
  invoiceId,
  amountPaid,
  paymentDate,
  paymentMode,
  referenceNumber,
  ...
}
Returns: { paymentId, status: "SUCCESS", ... }
Auth: Finance Officer

// Get all payments
GET /api/payments?status=SUCCESS&month=2026-03
Returns: { payments: [...], pagination: {} }
Auth: Finance Officer, Accounts Manager

// Get payment details
GET /api/payments/:id
Returns: { payment: { ...full details } }
Auth: Finance Officer, Accounts Manager

// Mark payment as completed
PATCH /api/payments/:id/complete
Body: { transactionId: "...", completedAt: Date }
Returns: { status: "SUCCESS", completedAt, ... }
Auth: Finance Officer

// Get payment report
GET /api/payments/reports/summary?month=2026-03
Returns: { totalPayments, totalAmount, avgPaymentTime, ... }
Auth: Finance Officer, Accounts Manager
```

---

### **SUPPLIER APIs**

```
// Create supplier
POST /api/suppliers
Body: { supplierName, email, phone, gstNumber, ... }
Auth: Admin

// Get all suppliers
GET /api/suppliers?search=ABC&active=true
Returns: { suppliers: [...] }
Auth: Procurement Officer, Accounts Manager

// Get supplier details
GET /api/suppliers/:id
Returns: { supplier: { ...with performance metrics } }
Auth: All staff

// Update supplier
PUT /api/suppliers/:id
Auth: Admin

// Delete supplier
DELETE /api/suppliers/:id
Auth: Admin

// Get supplier performance metrics
GET /api/suppliers/:id/performance
Returns: { onTimeDeliveryRate, qualityRate, totalOrders, rating }
Auth: Procurement Officer
```

---

## 🎨 FRONTEND PAGES

### **For ADMIN**

```
/admin/staff
├── Staff List (Table view with all staff)
├── Add Staff (Form to create new staff)
├── Edit Staff (Update staff details)
├── View Staff (See complete profile)
└── Manage Permissions (Control what they can do)

/admin/suppliers
├── Supplier List
├── Add Supplier
├── Edit Supplier
├── Supplier Performance
└── Supplier Analysis

/admin/settings
└── Configure system settings
```

---

### **For PROCUREMENT OFFICER**

```
/admin/purchase-orders
├── My POs (List of POs I created)
├── Create PO
│   ├── Select Vendor
│   ├── Add Line Items
│   ├── Set Delivery Date
│   ├── Add Notes
│   └── Save as Draft / Submit for Approval
├── View PO Details
├── Track PO Status
└── Update Delivery Status

/admin/suppliers
├── Supplier List
├── Supplier Details
└── Supplier Performance Metrics
```

---

### **For ACCOUNTS MANAGER**

```
/admin/po-approvals
├── Pending POs (List waiting for approval)
├── PO Details
│   ├── Line Items
│   ├── Total Amount
│   ├── Budget Check (Available budget)
│   ├── Approve / Reject Button
│   └── Add Comments
└── Approved POs History

/admin/invoices
├── Pending Invoices (List waiting for payment)
├── Invoice Details
│   ├── Compare with PO
│   ├── Compare with GRN (3-way match)
│   ├── Check discrepancies
│   ├── Approve for Payment
│   └── Add Notes
└── Paid Invoices History

/admin/reports/budget
├── Budget Utilization
├── Spending by Department
├── Spending by Supplier
└── Budget vs Actual

/admin/reports/spending
├── Total Spending
├── Pending Payments
├── Supplier-wise Spending
└── Category-wise Spending
```

---

### **For STORE/WAREHOUSE MANAGER**

```
/admin/goods-receipt
├── Incoming Orders (List of POs to receive)
├── Create GRN
│   ├── Select PO
│   ├── Enter Received Quantities
│   ├── Mark Damaged Items
│   ├── Add Remarks
│   └── Save GRN
├── View GRN List
├── Edit GRN (before verification)
└── GRN History

/admin/inventory
├── Current Stock Levels
├── Low Stock Alert
└── Stock Movement
```

---

### **For FINANCE OFFICER**

```
/admin/payments
├── Invoices Pending Payment
├── Create Payment
│   ├── Select Invoice
│   ├── Enter Amount
│   ├── Select Payment Mode (NEFT, Cheque, etc.)
│   ├── Enter Reference Number
│   └── Submit
├── Payment List
├── Payment History
└── Update Payment Status (when cleared)

/admin/reports/payments
├── Payment Summary
├── Pending Payments
├── Payment by Mode
└── Supplier-wise Payments
```

---

### **For ALL STAFF (Common Pages)**

```
/admin/dashboard
└── Quick Stats (Pending POs, Invoices, Payments)

/admin/profile
├── My Profile
├── Change Password
└── Update Contact

/admin/notifications
└── System alerts (New PO awaiting approval, etc.)
```

---

## 📦 PURCHASE ORDER WORKFLOW

### **STEP-BY-STEP PROCESS**

#### **STEP 1: Warehouse Needs Stock**
```
Who: Inventory Manager or Warehouse Manager
Action: Identifies low stock
Tool: Inventory Dashboard or Manual check

Example:
"Monstera stock is only 5 units.
We normally keep 100. Need to order."

Output: Mental note or informal request
```

---

#### **STEP 2: Create Purchase Request (Optional)**
```
Who: Inventory Manager
Action: Formally request procurement to create PO

Request Details:
- Product needed
- Quantity
- Reason (Low stock/New product)
- Required by date

Status: PENDING (waiting for procurement to act)
```

---

#### **STEP 3: Procurement Creates PO**
```
Who: Procurement Officer
Tool: /admin/purchase-orders → "Create PO"
Action: Creates formal purchase order

Form fills:
1. Select Supplier (from dropdown)
2. Add Line Items:
   - Product: Monstera Deliciosa
   - Quantity: 100
   - Unit Price: ₹150 (from supplier)
   - Subtotal: ₹15,000
3. Set Delivery Date: 7 days
4. Payment Terms: Net 30
5. Delivery Address
6. Notes: "Urgent order"

System Auto-calculates:
- Subtotal: ₹15,000
- Tax (18%): ₹2,700
- Total: ₹17,700

Status: DRAFT (not yet submitted)
```

---

#### **STEP 4: Submit for Approval**
```
Who: Procurement Officer
Action: Clicks "Submit for Approval"

System:
- Changes status to: PENDING_APPROVAL
- Notifies Accounts Manager
- Email: "PO-2603-00001 waiting for your approval"

Status: PENDING_APPROVAL (waiting for finance approval)
```

---

#### **STEP 5: Accounts Manager Reviews & Approves**
```
Who: Accounts Manager
Tool: /admin/po-approvals

Checks:
1. Is this a known supplier? ✓
2. What's the total? ₹17,700
3. Do we have budget? 
   - Annual Budget: ₹50,000
   - Already Spent: ₹32,000
   - Remaining: ₹18,000
   - This PO: ₹17,700
   - Left After: ₹300 ✓

Action: Click "APPROVE" button
Adds comment: "Approved. Budget sufficient."

System:
- Changes status to: APPROVED
- Notifies Procurement Officer
- Sends PO to supplier (email/automated)

Status: APPROVED
```

---

#### **STEP 6: PO Sent to Supplier**
```
Who: System (automated)
Action: Sends email to supplier with PO details

Email contains:
- PO Number: PO-2603-00001
- Order Details: 100 Monstera plants @ ₹150 each
- Total: ₹17,700
- Delivery Date: 21 March 2026
- Payment Terms: Net 30

Supplier Action: Confirms and starts packing

Status: SENT
```

---

#### **STEP 7: Goods Arrive at Warehouse**
```
Date: 21 March 2026
Who: Warehouse Staff receives shipment
Action: Goods delivered and kept in receiving area

What's in the box:
- 100 Monstera plants
- Packing list attached
- Invoice might be included

Status: RECEIVED (goods physically received)
```

---

#### **STEP 8: Store Manager Creates GRN**
```
Who: Store/Warehouse Manager
Tool: /admin/goods-receipt → "Create GRN"

Action:
1. Select PO: PO-2603-00001
2. For each item, enter:
   - Ordered: 100
   - Received: 98
   - Damaged: 2
   - Remarks: "2 plants damaged during transport"
3. Click "Save GRN"

System:
- Creates GRN number: GRN-2603-001
- Updates PO status to: RECEIVED
- Notifies Accounts Manager

Status: RECEIVED (in GRN system)
```

---

#### **STEP 9: Supervisor Verifies GRN**
```
Who: Supervisor/Warehouse Manager
Action: Reviews GRN and marks as verified

Checks:
- Are quantity discrepancies reasonable?
- Are damaged items documented?
- Is quality acceptable?

Action: Click "Verify"

System:
- GRN Status: VERIFIED
- Now ready for invoice matching

Status: VERIFIED
```

---

#### **STEP 10: Supplier Sends Invoice**
```
Date: 21-22 March 2026
Who: Supplier
Action: Sends invoice for the order

Invoice Details:
- Invoice Number: INV-S123-2603
- PO Reference: PO-2603-00001
- Date: 21 March 2026
- Items: 100 Monstera @ ₹150 = ₹15,000
- GST (18%): ₹2,700
- Total Due: ₹17,700
- Due Date: 20 April 2026 (Net 30)

Supplier sends: Email + PDF

Status: INVOICE RECEIVED
```

---

#### **STEP 11: Accounts Manager Receives & Matches Invoice**
```
Who: Accounts Manager
Tool: /admin/invoices → "Create Invoice" or upload

Action:
1. Enters invoice details
2. System shows comparison:

   ┌─────────────────────────────┐
   │ 3-WAY MATCHING              │
   ├─────────────────────────────┤
   │ PO Amount:     ₹17,700      │
   │ GRN Received:  98 units ✓   │
   │ Invoice Amount:₹17,700      │
   │ Status:        MATCHED ✓    │
   └─────────────────────────────┘

3. If discrepancies exist:
   - PO said ₹15,000 but invoice ₹15,500?
   - Quantity mismatch?
   - Show DISCREPANCY flag

Action: Click "Approve for Payment"

System:
- Invoice Status: PENDING PAYMENT
- Notifies Finance Officer

Status: APPROVED (ready to pay)
```

---

#### **STEP 12: Finance Officer Processes Payment**
```
Who: Finance Officer
Tool: /admin/payments → "Create Payment"

Action:
1. Select invoice: INV-S123-2603
2. Enter Payment Details:
   - Amount: ₹17,700
   - Payment Mode: NEFT (Bank Transfer)
   - Bank: HDFC
   - Reference: NEFT202603280001
   - Date: 28 March 2026

3. Click "Process Payment"

System:
- Payment Status: PROCESSING
- Instruction: "Transfer ₹17,700 to supplier's bank account"

Finance team:
- Goes to bank
- Processes NEFT transfer
- Gets confirmation

Update:
- Click "Mark as Complete"
- Payment Status: SUCCESS

Status: PAID ✓
```

---

#### **FINAL STATUS: COMPLETE ✅**

```
Timeline Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14 Mar → PO Created (DRAFT)
14 Mar → Submitted for Approval (PENDING_APPROVAL)
14 Mar → Approved by Accounts Manager (APPROVED)
14 Mar → Sent to Supplier (SENT)
21 Mar → Goods Delivered (RECEIVED)
21 Mar → GRN Created & Verified (VERIFIED)
22 Mar → Invoice Received
22 Mar → Invoice Matched & Approved (PENDING PAYMENT)
28 Mar → Payment Processed (PAID)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Cycle Time: 14 days (from order to payment)

Final Status: COMPLETE ✅
```

---

## 🚀 IMPLEMENTATION PHASES

### **PHASE 1: STAFF MANAGEMENT (Week 1)**
**Duration:** 3-4 hours  
**Priority:** 🔴 CRITICAL (Everything depends on this)

**What to build:**
1. ✅ Staff Model in MongoDB
2. ✅ Staff API endpoints (CRUD)
3. ✅ Role & Permission system
4. ✅ Staff List page in admin
5. ✅ Add/Edit Staff forms

**Tasks:**
- [ ] Create Staff.ts model
- [ ] Create staffController.ts
- [ ] Create routes/staff.ts
- [ ] Create frontend API client (staffAPI)
- [ ] Create /admin/staff/page.tsx (list)
- [ ] Create staff form component (add/edit)
- [ ] Test staff creation & updates

**Output:** Admin can manage staff with roles

---

### **PHASE 2: SUPPLIER MANAGEMENT (Week 1)**
**Duration:** 2-3 hours  
**Priority:** 🟡 IMPORTANT (Needed before PO creation)

**What to build:**
1. ✅ Supplier Model
2. ✅ Supplier CRUD APIs
3. ✅ Supplier List page
4. ✅ Add/Edit Supplier forms

**Tasks:**
- [ ] Create Supplier.ts model
- [ ] Create supplierController.ts
- [ ] Create routes/suppliers.ts
- [ ] Create /admin/suppliers/page.tsx
- [ ] Create supplier form component

**Output:** Can manage supplier database

---

### **PHASE 3: PURCHASE ORDER SYSTEM (Week 2)**
**Duration:** 4-5 hours  
**Priority:** 🔴 CRITICAL

**What to build:**
1. ✅ PurchaseOrder Model
2. ✅ PO CRUD APIs
3. ✅ PO Workflow (Draft → Approval → Approved)
4. ✅ PO List & Details pages
5. ✅ Create PO form (line items)
6. ✅ PO Approval interface

**Tasks:**
- [ ] Create PurchaseOrder.ts model
- [ ] Create poController.ts
- [ ] Create routes/purchase-orders.ts
- [ ] Create /admin/purchase-orders/page.tsx
- [ ] Create PO creation form
- [ ] Create /admin/po-approvals/page.tsx
- [ ] Implement approval workflow
- [ ] Test end-to-end

**Output:** Can create & approve POs

---

### **PHASE 4: GOODS RECEIPT (Week 2)**
**Duration:** 2-3 hours  
**Priority:** 🟡 IMPORTANT

**What to build:**
1. ✅ GoodsReceiptNote Model
2. ✅ GRN CRUD APIs
3. ✅ GRN creation form
4. ✅ GRN list & details

**Tasks:**
- [ ] Create GoodsReceiptNote.ts model
- [ ] Create grnController.ts
- [ ] Create routes/grn.ts
- [ ] Create /admin/goods-receipt/page.tsx
- [ ] Create GRN form component
- [ ] Add GRN verification workflow

**Output:** Can create & verify GRNs

---

### **PHASE 5: INVOICE MANAGEMENT (Week 3)**
**Duration:** 3-4 hours  
**Priority:** 🟡 IMPORTANT

**What to build:**
1. ✅ SupplierInvoice Model
2. ✅ Invoice CRUD APIs
3. ✅ 3-Way Matching (PO ↔ GRN ↔ Invoice)
4. ✅ Invoice list & details
5. ✅ Invoice approval

**Tasks:**
- [ ] Create SupplierInvoice.ts model
- [ ] Create invoiceController.ts
- [ ] Create routes/invoices.ts
- [ ] Implement 3-way matching logic
- [ ] Create /admin/invoices/page.tsx
- [ ] Create invoice matching UI
- [ ] Add discrepancy tracking

**Output:** Can manage invoices & match with PO/GRN

---

### **PHASE 6: PAYMENT SYSTEM (Week 3)**
**Duration:** 2-3 hours  
**Priority:** 🟡 IMPORTANT

**What to build:**
1. ✅ Payment Model
2. ✅ Payment CRUD APIs
3. ✅ Payment processing form
4. ✅ Payment list & history

**Tasks:**
- [ ] Create Payment.ts model
- [ ] Create paymentController.ts
- [ ] Create routes/payments.ts
- [ ] Create /admin/payments/page.tsx
- [ ] Create payment form component
- [ ] Implement payment status updates

**Output:** Can process & track payments

---

### **PHASE 7: REPORTS & ANALYTICS (Week 4)**
**Duration:** 3-4 hours  
**Priority:** 🟢 NICE TO HAVE

**What to build:**
1. ✅ Budget reports
2. ✅ Spending analysis
3. ✅ Supplier performance
4. ✅ Payment reports

**Tasks:**
- [ ] Create reportController.ts
- [ ] Create routes/reports.ts
- [ ] Create /admin/reports/budget
- [ ] Create /admin/reports/spending
- [ ] Create /admin/reports/supplier-analysis
- [ ] Add charts & graphs

**Output:** Management can see business analytics

---

### **PHASE 8: NOTIFICATIONS & AUTOMATION (Week 4)**
**Duration:** 2-3 hours  
**Priority:** 🟢 NICE TO HAVE

**What to build:**
1. ✅ Email notifications
2. ✅ In-app notifications
3. ✅ Status updates

**Tasks:**
- [ ] Setup email service (SendGrid/Nodemailer)
- [ ] Create notification templates
- [ ] Send emails on PO approval
- [ ] Send alerts on overdue invoices
- [ ] In-app notification dashboard

**Output:** Staff gets notified of important events

---

## 📝 SIMPLE STEP-BY-STEP GUIDE

### **TO BUILD THIS SYSTEM:**

#### **STEP 1: Understand the Flow (1 hour)**
- Read this document
- Understand roles: Who does what?
- Understand PO workflow: 12 steps from creation to payment
- Understand models: What data to store?

#### **STEP 2: Create Models (2 hours)**
1. Staff.ts - Employee details
2. Supplier.ts - Supplier details
3. PurchaseOrder.ts - Orders
4. GoodsReceiptNote.ts - Goods received
5. SupplierInvoice.ts - Supplier bills
6. Payment.ts - Payment records

Code each model with:
- All fields defined
- Validation rules
- Timestamps
- References to other models

#### **STEP 3: Create Controllers (3 hours)**
1. staffController.ts - CRUD operations
2. supplierController.ts - CRUD operations
3. poController.ts - CRUD + workflow logic
4. grnController.ts - CRUD operations
5. invoiceController.ts - CRUD + 3-way matching
6. paymentController.ts - CRUD operations

For each controller, implement:
- GET all (with filters)
- GET by ID
- POST (create)
- PUT (update)
- PATCH (status changes)
- DELETE

#### **STEP 4: Create Routes (1 hour)**
1. routes/staff.ts
2. routes/suppliers.ts
3. routes/purchase-orders.ts
4. routes/grn.ts
5. routes/invoices.ts
6. routes/payments.ts

For each route file:
- Import controller methods
- Define routes with HTTP methods
- Add authentication middleware
- Add authorization (role checking)

#### **STEP 5: Create Frontend Pages (4 hours)**
1. /admin/staff - Staff list & management
2. /admin/suppliers - Supplier list & management
3. /admin/purchase-orders - PO list & creation
4. /admin/po-approvals - Approval workflow
5. /admin/goods-receipt - GRN creation
6. /admin/invoices - Invoice management
7. /admin/payments - Payment processing

For each page:
- Show list in table format
- Add create/edit buttons
- Show form for data entry
- Display status & actions
- Link between related data

#### **STEP 6: Create API Client (1 hour)**
In frontend/src/lib/api.ts, add:
```typescript
export const staffAPI = { ... }
export const supplierAPI = { ... }
export const poAPI = { ... }
export const grnAPI = { ... }
export const invoiceAPI = { ... }
export const paymentAPI = { ... }
```

#### **STEP 7: Test Everything (2 hours)**
- Create staff
- Create supplier
- Create PO
- Approve PO
- Create GRN
- Create Invoice
- Process Payment
- Check status flows

#### **STEP 8: Add Polish (2 hours)**
- Add loading states
- Add error messages
- Add success notifications
- Add confirmation dialogs
- Style pages nicely
- Add charts/reports

#### **STEP 9: Deploy (1 hour)**
- Test on production-like environment
- Fix any issues
- Deploy to live server
- Document for users

---

## 📊 QUICK REFERENCE

### **Who Can Do What:**

| Action | Admin | Procure. | Accounts | Store | Inventory | Finance | Logistics |
|--------|:-----:|:--------:|:--------:|:-----:|:---------:|:-------:|:---------:|
| Create Staff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create PO | ❌ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| Approve PO | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create GRN | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Verify GRN | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Create Invoice | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Invoice | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Process Payment | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ | ❌ |

**Legend:** ✅ = Yes | ❌ = No | ⚠️ = Can request

---

### **Database Models Summary:**

| Model | Purpose | Created By | Status Field |
|-------|---------|------------|--------------|
| Staff | Employee data | Admin | active/inactive |
| Supplier | Vendor info | Admin | active/inactive |
| PurchaseOrder | Orders | Procurement | DRAFT → APPROVED → PAID |
| GoodsReceiptNote | Goods received | Store Manager | RECEIVED → VERIFIED |
| SupplierInvoice | Bills | Accounts Mgr | PENDING → PAID |
| Payment | Payments | Finance | PENDING → SUCCESS |

---

### **Status Flows:**

**PO Status Flow:**
```
DRAFT 
  ↓
PENDING_APPROVAL (waiting for Accounts Manager)
  ↓
APPROVED (budget checked)
  ↓
SENT (to supplier)
  ↓
PARTIALLY_RECEIVED (some items arrived)
  ↓
RECEIVED (all items arrived)
  ↓
INVOICED (bill received)
  ↓
PAID (payment done)
```

**Invoice Status Flow:**
```
PENDING (new invoice)
  ↓
PARTIALLY_PAID (partial payment made)
  ↓
PAID (full payment done)
```

---

## ✅ CHECKLIST FOR COMPLETION

### **Backend Development:**
- [ ] All 6 models created (Staff, Supplier, PO, GRN, Invoice, Payment)
- [ ] All controllers created with CRUD operations
- [ ] All routes defined with authentication
- [ ] Database connected and models registered
- [ ] API tested with Postman
- [ ] Error handling implemented
- [ ] Validation rules added

### **Frontend Development:**
- [ ] API client created (lib/api.ts updated)
- [ ] All pages created
- [ ] Forms created for data entry
- [ ] Status displays working
- [ ] Approval workflow UI working
- [ ] 3-way matching display working
- [ ] Loading & error states handled
- [ ] Notifications showing

### **Testing:**
- [ ] Create staff → works
- [ ] Create supplier → works
- [ ] Create PO → works
- [ ] Approve PO → works
- [ ] Create GRN → works
- [ ] Create Invoice → works
- [ ] Match Invoice → works
- [ ] Process Payment → works
- [ ] Status flows correctly

### **Deployment:**
- [ ] Code committed to git
- [ ] Tested on staging
- [ ] Deployed to production
- [ ] Staff trained on usage
- [ ] Documentation created

---

## 📞 SUPPORT & NEXT STEPS

**Ready to start?** Choose a phase and we'll build it!

**Questions?** Review the relevant section above.

**Issues?** Debug step by step using the workflow diagram.

**Timeline:** Total ~4-5 days of development (with breaks)

**Cost:** No additional cost - built with same tech stack

---

**Created:** 14 March 2026  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Next:** Start Phase 1 - Staff Management
