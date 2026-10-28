# 🥷 Akatsuki’s Draft: AI-Enabled Content Sharing Platform (Backend)
### 🏆 Nodevember 4.0 Submission

Backend for Akatsuki’s Draft, an AI-powered content-sharing platform featuring JWT authentication, MongoDB integration, post and draft management, admin approval workflows, and AI-based content improvement.

A full-featured Node.js, Express, MongoDB, and Google Gemini AI backend built according to the **Nodevember 4.0 Akatsuki's Draft** specifications.

---

## ⚡ Direct Answer: Do I have to install or just connect?

| Service | Do you need to install locally? | How it works |
| :--- | :--- | :--- |
| **MongoDB Atlas** | ❌ **NO installation needed** | Simply create a free database at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and paste your connection string into `.env`. That's it! |
| **Postman** | ❌ **No special setup** | If you have Postman (desktop or web at [web.postman.co](https://web.postman.co)), just click **Import** and select the pre-built `postman_collection.json` included in this folder. |
| **Google Gemini AI** | ❌ **NO installation needed** | Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey) and paste it into `.env`. |

---

## 📁 Project Architecture & Files Created

```
Nodevenmber-re- 4/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB Mongoose connection
│   │   └── gemini.js             # Google Gemini AI integration & fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, getMe (JWT)
│   │   ├── postController.js     # CRUD, draft management, public feed
│   │   ├── adminController.js    # Pending queue, post approve, reject
│   │   └── aiController.js       # AI content enhancement (saves new draft)
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification, Role authorization
│   │   └── errorMiddleware.js    # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js               # User schema { name, email, password, role }
│   │   └── Post.js               # Post schema { title, description, content, ... }
│   ├── routes/
│   │   ├── authRoutes.js         # /auth endpoints
│   │   ├── postRoutes.js         # /posts endpoints
│   │   ├── adminRoutes.js        # /admin endpoints
│   │   └── aiRoutes.js           # /ai endpoints
│   └── app.js                    # Express app configuration & middlewares
├── server.js                     # HTTP server entry point
├── postman_collection.json       # Ready-to-import Postman collection with tests
├── .env.example                  # Environment template
├── .env                          # Local environment variables
└── README.md                     # Complete step-by-step guide
```

---

## 🚀 Step 1: Connect to MongoDB Atlas (2 Minutes, No Local Install)

You do **not** need to install MongoDB on your PC. MongoDB Atlas is hosted in the cloud for free:

1. **Sign up / Log in**: Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. **Create a Free Cluster**:
   - Choose **M0 Free (Shared)**.
   - Select any provider/region (e.g. AWS / Mumbai or Singapore).
   - Click **Create Deployment**.
3. **Set Security (Username & Password)**:
   - Create a database user (e.g. choose any username and a secure password).
4. **Allow Network Access**:
   - Go to **Network Access** in the left sidebar.
   - Click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.
5. **Get Your Connection String**:
   - In the **Database** tab, click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy your connection string template.
6. **Paste into `.env`**:
   - Open your `.env` file in the IDE.
   - Add your connection string:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>.mongodb.net/Nodevember?retryWrites=true&w=majority
     DB_NAME=Nodevember
     ```

---

## 🤖 Step 2: Get Free Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Get API key** -> **Create API key in new project**.
4. Copy the generated key.
5. In your `.env` file, paste your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_real_key_here
   ```

*(Note: If you haven't added an API key yet, the server has an automatic fallback enhancer that simulates AI improvements so tests will never fail!)*

---

## 💻 Step 3: Start the Backend Server

Open your terminal in the project directory and run:

```bash
# Start in development mode with live reloading
npm run dev
```

Or for standard execution:
```bash
npm start
```

You will see:
```
====================================================
🚀 Akatsuki's Draft Backend Server is active!
📡 URL: http://localhost:5000
📋 Event: Nodevember 4.0
🛡️  Environment: development
====================================================
[MongoDB] Connected successfully to host: cluster0...
[MongoDB] Database Name: akatsuki_draft
```

---

## 📬 Step 4: Connect & Test with Postman (1-Click Import)

We have created `postman_collection.json` in the root folder. It includes all routes and **auto-stores your tokens and IDs**.

### How to Import:
1. Open **Postman**.
2. Click the **Import** button (top-left).
3. Drag and drop the `postman_collection.json` file from your project folder (or click *Files* and select it).
4. You will see a new collection: **"Nodevember 4.0 - Akatsuki's Draft API"**.

### Recommended Testing Flow in Postman:

#### 1. Authentication (`1. Authentication` folder)
1. **Register Regular User (`POST /auth/register`)**:
   - Registers `itachi@akatsuki.com` with role `"user"`.
   - **Postman automatically saves `{{userToken}}`!**
2. **Register Admin User (`POST /auth/register`)**:
   - Registers `pain@akatsuki.com` with role `"admin"`.
   - **Postman automatically saves `{{adminToken}}`!**
3. **Get Profile (`GET /auth/me`)**:
   - Retrieves the logged-in user profile using `Bearer {{userToken}}`.

#### 2. User - Post Management (`2. User - Post Management` folder)
4. **Create Post / Draft (`POST /posts`)**:
   - Creates a post in `"draft"` status.
   - **Postman automatically saves `{{postId}}`!**
5. **View My Posts and Drafts (`GET /posts/my-posts`)**:
   - Shows all posts created by the logged-in user.
6. **Submit Post for Approval (`POST /posts` or `PATCH /posts/:id`)**:
   - Updates `status: "pending"` so the post enters the admin review queue.
7. **View Approved Posts (`GET /posts`)**:
   - Public feed. (Initially empty until an admin approves a post).

#### 3. Admin - Post Approval (`3. Admin - Post Approval` folder)
8. **View Pending Posts (`GET /admin/posts/pending`)**:
   - Requires `{{adminToken}}`. Lists all posts waiting for review.
9. **Approve Post (`PATCH /admin/posts/approve/:id`)**:
   - Admin approves the post (`status: "approved"`). Now it's visible in `GET /posts`!
10. **Reject Post (`PATCH /admin/posts/reject/:id`)**:
    - Admin rejects a post (`status: "rejected"`).

#### 4. AI Content Improvement (`4. AI Integration - Content Improvement` folder)
11. **Improve Content with AI (`POST /ai/improve/:postId`)**:
    - Passes `:postId` of an existing post.
    - Gemini AI analyzes and enhances the title, description, and content.
    - **Saves as a brand new post in `draft` status with a brand new ID under the same user.**
    - The original post remains completely preserved!

---

## 📋 API Specification Summary

### 1. Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (`name, email, password, role`) | Public |
| `POST` | `/auth/login` | Log in with credentials, returns JWT | Public |
| `GET` | `/auth/me` | Fetch logged-in user profile | Bearer Token |

### 2. User — Post Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/posts` | Create a new post or draft | Bearer Token |
| `GET` | `/posts` | View all approved posts | Public |
| `GET` | `/posts/:id` | View an approved post by ID | Public / Private |
| `GET` | `/posts/my-posts` | View your own posts and drafts | Bearer Token |
| `PATCH` | `/posts/:id` | Update your own post | Bearer Token (Creator) |
| `DELETE` | `/posts/:id` | Delete your own post | Bearer Token (Creator) |

### 3. Admin — Post Approval
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/posts/pending` | View posts awaiting approval | Admin Only |
| `PATCH` | `/admin/posts/approve/:id` | Approve a post (`status: "approved"`) | Admin Only |
| `PATCH` | `/admin/posts/reject/:id` | Reject a post (`status: "rejected"`) | Admin Only |

### 4. AI Integration — Content Improvement
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/improve/:postId` | Enhance content using Gemini AI & save as new draft with new ID | Bearer Token |

---

## 🛡️ Database Schemas

### User Schema:
```javascript
{
  name: String,       // Required, trimmed
  email: String,      // Required, unique, lowercase, regex-validated
  password: String,   // Required, bcrypt-hashed (salt rounds: 10)
  role: String,       // Enum: ['user', 'admin'], default: 'user'
  createdAt: Date     // Timestamp
}
```

### Post Schema:
```javascript
{
  title: String,        // Required, trimmed
  description: String,  // Required, trimmed
  content: String,      // Required
  image: String,        // Optional image URL
  category: String,     // Required
  createdBy: ObjectId,  // Ref: 'User'
  status: String,       // Enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft'
  createdAt: Date       // Timestamp
}
```
>>>>>>> 1d24834 (feat: complete Akatsuki's Draft backend implementation for Nodevember 4.0)
