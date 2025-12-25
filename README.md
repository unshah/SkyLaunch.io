# ✈️ SkyLaunch

**Smart Flight Training Companion for Student Pilots**

SkyLaunch is a mobile app that helps student pilots manage their Private Pilot License (PPL) training journey with intelligent scheduling, real-time weather integration, and progress tracking.

It is an open-source web application designed to help student pilots and CFIs manage their training journey with intelligent scheduling, real-time weather integration, and progress tracking.

Built and maintained by Ujjwal Shah (https://ushah.me) a private pilot and software engineer, SkyLaunch focuses on practical impact, clean architecture, and real-world usability. It is currently in active development and is available for free on the App Store and Google Play.

### Why Skylauch Exists

- Many student pilots and CFIs face challenges in managing their training journey. 
- Limited visibility or insights
- Poor user experience
- I myself faced these challenges and I wanted to solve them for the community. If it helps even one person, it was worth it.

Existing tools often:

 - Are expensive or inaccessible
 - Require heavy customization
 - Do not scale well for smaller teams or individual users

Skylauch was created to solve this gap with a lightweight, extensible, and accessible approach.

### Key Contributions & Innovations

SkyLaunch introduces several original technical and architectural contributions, including:

⚙️ [Adaptive Scheduling] – Weather-aware scheduling, intelligent prioritization, and prerequisite tracking

🧩 [Real-time Weather Integration] – METAR fetching, crosswind calculations, flight category assessment, and training suitability recommendations

🚀 [Progress Tracking] – Flight log management, task completion status, pace calculations, and visual progress rings

These design decisions were developed through hands-on experience building production systems and reflect real-world constraints rather than theoretical implementations.

<p align="center">
  <img src="https://img.shields.io/badge/Expo-~54.0.30-blue?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-~5.9.2-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-^2.89.0-green?logo=supabase" alt="Supabase" />
</p>

---

## ✨ Features

### 📅 Adaptive Scheduling
- **Weather-aware scheduling** — Integrates with METAR data to schedule flights only on suitable VFR days
- **Smart prioritization** — Automatically prioritizes maneuvers needing more practice
- **Prerequisite tracking** — Ensures proper training sequence based on FAA requirements
- **Customizable sessions** — Adjust max sessions per day and session duration

### 🌤️ Real-Time Weather Integration
- **METAR fetching** from AviationWeather.gov
- **Crosswind calculations** with actual runway data from AirportDB
- **Flight category assessment** (VFR/MVFR/IFR/LIFR)
- **Training suitability recommendations**

### 📊 Progress Tracking
- **Flight log management** — Track total, solo, cross-country, and night hours
- **Task completion status** — Monitor progress through PPL curriculum
- **Pace calculations** — Estimated completion dates based on training frequency
- **Visual progress rings** — Beautiful UI to visualize your journey

### 👨‍✈️ CFI Integration
- **Student management** — CFIs can track multiple students
- **Maneuver grading** — Grade students on ACS maneuvers
- **Endorsement tracking** — Digital endorsement management
- **Invite codes** — Easy student-CFI linking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo (React Native) |
| **UI Library** | React + React Native |
| **State Management** | Zustand |
| **Backend** | Supabase (Postgres + Auth) |
| **Navigation** | Expo Router |
| **Language** | TypeScript |
| **Testing** | Jest + ts-jest |
| **Animations** | React Native Reanimated |

---

## 📁 Project Structure

```
app-src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/             # Auth screens (login, signup)
│   ├── (cfi)/              # CFI-specific screens
│   ├── (main)/             # Student main screens
│   └── onboarding/         # Onboarding flow
├── components/ui/          # Reusable UI components
├── constants/              # Theme colors & training data
├── lib/                    # Utility modules (weather, scheduling, etc.)
├── stores/                 # Zustand state stores
├── types/                  # TypeScript types
└── supabase_schema*.sql    # Database schemas
```

---

### Real-World Impact

- To be determined...

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skylaunch.git
   cd skylaunch/app-src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Create a `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the SQL schemas in your Supabase dashboard:
   - `supabase_schema.sql` — Core tables
   - `supabase_schema_cfi.sql` — CFI-specific tables
   - `supabase_schema_scheduling.sql` — Scheduling tables

5. **Start the development server**
   ```bash
   npm start
   ```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Expected output: 33 tests passed ✅
```

---

## 📱 Platform Support

- iOS
- Android
- Web (via Expo Web)

---

## 🌐 External APIs

| API | Purpose |
|-----|---------|
| [AviationWeather.gov](https://aviationweather.gov) | METAR weather data |
| [AirportDB](https://airportdb.io) | Runway/airport information |

---

## 📄 Documentation

- [Technical Documentation](./docs/technical_documentation.md) — API references, state management, and architecture details
---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contributors are encouraged to:

- Submit issues
- Propose enhancements
- Open pull requests

### All contributions are reviewed with a focus on:

- Code quality
- Architectural consistency
- Educational value

### Steps to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Made with ❤️ for student pilots everywhere.

### Leadership & Stewardship

This project is Conceptualized, Architected, Implemented and Maintained by [Ujjwal Shah](https://ushah.me).

### Responsibilities include:

- Technical direction
- Code review and contributor guidance
- Documentation and educational content
- Long-term roadmap planning

---

<p align="center">
  <strong>Fly safe, fly smart! 🛫</strong>
</p>
