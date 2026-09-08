# 🏦 Fintech Wallet - Backend (Spring Boot)

Welcome to the backend repository of the **Fintech Wallet** application. This RESTful API is built with Spring Boot and provides a secure, scalable foundation for digital wallet operations, KYC verification, and AI-driven financial insights.

## 🚀 Tech Stack
* **Framework:** Java, Spring Boot (Spring Web, Spring Data JPA, Spring Security)
* **Database:** PostgreSQL 
* **Authentication:** JWT (JSON Web Tokens)
* **AI Integration:** AI SDK (for smart financial insights and chat)
* **Build Tool:** Maven

## ✨ Key Features
* **JWT Authentication:** Secure login, registration, and role-based access control.
* **Wallet Management:** Real-time balance checking and account status tracking.
* **Secure Transactions:** Send money, deposit, and withdraw funds.
* **OTP Verification:** Conditional OTP validation for high-value transactions (e.g., > 10,000 BDT).
* **KYC Integration:** Endpoints to submit and verify user identity details.
* **AI Insights:** Dynamic AI chatbot backend to process user spending data and provide intelligent financial advice.
* **Notification System:** Alerts for user activities.

## 🛠️ Prerequisites
* Java 17 or higher
* Maven
* PostgreSQL or MySQL Database setup locally

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sagor000000/Fintech-Wallet.git
   ```
   *(Navigate to the backend directory of your project)*

2. **Configure Environment Variables:**
   Open `src/main/resources/application.properties` (or `.yml`) and configure your database, JWT secret, and API keys:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/fintech_db
   spring.datasource.username=your_db_user
   spring.datasource.password=your_db_password
   
   # JWT Configuration
   jwt.secret=your_super_secret_jwt_key
   
   # AI API Key (If applicable)
   ai.api.key=your_api_key_here
   ```

3. **Build and Run the Application:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8080`.

## 🔗 Main API Endpoints (Overview)
* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
* **Wallet:** `GET /api/wallet`, `GET /api/wallet/balance`
* **Transactions:** `POST /api/transactions/transfer`, `POST /api/transactions/verify-otp`
* **KYC:** `POST /api/kyc/submit`
* **Insights:** `POST /api/insights/ask`

## 👤 Author
* **MD. HABIBUR RAHMAN SAGOR**
* GitHub: [@Sagor000000](https://github.com/Sagor000000)
