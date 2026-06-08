# Advisify — AI Personal Spending & Purchase Advisor 🚀

Advisify is a premium AI-powered personal finance assistant designed to help users track transactions, manage savings goals, analyze impulse spending patterns, and make smarter purchasing decisions. Utilizing a hybrid engine that combines deterministic cash-flow forecasting with the advanced capabilities of the **Google Gemini 1.5 Flash API**, Advisify helps users visualize the real impact of their choices before they spend a single rupee.

---

## 🧭 User Experience & Core Features

Advisify provides a clean, responsive, and dark-themed interface built using modern design aesthetics (glassmorphism, vibrant gradients, and micro-interactions) to deliver a premium user experience.

### 1. Interactive Onboarding & Budget Setup
*   **Income & Preset Rules**: Users define their monthly income and allocate budget targets using standard frameworks (like the 50/30/20 budget framework) or set up custom allocations for **Needs**, **Wants**, **Savings**, and **Investing**.
*   **Risk Profile Presets**: Presets such as **Conservative**, **Moderate**, or **Aggressive** automatically pre-configure allocations if custom values are not provided.
*   **Goals Initialization**: Define one or more target goals (e.g., buying a laptop, building an emergency fund) with target amounts, current saved balances, and optional completion deadlines.

### 2. Comprehensive Financial Health Dashboard
*   **Financial Health Score (0-100)**: A real-time gauge displaying the user's financial health, classified into descriptive ratings: *Excellent*, *Good*, *Fair*, or *Needs Attention*.
*   **Monthly Allocation Donut Chart**: Uses Recharts to visualize the user's target allocation breakdown against real-time spending.
*   **Active Goal Progress**: A dedicated panel showing target versus current savings, deadlines, and a visual progress bar.
*   **Purchase History & Impulse Logger**: Log purchases under specific categories. If an item is logged as an **Impulse Purchase**, the user can later toggle a regret state (indicated by a Frown/Checkmark) which dynamically updates their impulse control score.

### 3. AI Purchase Evaluation Engine
*   **Simulator Panel**: Before making a purchase, users can type in the item name, price, and category.
*   **Goal Delay Forecasting**: The system calculates exactly how many months the purchase will delay their active saving goals.
*   **Gemini AI Verdict**: Gemini evaluates the request to deliver a verdict (**Buy Authorized** or **Postpone Recommended**), need/want score ratings, a punchy reasoning, and 3 cost-saving alternatives.
*   **Offline Fallback Mode**: If no Gemini API key is supplied, a deterministic fallback engine calculates rule-based scores and suggests standard savings alternatives so the application remains fully functional.

### 4. Conversational AI Financial Coach
*   **Active Chat Console**: An interactive, context-aware chatbot.
*   **Personalized Context Injection**: In the background, the coach is provided with the user's income, risk profile, monthly available budget limits, current savings surplus, and active goals.
*   **Suggested Prompts**: Quick-tap topics like *"How can I raise my Financial Health Score?"* or *"Give me ideas to cut back on Wants this month."* for immediate assistance.

---

## 🎮 Step-by-Step Demo Guide (See the App in Action!)

Want to test drive the app and see the AI features react in real time? Here is a simple walkthrough of a demo scenario with exact sample numbers to enter:

### Step 1: Complete Onboarding
When you sign up, configure your profile with these parameters:
*   **Monthly Income**: `₹80,000`
*   **Risk Profile**: Select `Moderate` (This automatically allocates 50% Needs: `₹40,000`, 25% Wants: `₹20,000`, 15% Savings: `₹12,000`, and 10% Investing: `₹8,000`).
*   **Calculated Monthly Savings Surplus**: `₹20,000` *(Income - Available Budget [Needs + Wants] = ₹80,000 - ₹60,000 = ₹20,000)*.

### Step 2: Establish a Savings Goal
In the **Financial Goals** card on the dashboard, click the `+` button and add:
*   **Goal Name**: `New MacBook Pro`
*   **Target Amount**: `₹1,50,000`
*   **Current Saved**: `₹50,000`
*   **Deadline Date**: Select a date exactly **6 months** from today.
*   *What you will see*: Under the hood, you need `₹1,00,000` more. At your current surplus rate of `₹20,000/month`, it will take you **5.0 months** to save this amount. Since 5.0 months is less than your 6-month deadline, the goal will display a green **"On Track"** status.

### Step 3: Run the AI Purchase Simulation (The Moment of Truth!)
Click on **AI Purchase Evaluation** in the sidebar. Let's simulate buying a luxury item before committing to it:
*   **Item Name**: `Sony PlayStation 5 Console`
*   **Price**: `₹55,000`
*   **Budget Category**: Select `Wants`
*   *Click "Evaluate Decision" and watch the math & AI update:*
    *   **Goal Timelines Delay**: It will report a **+2.75 month delay** on your savings goals (calculated as $\frac{₹55,000 \text{ price}}{₹20,000 \text{ monthly surplus}}$).
    *   **MacBook Pro Target Shift**: Your MacBook Pro goal will now take **7.75 months** instead of 5.0 months to complete.
    *   **Goal Deadline Alert**: Since 7.75 months exceeds your 6-month deadline, the MacBook Pro status is forecasted to drop to **"Off Track"**!
    *   **AI Verdict**: If Gemini is connected, it will recommend **"Postpone Recommended"** with customized reasoning noting that this purchase will breach your MacBook Pro deadline, along with cost-saving suggestions (like looking for a pre-owned bundle or waiting a 48-hour cooling-off period).

### Step 4: Log Real & Impulse Transactions
Return to the main Dashboard and click the `+` in the **Purchase History** card to log:
1.  `Weekly Groceries` for `₹4,000` under **Needs** (leave "Impulse Purchase?" unchecked).
2.  `Designer Jacket` for `₹12,000` under **Wants** (check **"Impulse Purchase?"**).

### Step 5: Toggle Impulse Regret to Shift your Health Score
Once the `Designer Jacket` is logged:
*   Note your initial **Financial Health Score** (e.g., 75/100).
*   In the purchase history table, click the checkmark button next to the jacket to change it to a **Frown** (marking it as *Regretted*).
*   Watch your **Financial Health Score** dynamically drop in real-time as the **Impulse Purchase Control** score drops from 100% to 0%!

### Step 6: Chat with your AI Financial Coach
Open the **AI Financial Coach** chat interface. Type this message:
> *"How can I get my MacBook Pro goal back on track after simulating the PS5?"*
*   *What to expect*: The AI Coach automatically reads your profile parameters (Income, Goals, PS5 price delay forecast). It will reply with highly contextual advice, suggesting that you temporarily reduce your Wants allocation percentage from 25% to 15% for the next 2.5 months to recover the budget deficit.

---

## 🧮 How It Works (Under the Hood)

Advisify relies on robust math and algorithmic forecasting to drive the dashboard and the AI assistant:

### 1. Financial Health Score Formula
The overall Health Score is a weighted calculation from 0 to 100 representing four core pillars of financial discipline:
$$\text{Health Score} = 0.40 \cdot S_{\text{savings}} + 0.25 \cdot S_{\text{impulse}} + 0.20 \cdot S_{\text{goals}} + 0.15 \cdot S_{\text{budget}}$$

*   **Savings Rate Score ($S_{\text{savings}}$)**: Evaluated based on the user's monthly savings rate (Surplus / Income). It is optimized to reach 100% when the savings rate is 50% or higher.
*   **Impulse Control Score ($S_{\text{impulse}}$)**: Calculated based on regretted impulse purchases:
    $$S_{\text{impulse}} = 100 \cdot \left(1.0 - \frac{\text{Regretted Impulse Purchases}}{\text{Total Evaluated Impulse Purchases}}\right)$$
*   **Goal Adherence Score ($S_{\text{goals}}$)**: The percentage of active goals that are currently "on track" to be completed before their respective deadlines under the current monthly savings surplus rate.
*   **Budget Discipline Score ($S_{\text{budget}}$)**: Measures overspending against the user's configured monthly available budget (Needs + Wants limit). If the user overspends, the score decays proportionally.

### 2. Goal Delay Pipeline Simulation
When a potential purchase of price $P$ is evaluated, the engine simulates how it affects the savings pipeline. If the user's monthly surplus is $S$:
*   **Overall Delay Shift (Months)**:
    $$\text{Total Delay} = \frac{P}{S}$$
*   **Pipeline Forecast**: Active goals are sorted chronologically by deadline. The engine aggregates the required remaining amounts and simulates the target dates before and after deducting $P$ from the user's current cash savings. If $S \le 0$, the engine reports an infinite goal delay.

### 3. Predicted Impulse Regret Likelihood
When a potential purchase is evaluated, the system calculates the probability that the user will regret the purchase based on historical behavior:
*   If no historical impulse data exists, it defaults to a **30%** baseline.
*   If data exists, it computes the category-specific regret rate ($R_{\text{category}}$) and the global regret rate ($R_{\text{global}}$), then applies a weighted average (70% category weight, 30% global weight) to determine the probability:
    $$\text{Probability} = 0.70 \cdot R_{\text{category}} + 0.30 \cdot R_{\text{global}}$$

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL (Docker) / SQLite (Local), Alembic (migrations), Python-Jose (JWT Auth), Pydantic v2 |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand (state management), Recharts (data viz), Lucide React (icons) |
| **AI Integration** | Google Generative AI (Gemini 1.5 Flash Model) |
| **Deployment** | Docker & Docker Compose, Render Configuration (`render.yaml`) |

---

## 🚀 Getting Started

You can run Advisify either using Docker Compose (recommended) or by running the services manually on your local system.

### Option A: Running with Docker Compose (Recommended)
This option fires up PostgreSQL, the FastAPI backend, and the React frontend in unified containerized environments.

1.  **Clone & Open the Project Directory**:
    ```bash
    cd /home/vrunda/Projects/AI103
    ```
2.  **Configure Environment Variables**:
    Open the `docker-compose.yml` file and set your Gemini API key:
    ```yaml
    backend:
      environment:
        - DATABASE_URL=postgresql://postgres:postgrespassword@db:5432/advisor
        - GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```
3.  **Build and Run the Containers**:
    ```bash
    docker-compose up --build
    ```
4.  **Access the Applications**:
    *   **Frontend Client**: [http://localhost](http://localhost)
    *   **FastAPI API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Manual Setup for Local Development

#### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure the `.env` file (`backend/.env`):
    ```env
    DATABASE_URL=sqlite:///./dev.db
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```
5.  Run database migrations / table creation (tables are automatically created on startup, or you can run Alembic):
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

#### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Launch the Vite development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the local server URL (usually [http://localhost:5173](http://localhost:5173)).

---

## 📚 Learning Path & Key Concepts (For Beginners)

If you are new to software engineering or AI application development, here are the core topics and terms used in this project that you should learn:

### 1. Backend Development (FastAPI & Python)
*   **FastAPI Basics**: Understand how API requests (GET, POST, PUT, DELETE) work and how parameters are sent between the frontend and backend.
*   **Pydantic (Data Schemas)**: Learn how Pydantic is used to validate data sent to your API (e.g., ensuring a transaction has a name, a number for the price, and a valid date).
*   **SQLAlchemy (Database ORM)**: Learn how to use Python classes (Models) to create database tables and query them instead of writing raw SQL queries.
*   **JWT Token Authentication**: Understand how user logins are secured using tokens (JSON Web Tokens) so users remain securely logged in.
*   **Alembic (Database Migrations)**: Learn how database schema changes are tracked over time.

### 2. Frontend Development (React & TypeScript)
*   **TypeScript Basics**: Learn how TypeScript adds "types" to JavaScript (e.g., defining that a `User` object must have a `name: string` and `income: number`) to prevent bugs before the code runs.
*   **Zustand (State Management)**: Learn how Zustand is used as a global storage center (like a bank) to fetch and store goals, purchases, and user data.
*   **Recharts**: Learn how to use this library to render responsive charts (like the budget allocation donut chart and the financial score circle).
*   **Tailwind CSS (Grid & Flexbox)**: Look at how layout utility classes are used to arrange cards side-by-side or stack them on mobile screens.

### 3. Generative AI Engineering (Google Gemini API)
*   **System vs. User Prompts**: Learn how to write instructions that define the AI's persona (e.g., *"You are a professional AI Financial Coach. Do not give direct stock tips..."*).
*   **Context Injection**: Learn how to query database records, format them as text, and insert them into the AI prompt so the AI can give personalized answers.
*   **Structured JSON Output**: Learn how to force the AI to return data in a clean JSON format (with specific keys like `"need_score"` and `"alternatives"`) rather than conversational paragraphs, so the frontend code can read it.
*   **Deterministic Fallbacks**: Learn how to write rule-based code (standard math) to handle situations where the AI API is down or the user doesn't have an API key.

### 4. DevOps & Tooling (Deployment)
*   **Docker & Docker Compose**: Learn how Docker bundles your code, database, and libraries into a container that can run on any computer. Understand how `docker-compose.yml` launches the database, backend, and frontend together.
*   **Environment Variables (`.env`)**: Learn why we store keys and database paths in `.env` files rather than hardcoding them in the source code.

---

## 💡 Production GenAI Engineering Roadmap (For AI/GenAI Roles)

If you are presenting this project for **AI Engineer** or **GenAI Engineer** roles, the codebase can be upgraded with standard production-grade agentic design patterns. 

For full architectural diagrams, implementation logic, and ready-to-use resume bullet points, see the detailed [GenAI Engineering Roadmap](file:///home/vrunda/.gemini/antigravity/brain/f30d3a76-b578-4610-b33f-156bfef24837/genai_engineering_roadmap.md).

### Quick Summary of Upgrades:
1.  **Semantic Caching (pgvector)**: Store embeddings of evaluated items in PostgreSQL. If similarity exceeds **92%**, serve cached verdicts instantly (<30ms) to reduce LLM token costs.
2.  **Structured Outputs (Pydantic & Instructor)**: Guard against LLM formatting hallucinations by enforcing rigid JSON schemas and self-correction loops on JSON parsing.
3.  **Agentic Tool Use (Function Calling)**: Allow Gemini to dynamically execute backend Python functions to fetch user data only when needed, replacing token-heavy prompt injections.
4.  **Financial Document RAG**: Index official tax codebooks and finance guides in a vector store to ground the AI Coach's advice in verified sources.
5.  **LLMOps & Observability**: Trace LLM calls, latency, and costs using tracing platforms like Langfuse.
