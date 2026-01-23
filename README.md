# ✈️ SkyLaunch
**The Open Source Flight Training Progression Engine**

<p align="center">
  <img src="https://img.shields.io/badge/Expo-~54.0.30-blue?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-~5.9.2-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Status-Public%20Beta-orange" alt="Status" />
</p>

> **"Part 61 flexibility meets Part 141 structure."**

SkyLaunch is an offline-first mobile application that acts as a **state manager for student pilot proficiency.** It decouples training data from paper logbooks, allowing students to visualize their progression against FAA Airman Certification Standards (ACS) in real-time.

Designed for the React Native ecosystem, it solves the specific data fragmentation issues found in general aviation flight training.

---

## 📸 Interface
| Syllabus Tracker | Weather Intelligence | Progress Rings |
|:---:|:---:|:---:|
| <img src="assets/images/image2.png" width="200" alt="Syllabus View" /> | <img src="assets/images/image4.png" width="200" alt="Weather View" /> | <img src="assets/images/image0.png" width="200" alt="Progress View" /> |

---

## 🧠 The Engineering Challenge (Why this exists)

Flight training in the US operates under two regulations: Part 141 (Rigid/School-based) and Part 61 (Flexible/Freelance). While Part 61 offers flexibility, it suffers from **systemic data fragmentation**:

1.  **State Management Failure:** When a student changes instructors, their "training state" (proficiency in specific maneuvers) is lost or relies on subjective paper notes.
2.  **Lack of Deterministic Scheduling:** Go/No-Go decisions are often made based on "gut feeling" rather than data, leading to wasted commute times for students when crosswinds exceed personal minimums.
3.  **Linear Logging vs. Non-Linear Learning:** Traditional logbooks track *time* (linear), but flight proficiency is *asymptotic*. Existing tools fail to visualize this difference.

**SkyLaunch solves this by treating the FAA ACS as a data schema, linking individual flight telemetry to certification milestones.**

---

## ✨ Core Architecture & Features

### ⚙️ Deterministic Scheduling Engine
Unlike standard calendar apps, SkyLaunch uses a "Constraint-Based" scheduling logic:
* **VFR-Lock:** Integrates real-time METAR data to flag slots as "No-Go" if ceiling/visibility drops below student minimums.
* **Curriculum Prioritization:** Automatically suggests the next maneuver based on the "decay rate" of previously learned skills.

### 🧩 Offline-First Architecture
Built for the cockpit environment (iPad Mini/Cellular), where connectivity is intermittent at 5,000ft.
* **Local Database:** Uses SQLite (via WatermelonDB) for sub-millisecond query speeds.
* **Sync Strategy:** "Optimistic UI" updates that sync to Supabase when the aircraft is back on the ramp.

### 📊 The "Proficiency Graph"
* **Visualizing Competence:** Replaces the paper logbook with dynamic "Progress Rings."
* **Pace Algorithms:** Calculates Estimated Time of Arrival (ETA) for checkride readiness based on current flight frequency and skill acquisition velocity.

---

## 🛠️ Tech Stack

| Layer | Technology | Decision Rationale |
|-------|------------|-------------------|
| **Framework** | Expo (React Native) | Single codebase for iOS/Android; OTA update capability. |
| **State** | Zustand | Transient state management for flight recording sessions. |
| **Backend** | Supabase | Postgres Row Level Security (RLS) ensures student data privacy. |
| **Persistence** | SQLite | Critical for offline-first cockpit functionality. |
| **Testing** | Jest + ts-jest | Ensures reliability of pace calculation algorithms. |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* Expo CLI
* Supabase Account (Free Tier works)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/SkyLaunch.git](https://github.com/yourusername/SkyLaunch.git)
    cd SkyLaunch/app-src
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
    EXPO_PUBLIC_AIRPORT_DB_TOKEN=your_token
    ```

4.  **Database Migration**
    Run the following SQL schemas (located in project root) via the Supabase Dashboard SQL Editor:
    - `supabase_schema.sql` — Core tables
    - `supabase_schema_cfi.sql` — CFI-specific tables
    - `supabase_schema_scheduling.sql` — Scheduling tables

5.  **Lift off**
    ```bash
    npx expo start
    ```

---

## 🤝 Project Stewardship

This project is architected and maintained by **[Ujjwal Shah](https://ushah.me)**.

SkyLaunch is an open effort to modernize general aviation software. We strictly adhere to "Clean Architecture" principles to ensure the codebase remains accessible to developer-pilots who wish to contribute.

**How to Contribute:**
* **Student Pilots:** Submit feature requests via Issues regarding UI/UX friction in the cockpit.
* **Developers:** Check the `Good First Issue` tag. We are specifically looking for help optimizing the vector map rendering on older Android devices.

---

## 📄 License
MIT License - Free for all Part 61 and Part 141 students forever.

<p align="center">
  <strong>Fly Safe. Fly Smart.</strong>
</p>