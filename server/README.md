# Kisan Setu Backend Server

This is the backend for the **Kisan Setu** platform, built using **Node.js, Express.js, TypeScript, and MongoDB (via Mongoose)**.

Kisan Setu is an agricultural equipment-sharing and rental platform that connects farmers with machinery owners while providing booking, payments, KYC, communication, support, and administrative capabilities.

---

## Features

* **Authentication & RBAC**

  * Firebase Phone Authentication with OTP
  * Firebase ID Token verification using Firebase Admin SDK
  * Firebase UID linked with MongoDB users
  * Role-based access control
  * User ban/suspension management
  * Supported roles: Farmer Owner, Farmer Customer, Admin, Call Center, Moderator

* **Farmer Profile & KYC**

  * Personal profile management
  * Aadhaar & PAN document uploads through Cloudinary
  * KYC verification workflow
  * Bank information management
  * KYC status tracking and administrative verification

* **Equipment Listings & Search**

  * Machinery listing creation and management
  * Category-based filtering
  * Geospatial proximity search using MongoDB `2dsphere` indexes
  * Equipment availability management
  * Equipment verification workflow

* **Rentals & Invoices**

  * Equipment booking requests
  * Booking acceptance/rejection
  * Rescheduling workflow
  * Rental status tracking
  * Platform fee calculation
  * GST calculation
  * Security deposits
  * QR code generation
  * PDF invoice/receipt generation using PDFKit

* **Payment Gateway**

  * Razorpay order creation
  * Razorpay payment signature verification
  * Transaction tracking
  * Wallet and payout management
  * Payment-linked rental status updates

* **Realtime Chat & Notifications**

  * Socket.io-based realtime communication
  * Chat conversations
  * Realtime messages
  * Typing indicators
  * Seen/read status
  * Notification management

* **Recommendations**

  * Crop-based recommendations
  * Seasonal recommendations
  * Nearby equipment suggestions
  * Distance-based matching

* **Administration & Moderation**

  * KYC verification
  * Equipment verification
  * User management
  * User banning
  * Review reporting
  * Support ticket management
  * Administrative audit logs
  * CSV data export

* **Email Notifications**

  * SMTP/Nodemailer integration
  * Booking and platform notification emails
  * Development fallback logging

* **Docker Ready**

  * Dockerfile
  * Docker Compose configuration
  * MongoDB and backend container support

---

## Tech Stack

### Core

* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** MongoDB / MongoDB Atlas
* **ODM:** Mongoose

### Authentication

* **Firebase Authentication**
* **Firebase Phone Authentication**
* **Firebase Admin SDK**

### Realtime & Communication

* **Socket.io**
* **Nodemailer / SMTP**

### Integrations

* **Razorpay** — payments
* **Cloudinary** — image/document storage
* **PDFKit** — PDF generation
* **QRCode** — QR code generation

### Development

* **tsx** — TypeScript development server
* **Docker**
* **Docker Compose**

---

## Authentication Architecture

Kisan Setu uses **Firebase Authentication** instead of implementing OTP and authentication internally.

### Phone Authentication Flow

```text
User
 │
 ▼
Kisan Setu Frontend
 │
 ▼
Firebase Phone Authentication
 │
 ├── Send OTP
 │
 └── Verify OTP
 │
 ▼
Firebase User
 │
 ▼
Firebase ID Token
 │
 │ Authorization: Bearer <ID_TOKEN>
 ▼
Kisan Setu Express Backend
 │
 ▼
Firebase Admin SDK
 │
 └── verifyIdToken()
 │
 ▼
Firebase UID
 │
 ▼
MongoDB User
 │
 ├── Profile
 ├── Wallet
 ├── Role
 ├── KYC
 └── Application Data
```

Firebase is responsible for authentication, while MongoDB stores Kisan Setu-specific user and application data.

### Important

The Firebase service-account credentials are **server-side secrets** and must never be committed to the repository.

---

## Project Structure

```text
server/
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── firebaseAdmin.ts
│   │   └── mailer.ts
│   │
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── bookingController.ts
│   │   ├── chatController.ts
│   │   ├── dashboardController.ts
│   │   ├── equipmentController.ts
│   │   ├── notificationController.ts
│   │   ├── paymentController.ts
│   │   ├── profileController.ts
│   │   ├── recommendationController.ts
│   │   ├── reviewController.ts
│   │   ├── schemeController.ts
│   │   ├── supportController.ts
│   │   ├── userController.ts
│   │   └── walletController.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── ...
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Profile.ts
│   │   ├── KYC.ts
│   │   ├── Equipment.ts
│   │   ├── Booking.ts
│   │   ├── Transaction.ts
│   │   ├── Wallet.ts
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── profileRoutes.ts
│   │   ├── equipmentRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── chatRoutes.ts
│   │   ├── reviewRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   ├── recommendationRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── supportRoutes.ts
│   │   ├── schemeRoutes.ts
│   │   └── walletRoutes.ts
│   │
│   ├── scripts/
│   │   └── ...
│   │
│   ├── utils/
│   │   └── ...
│   │
│   └── server.ts
│
├── dist/
├── firebase-service-account.json  # DO NOT COMMIT
├── .env                           # DO NOT COMMIT
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites

Ensure the following are installed:

* Node.js 18+
* MongoDB or MongoDB Atlas
* npm

A Firebase project is also required for authentication.

---

### 2. Environment Setup

Create a `.env` file in the `server` directory.

```env
# ==========================================
# Server
# ==========================================

NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000


# ==========================================
# MongoDB
# ==========================================

MONGO_URI=mongodb://localhost:27017/kisansetu


# ==========================================
# Firebase Admin
# ==========================================

GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\firebase-service-account.json


# ==========================================
# Cloudinary
# ==========================================

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


# ==========================================
# Razorpay
# ==========================================

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret


# ==========================================
# SMTP / Email
# ==========================================

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=KisanSetu Admin <noreply@kisansetu.com>
```

### Firebase Service Account

Generate a Firebase Admin SDK private key from:

**Firebase Console → Project Settings → Service Accounts → Generate New Private Key**

Store the downloaded JSON file securely in the backend directory.

For example:

```text
server/
├── firebase-service-account.json
├── .env
└── src/
```

Add the file to `.gitignore`:

```gitignore
.env
firebase-service-account.json
node_modules/
dist/
```

**Never commit the Firebase service-account JSON to GitHub.**

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Run Database Seeding

To populate categories, government schemes, verified equipment listings, and development users:

```bash
npm run seed
```

---

### 5. Launch Development Server

```bash
npm run dev
```

The server will run on:

```text
http://localhost:5000
```

---

### 6. Build the Backend

Compile the TypeScript backend:

```bash
npm run build
```

The compiled JavaScript output is generated inside:

```text
dist/
```

---

## API Architecture

The backend exposes modular REST API routing modules.

| Path Prefix            | Purpose                                 | Primary Endpoints                                                                                        |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/api/auth`            | Firebase authentication synchronization | `POST /sync`, `GET /me`                                                                                  |
| `/api/users`           | User administration                     | `GET /`, `GET /:id`, `PUT /:id/role`, `PUT /:id/ban`, `GET /:id/activity`                                |
| `/api/profile`         | Farmer profile & KYC                    | `GET /`, `PUT /`, `POST /kyc`, `GET /analytics/income`                                                   |
| `/api/equipment`       | Equipment listings                      | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`                                                 |
| `/api/bookings`        | Rental contracts                        | `POST /`, `PUT /:id/accept`, `PUT /:id/reject`, `PUT /:id/complete`, `POST /:id/reschedule`              |
| `/api/payments`        | Payment processing                      | `POST /initiate`, `POST /verify`, `GET /transactions`                                                    |
| `/api/chat`            | Realtime chat & history                 | `POST /`, `GET /`, `GET /:chatId/messages`, `POST /:chatId/messages`                                     |
| `/api/reviews`         | Equipment reviews                       | `POST /`, `GET /equipment/:equipmentId`, `PUT /:id/flag`                                                 |
| `/api/notifications`   | Notifications                           | `GET /`, `PUT /read`                                                                                     |
| `/api/recommendations` | Personalized recommendations            | `GET /`                                                                                                  |
| `/api/dashboard`       | Dashboard analytics                     | `GET /owner`, `GET /customer`, `GET /admin`                                                              |
| `/api/admin`           | Administrative control center           | `GET /kyc/pending`, `PUT /kyc/:id/verify`, `GET /equipment/pending`, `GET /reports`, `GET /export/:type` |
| `/api/support`         | Support tickets                         | `POST /`, `GET /`, `GET /:id`, `POST /:id/message`                                                       |
| `/api/schemes`         | Government agricultural schemes         | `GET /`, `GET /recommend`                                                                                |
| `/api/wallet`          | Farmer income wallet                    | `GET /`, `POST /withdraw`                                                                                |

---

## Authentication API

### Synchronize Firebase User

```http
POST /api/auth/sync
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

Request:

```json
{
  "name": "Farmer Name",
  "role": "FARMER_CUSTOMER"
}
```

The backend:

1. Verifies the Firebase ID token.
2. Extracts the Firebase UID.
3. Retrieves the verified phone number/email.
4. Finds or creates the corresponding MongoDB user.
5. Creates the user's Profile and Wallet for new accounts.

---

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <firebase-id-token>
```

Returns the authenticated Kisan Setu MongoDB user.

---

## Authorization

Authentication is handled by Firebase, while authorization is handled by Kisan Setu.

```text
Firebase
    │
    └── Identity
         │
         ▼
Kisan Setu User
    │
    ├── FARMER_OWNER
    ├── FARMER_CUSTOMER
    ├── ADMIN
    ├── CALL_CENTER
    └── MODERATOR
```

Protected routes use the Firebase ID token and Kisan Setu's role information to control access.

---

## Development Notes

### Authentication

Firebase handles:

* Phone OTP
* Identity verification
* Firebase ID tokens
* Token refresh
* Google authentication if enabled

Kisan Setu handles:

* MongoDB user records
* User roles
* User profiles
* Wallets
* KYC
* Account suspension
* Application-level authorization

### Database

MongoDB stores all Kisan Setu application data including:

* Users
* Profiles
* Equipment
* Bookings
* Transactions
* Wallets
* Reviews
* Chats
* Messages
* Notifications
* KYC records
* Support tickets
* Government schemes
* Recommendations
* Audit logs

---

## Production Considerations

Before deploying to production:

* Use MongoDB Atlas with appropriate network restrictions.
* Configure Firebase Authentication and authorized domains.
* Restrict Firebase phone-auth SMS regions appropriately.
* Store service-account credentials using a secure secret-management solution.
* Never commit `.env` or Firebase service-account credentials.
* Configure production Cloudinary credentials.
* Configure production Razorpay credentials.
* Configure production SMTP credentials.
* Set a production `CLIENT_URL`.
* Enable HTTPS.
* Configure appropriate CORS origins.
* Review rate limits and authentication protections.
* Disable development/mock integrations.
* Configure proper logging and monitoring.
* Validate all file uploads and document types.
* Review access control for every admin endpoint.

---

## Current Build Status

The TypeScript backend currently compiles successfully using:

```bash
npm run build
```

The authentication layer has been migrated from custom JWT/Twilio OTP handling to:

```text
Firebase Phone Authentication
        ↓
Firebase ID Token
        ↓
Firebase Admin SDK
        ↓
Kisan Setu MongoDB User
```

---

## License

This project is developed as part of the **Kisan Setu** platform.
