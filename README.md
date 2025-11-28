# Data Security Project  
A fully modular **Zero-Trust, multi-service encryption system** using:

- **JWT-based authentication**
- **AES + RSA Hybrid Cryptography**
- **Microservices for login, token generation, token verification**
- **Team-based RSA key pairs**
- **Fully separated Manager & User workflows**
- **Secure file encryption/decryption**
- **React frontend with role-based routing**

---

# 1. System Architecture Overview

This project is built using **8 separate microservices**, following the principle:

> **“One server → One responsibility.”**

## 🧩 Core Components

| Service            | Responsibility                                 |
|-------------------|-------------------------------------------------|
| Login Server      | Validate username/password (no token work)      |
| JWT Generator     | Create signed JWT tokens                        |
| JWT Verifier      | Verify JWT tokens for all APIs                  |
| Manager API       | Admin operations: Users, Teams, Keys            |
| User API          | User operations: Team list, Public key access   |
| Keys Manager      | RSA Key Pair storage & generation               |
| Core File Server  | AES+RSA hybrid encryption/decryption            |
| React Frontend    | Manager + User dashboards                       |

### This architecture ensures:
- **Zero Trust** (every request must be verified by JWT Verifier)  
- **Least Privilege** (users cannot access private keys or admin ops)  
- **Cryptographic isolation**  
- **Scalable & modular system**

---

# 2. Authentication Architecture

## 2.1 Login Server
- Validates username + password using MongoDB.  
- Does **NOT** generate or verify tokens.

### **Flow**
1. React sends username + password  
2. Server checks MongoDB  
3. Returns:
{ "username": "...", "name": "...", "role": "..." }

- Client forwards these details to JWT Generator

---

# 2. Authentication Architecture

## 2.2 JWT Generator

- Client sends login-validated user details to the JWT Generator.
- JWT Generator creates a signed token using:
  - Algorithm: **HS256**
  - Secret: **JWT_SECRET**
  - Expiry: **1 hour**
  - Issuer: `"auth-server"`
  - Audience: `"my-api"`

### **Token Payload (JSON)**
```json
{
  "username": "...",
  "role": "manager/user",
  "department": "IT"
}
```

## 3. Hybrid Encryption Engine – Core File Server

- Encryption Model: **AES-256-CBC + RSA-2048**
- Purpose:
  - AES → fast for large file encryption
  - RSA → secure encryption of the AES key
- RSA **cannot** encrypt big files → used **only** for the AES key.
- AES key must be protected → encrypted using the **Team’s RSA Public Key**.

---

## 3.1 Encryption Process

### **Steps**
1. Generate random **AES key (32 bytes)** and **IV (16 bytes)**  
2. Encrypt file using **AES-256-CBC**  
3. Encrypt AES key using **Team’s RSA Public Key**  
4. Store the following encrypted outputs:

```json
file.enc
file.key.enc
file.iv
```
## 3.2 Decryption Process

- Manager provides the **Team’s RSA Private Key**
- RSA decrypts the AES key from `file.key.enc`
- AES decrypts `file.enc` using:
  - Decrypted AES key  
  - `file.iv`

---

# 4. Keys Manager – RSA Key Authority 🔑

- Stores and manages **per-team RSA key pairs**
- Ensures cryptographic isolation between teams

### **Functions**
- Generate new RSA keys **when a team is created**
- Fetch existing **Public Key** (safe to share)
- Fetch existing **Private Key** (manager-only, restricted)
- Prevent key regeneration **if encrypted files exist** (critical security measure)

# 5. Manager API (Admin Microservice)

Handles all **administrative operations** of the system.

### **Responsibilities**
- Create users  
- Create teams  
- Update team members  
- Fetch all teams  
- Trigger RSA key generation  

### **Database**
- **Users** collection  
- **Teams** collection  

---

# 6. User API (User Microservice) 👤

Used exclusively by **normal (non-admin) users**.

### **Responsibilities**
- Fetch teams the user belongs to  
- Fetch the **Team’s Public Key** (via Keys Manager)  

### **Security Rule**
- User API **never** accesses or exposes private keys.
# 7. React Frontend Architecture 🖥

The frontend is built using **React**, with fully separated Manager & User dashboards.

### **Frontend consists of:**
- `App.jsx` — Routing system  
- `login.jsx` — Login UI  
- `auth.js` — JWT authentication handler  
- Manager Dashboard + workflows  
- User Dashboard + workflows  

---

## 7.1 Frontend Login Workflow 🔐

Full flow: **Login → JWT Generation → JWT Verification → Dashboard Redirect**

### **Steps**
1. User enters credentials  
2. Login Server validates username/password  
3. JWT Generator creates a signed JWT  
4. JWT Verifier validates the token  
5. Token is stored in `localStorage`  
6. User is redirected based on **role** (Manager/User)  
# 8. Manager Frontend Workflow 🧑‍💼

(Teams • Keys • Users • Files)

### **Manager can:**
- View all teams  
- View team members  
- Add/remove team members  
- Create a new team  
- Create new users  
- Fetch RSA keys (Public + Private)  
- Decrypt files  
- Delete encrypted files  

### **Key Rules**
- **Private Key** is shown **only** to the Manager  
- Keys **cannot be regenerated** if encrypted files already exist  

---

# 9. User Frontend Workflow 👤

(User Dashboard + Team File Upload System)

### **User can:**
- View their teams  
- View the team’s **Public Key**  
- Encrypt files locally in the browser  
- Upload AES-encrypted files + RSA-encrypted AES key  
- View list of encrypted files  

### **File Upload Process**
1. Browser generates **AES key (32 bytes)**  
2. File is AES-encrypted  
3. AES key is encrypted using the **team’s Public Key (RSA-2048)**  
4. User uploads:
   - `file.enc` (AES-encrypted file)  
   - `file.key.enc` (RSA-encrypted AES key)  
   - `file.iv` (AES IV)  
# 10. System Architecture

This architecture shows the complete flow between React Frontend → Auth Services → APIs → File Server.
```
React UI
 └─ Login (username + password)
     └─ Login Server
         └─ JWT Generator
             └─ JWT Verifier
                 ├─ User API
                 │    └─ teams/publicKey
                 ├─ Manager API
                 │    └─ teams/users
                 └─ Keys Manager
                      └─ RSA keys
                          └─ File Server (AES + RSA)
```
