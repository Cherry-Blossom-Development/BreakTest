# Demo Recording System Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Development Machine
        subgraph BreakTest["BreakTest Framework"]
            DS[Demo Scripts<br/>01-breakroom-chat.demo.ts]
            RS[Recording Service]
            EUS[External User Service]
            PO[Page Objects]
        end

        subgraph Appium["Appium Server"]
            AD[Appium Driver]
            XCU[XCUITest Driver]
        end

        subgraph Simulator["iOS Simulator"]
            APP[Breakroom iOS App<br/>Demo Build]
            REC[Screen Recorder<br/>xcrun simctl]
        end

        subgraph Docker["Docker Container"]
            API[Demo API Server<br/>Port 3001]
        end
    end

    subgraph "Remote Server (EC2)"
        DB[(breakroom_test<br/>Database)]
    end

    DS --> AD
    AD --> XCU
    XCU --> APP
    RS --> REC
    REC --> VID[MP4 Video File]

    APP <--> API
    API <--> DB
    EUS --> DB

    DS --> RS
    DS --> EUS
    DS --> PO
    PO --> AD
```

## Data Flow

```mermaid
sequenceDiagram
    participant DS as Demo Script
    participant RS as Recording Service
    participant APP as iOS App
    participant API as Demo API
    participant EUS as External User Service
    participant DB as Test Database

    Note over DS,DB: Demo Setup Phase
    DS->>DB: Reset test data
    DS->>RS: Start recording

    Note over DS,DB: Demo Execution Phase
    DS->>APP: Login as DemoUser
    APP->>API: POST /auth/login
    API->>DB: Verify credentials
    DB-->>API: User authenticated
    API-->>APP: Session token

    DS->>APP: Navigate to Breakroom
    APP->>API: GET /breakroom/layout
    API->>DB: Fetch user's blocks
    DB-->>API: Block data
    API-->>APP: Layout JSON

    DS->>APP: Open Chat
    APP->>API: GET /chat/rooms/1/messages
    API-->>APP: Messages

    Note over EUS,DB: External User Sends Message
    DS->>EUS: sendChatMessage("Sarah", "Hello!")
    EUS->>DB: INSERT INTO chat_messages

    DS->>APP: Pull to refresh
    APP->>API: GET /chat/rooms/1/messages
    API->>DB: Fetch messages
    DB-->>API: Including new message
    API-->>APP: Updated messages

    DS->>APP: Type and send reply
    APP->>API: POST /chat/rooms/1/messages
    API->>DB: INSERT message

    Note over DS,DB: Demo Cleanup Phase
    DS->>RS: Stop recording
    RS-->>DS: Video saved
```

## Component Details

### Demo Scripts Layer

```mermaid
flowchart LR
    subgraph Scripts["Demo Scripts"]
        D1[01-breakroom-chat]
        D2[02-lyric-lab]
        D3[03-profile-settings]
    end

    subgraph Services["Support Services"]
        RS[RecordingService]
        EUS[ExternalUserService]
        DBS[DatabaseService]
    end

    subgraph Pages["Page Objects"]
        LP[LoginPage]
        BP[BreakroomPage]
        CP[ChatPage]
        LLP[LyricLabPage]
    end

    D1 --> RS
    D1 --> EUS
    D1 --> LP
    D1 --> BP
    D1 --> CP

    D2 --> RS
    D2 --> LP
    D2 --> LLP

    D3 --> RS
    D3 --> LP
```

### Database Schema (Demo-Relevant Tables)

```mermaid
erDiagram
    users ||--o{ breakroom_blocks : has
    users ||--o{ chat_messages : sends
    users ||--o{ users_rooms : "member of"
    chat_rooms ||--o{ chat_messages : contains
    chat_rooms ||--o{ users_rooms : "has members"

    users {
        int id PK
        string handle
        string first_name
        string last_name
        string email
        string hash
        string salt
    }

    chat_rooms {
        int id PK
        string name
        string description
        int owner_id FK
    }

    chat_messages {
        int id PK
        int room_id FK
        int user_id FK
        string message
        timestamp created_at
    }

    users_rooms {
        int user_id FK
        int room_id FK
        boolean accepted
        string role
    }

    breakroom_blocks {
        int id PK
        int user_id FK
        string block_type
        int content_id
        string title
        int x
        int y
    }
```

## Environment Configuration

```mermaid
flowchart TB
    subgraph Environments
        subgraph Production
            PA[prosaurus.com API]
            PD[(breakroom DB)]
            PA <--> PD
        end

        subgraph Demo["Demo Environment"]
            DA[localhost:3001 API]
            TD[(breakroom_test DB)]
            DA <--> TD
        end
    end

    subgraph Apps
        PROD_APP[Production App Build<br/>Points to prosaurus.com]
        DEMO_APP[Demo App Build<br/>Points to localhost:3001]
    end

    PROD_APP --> PA
    DEMO_APP --> DA
```

## File Structure

```
BreakTest/
│
├── demos/                              # Demo recording system
│   │
│   ├── config/
│   │   └── wdio.demo.conf.ts          # Appium config for demos
│   │
│   ├── pages/                          # iOS Page Objects
│   │   ├── BasePage.ts                # Common functionality
│   │   ├── LoginPage.ts               # Login screen interactions
│   │   ├── BreakroomPage.ts           # Home page interactions
│   │   ├── ChatPage.ts                # Chat screen interactions
│   │   └── LyricLabPage.ts            # Lyric Lab interactions
│   │
│   ├── services/
│   │   ├── RecordingService.ts        # xcrun simctl wrapper
│   │   ├── ExternalUserService.ts     # Simulates other users
│   │   └── DatabaseService.ts         # Test data management
│   │
│   ├── data/
│   │   ├── demoUsers.ts               # User credentials
│   │   └── demoContent.ts             # Scripted messages
│   │
│   ├── scripts/                        # Actual demo scripts
│   │   ├── 01-breakroom-chat.demo.ts
│   │   ├── 02-lyric-lab.demo.ts
│   │   └── 03-notifications.demo.ts
│   │
│   └── recordings/                     # Output videos
│       └── .gitkeep
│
├── database/
│   ├── schema.sql                      # Full DB schema
│   ├── seed-data.sql                   # Test users
│   └── demo-seed-data.sql             # Demo-specific data (NEW)
│
├── docker-compose.demo.yml             # Demo API container (NEW)
│
└── apps/
    └── Breakroom-Demo.app             # Demo build of iOS app
```

## Implementation Timeline

```mermaid
gantt
    title Demo System Implementation
    dateFormat  YYYY-MM-DD

    section Infrastructure
    Create demos/ folder structure     :a1, 2024-01-01, 1d
    Docker compose for demo API        :a2, after a1, 1d
    Demo seed data SQL                 :a3, after a1, 1d

    section iOS App
    Create Demo Xcode scheme           :b1, after a1, 1d
    Configure localhost API URL        :b2, after b1, 1d
    Build and test demo app            :b3, after b2, 1d

    section Core Services
    RecordingService implementation    :c1, after a2, 1d
    ExternalUserService implementation :c2, after a2, 1d
    DatabaseService implementation     :c3, after a2, 1d

    section Page Objects
    LoginPage                          :d1, after c1, 1d
    BreakroomPage                      :d2, after d1, 1d
    ChatPage                           :d3, after d2, 1d

    section Demo Scripts
    01-breakroom-chat demo             :e1, after d3, 1d
    Testing and refinement             :e2, after e1, 1d
    Additional demos                   :e3, after e2, 2d
```

## External User Simulation Detail

```mermaid
flowchart TB
    subgraph "Demo Script Execution"
        A[Demo script running]
        B{Need external<br/>user action?}
        C[Continue with<br/>app interactions]
    end

    subgraph "External User Service"
        D[ExternalUserService.<br/>sendChatMessage]
        E[Connect to<br/>breakroom_test DB]
        F[INSERT INTO<br/>chat_messages]
        G[Message stored<br/>in database]
    end

    subgraph "iOS App Response"
        H[App polls or<br/>refreshes chat]
        I[API returns<br/>new messages]
        J[Message appears<br/>in UI]
    end

    A --> B
    B -->|Yes| D
    B -->|No| C
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> C
    C --> A
```

## Recording Output Specifications

| Device | Resolution | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| iPhone 15 Pro Max | 1290 x 2796 | 19.5:9 | App Store 6.7" |
| iPhone 15 Pro | 1179 x 2556 | 19.5:9 | App Store 6.1" |
| iPad Pro 12.9" | 2048 x 2732 | 4:3 | App Store iPad |

## Quick Start Commands

```bash
# 1. Setup demo database
npm run demo:db:setup

# 2. Start demo API server
npm run demo:api:start

# 3. Boot iOS Simulator
xcrun simctl boot "iPhone 15 Pro"

# 4. Install demo app
xcrun simctl install booted ./apps/Breakroom-Demo.app

# 5. Run demo recording
npm run demo:record

# 6. Stop demo API
npm run demo:api:stop
```
