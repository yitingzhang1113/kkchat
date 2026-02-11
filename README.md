# KKChat — Distributed Real-Time Messaging System

KKChat is a real-time chat system built with a Vue.js frontend and a Go backend. It supports user accounts, contacts, one-to-one and group messaging, file sharing, and voice/video signaling.

## 🏗️ System Architecture

KKChat (KamaChat) is designed as a **distributed, production-grade real-time messaging system**, following a layered and microservice-oriented architecture.  
The system emphasizes **high concurrency, scalability, real-time communication, and clean separation of concerns**, closely resembling architectures used in large-scale IM platforms.

![KKChat Architecture](image.png)

---

### Architecture Overview

The system is organized into five major layers:

- Client Layer
- Gateway & Network Layer
- Microservices Layer
- Middleware & Infrastructure Layer
- Data Storage Layer

Each layer is independently scalable and loosely coupled to support future extensions and high-availability deployment.

---

### Client Layer

**Web Client (Vue.js)**  
- Provides user-facing interfaces for:
  - Authentication
  - Contact management
  - One-to-one chat and group chat
  - File and media messaging
  - Voice and video call interactions
- Communicates with backend services via:
  - RESTful APIs (HTTP)
  - WebSocket connections for real-time messaging

**Mobile Client (Future Extension)**  
- Architecture is designed to support mobile clients without backend changes
- Shares the same API Gateway and WebSocket Gateway

---

### Gateway & Network Layer

**Load Balancer / API Gateway (Nginx / Traefik)**  
- Acts as the unified entry point for HTTP-based requests
- Responsibilities:
  - Traffic routing
  - Load balancing
  - Basic security policies
  - Request forwarding to backend microservices

**WebSocket Gateway (Go)**  
- Maintains long-lived WebSocket connections
- Handles:
  - Real-time message delivery
  - Online/offline presence awareness
  - Bidirectional communication between clients and backend services
- Decouples real-time communication from core business logic

---

### Microservices Layer (Go)

The backend follows a **microservice-based architecture**, with each service owning its own domain logic.

**Auth Service**  
- JWT / session-based authentication
- User identity validation
- Access control

**User & Contact Service**  
- User profile management
- Contact relationships
- Friend requests, acceptance, rejection, and blocking

**Chat Message Service (Core Logic)**  
- Core message processing service
- Handles:
  - One-to-one chat
  - Group chat message routing
  - Message persistence triggers
- Publishes messages to Kafka for asynchronous processing

**Group Service**  
- Group creation and management
- Group membership and roles
- Group-level permissions

**File & Media Service**  
- File upload and download
- Media metadata management
- Integrates with object storage (S3 / MinIO)

**Signaling Service (Voice / Video Call Setup)**  
- Handles call signaling logic
- Call invitation, acceptance, rejection, and termination
- Designed to integrate with real-time media services

**Admin Management Service**  
- Backend administration tools
- Group moderation (enable / disable / delete)
- User role management

---

### Middleware & Infrastructure Layer

**Apache Kafka (Message Queue)**  
- Serves as the backbone for asynchronous messaging
- Used for:
  - Chat message distribution
  - Event-driven processing
  - Decoupling real-time traffic from persistence and downstream services
- Improves system throughput and fault tolerance

**Redis (Cache & Presence Management)**  
- Caches frequently accessed data
- Stores:
  - User session data
  - Online presence information
  - Temporary state for real-time features
- Reduces database load and improves response latency

---

### Data Storage Layer

**Relational Database (MySQL / PostgreSQL)**  
- Persistent storage for:
  - Users
  - Contacts
  - Messages
  - Groups
  - System metadata
- Designed with normalized schemas for consistency and integrity

**Object Storage (S3 / MinIO)**  
- Stores large binary assets:
  - Files
  - Images
  - Videos
- Decouples media storage from core services for scalability

---

### Request & Message Flow

1. Client sends HTTP or WebSocket requests
2. Requests pass through the API Gateway or WebSocket Gateway
3. Business logic is handled by corresponding microservices
4. Messages are published to Kafka for asynchronous processing
5. Redis is used for caching and presence checks
6. Data is persisted in the relational database or object storage
7. Real-time updates are pushed back to clients via WebSocket

---

### Architectural Highlights

- **Real-time first design** using WebSocket
- **Asynchronous message processing** via Kafka
- **Microservice isolation** for better scalability
- **Cloud-ready architecture** suitable for distributed deployment
- **Production-oriented design**, not a demo-level system

This architecture provides a solid foundation for building a scalable, high-concurrency instant messaging platform similar to modern commercial chat applications.
