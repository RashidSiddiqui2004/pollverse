# Pollverse - Interactive Media & Polling Platform

Project **Pollverse** is a dynamic, social media and interactive web application designed to merge high-fidelity rich media sharing with deep, real-time community engagement. Users can seamlessly share media and interact with highly configurable polls, offering features beyond traditional static platforms such as option-specific reactions, live analytics, and fluid vote modification.

## 🚀 Core Features

### 👤 User Identity & Experience
- **Secure Authentication:** Quick sign-up and login via Email/Password, Google OAuth, and Apple ID.
- **Dynamic User Profiles:** Customizable bios, avatars, and a dedicated timeline tracking all user posts, cast votes, and active polls.
- **Tactile UI/UX:** Built-in micro-interactions and instant feedback loops tailored for mobile web environments.

### 📸 Rich Media Posting
- **Multi-Format Uploads:** Support for single or multiple high-resolution images (JPEG, PNG) and compressed video formats (MP4, MOV up to 60 seconds).
- **Infinite Scroll Feed:** A unified feed with lazy-loading and smart-caching mechanisms optimizing media asset delivery.
- **Standard Social Interactions:** Full system capabilities for liking, nested commenting, and cross-platform sharing.

### 🗳️ Advanced Interactive Polling System
- **Multimedia Polls:** Post creators can establish text-based, image-based, or video-based options (up to 6 choices) with customizable expiration timers.
- **Multi-Operation Voting:** Voters have the autonomy to cast their vote, retract a selection, or switch choices at any time prior to poll expiration.
- **Real-Time WebSocket Sync:** Live processing updates percentages instantaneously as votes roll in, utilizing dual-channel data push mechanisms.
- **Granular Emoji Reactions:** Users can react with expressive emojis globally to the poll, or contextually to **individual options** inside the poll.
- **Creator Dashboard Analytics:** Visual representations of anonymized demographic information, regional statistics, and engagement spikes.

## 🛠️ System Architecture & Tech Stack

Pulse is engineered with a decoupled, horizontally scalable system architecture ensuring high availability and sub-200ms latency.

- **Frontend:** Next.js (TypeScript) optimized with Tailwind CSS and Zustand for global state management.
- **Backend:** Next.js (TypeScript) API Routes for core business logic.
- **Real-Time Engine:** Socket.io / WebSockets for pub/sub instantaneous data streaming.
- **Databases:** - PostgreSQL (Relational schema for transactional data: Profiles, Media paths, Post tracking).
  - Redis (In-memory caching for active polling counters, preventing database bottlenecks).
- **Media Architecture:** AWS S3 or Cloudinary storage, coupled with an automated transcoding pipeline (HLS streaming) to scale resolution to variable internet speeds.