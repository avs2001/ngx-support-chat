# Software Detailed Design: TASK-XXX - [Component Name]

**Document ID:** SDD-TASK-XXX
**Version:** 1.0
**Created:** YYYY-MM-DD | Session X
**Last Updated:** YYYY-MM-DD | Session Y
**Status:** Draft
**IEC 62304 Class:** B

---

## 1. Introduction

### 1.1 Purpose

[Clear statement of what this software component/unit does and why it exists]

### 1.2 Scope

**In Scope:**
- [Functionality included]

**Out of Scope:**
- [Functionality explicitly excluded]

### 1.3 References

| Document | Location | Purpose |
|----------|----------|---------|
| Task Plan | `docs/project_tasks/TASK-XXX-plan.md` | Original requirements |
| System Architecture | `docs/architecture/system_architecture.md` | System context |
| Component Architecture | `docs/architecture/[component]_architecture.md` | Component context |

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### 1.5 Requirements Traceability

| Requirement ID | Description | SDD Section | Verification Method |
|----------------|-------------|-------------|---------------------|
| REQ-XXX-001 | [Requirement description] | 3.1 | Unit Test |
| REQ-XXX-002 | [Requirement description] | 3.2 | Integration Test |

---

## 2. Architecture Context

### 2.1 System Context

[Describe how this component fits within the overall system architecture]

```
┌─────────────────────────────────────────────────────────┐
│                      System                              │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌──────────┐      │
│  │Component │───▶│ THIS         │───▶│Component │      │
│  │    A     │    │ COMPONENT    │    │    C     │      │
│  └──────────┘    └──────────────┘    └──────────┘      │
│                         │                               │
│                         ▼                               │
│                  ┌──────────┐                          │
│                  │ External │                          │
│                  │ Service  │                          │
│                  └──────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Overview

[High-level description of the component's responsibilities and behavior]

### 2.3 Dependencies

#### 2.3.1 Internal Dependencies

| Component | Interface | Purpose |
|-----------|-----------|---------|
| [Component name] | [API/Function] | [Why needed] |

#### 2.3.2 External Dependencies

| Library/Service | Version | Purpose | License |
|-----------------|---------|---------|---------|
| [Library] | [Version] | [Purpose] | [License] |

### 2.4 Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| [Constraint] | [Description] | [How it affects design] |

---

## 3. Software Units

### 3.1 Unit: [UnitName1]

**Purpose:** [What this unit does]
**File:** `src/path/to/file.py`
**Responsibility:** [Single responsibility description]

#### 3.1.1 Interface

```python
class ClassName:
    """
    Brief class description.

    Attributes:
        attr1 (Type): Description
        attr2 (Type): Description
    """

    def method_name(self, param1: Type, param2: Type) -> ReturnType:
        """
        Brief method description.

        Args:
            param1: Description of param1
            param2: Description of param2

        Returns:
            Description of return value

        Raises:
            ExceptionType: When condition occurs
        """
        pass
```

#### 3.1.2 Algorithm

**Algorithm Name:** [Name]
**Purpose:** [What it accomplishes]

```
ALGORITHM: [Name]
INPUT: [Input parameters]
OUTPUT: [Output]

1. [Step 1]
2. [Step 2]
   2.1. [Sub-step if condition]
   2.2. [Sub-step otherwise]
3. [Step 3]
4. RETURN [result]
```

**Complexity:** O(n) time, O(1) space
**Edge Cases:**
- [Edge case 1]: [How handled]
- [Edge case 2]: [How handled]

#### 3.1.3 Data Structures

```python
@dataclass
class DataStructureName:
    """Description of the data structure."""

    field1: Type          # Description
    field2: Type          # Description
    field3: Optional[Type] = None  # Description

    def validate(self) -> bool:
        """Validation logic."""
        pass
```

#### 3.1.4 State Management

| State | Description | Transitions To |
|-------|-------------|----------------|
| [State1] | [Description] | [State2, State3] |
| [State2] | [Description] | [State1, State3] |

#### 3.1.5 Error Handling

| Error Condition | Exception Type | Response | Recovery |
|-----------------|----------------|----------|----------|
| [Condition] | [ExceptionType] | [What happens] | [How to recover] |

---

### 3.2 Unit: [UnitName2]

[Repeat structure for each software unit]

---

## 4. Interfaces

### 4.1 External Interfaces

#### 4.1.1 REST API Endpoints

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/resource` | GET | Get resource | Query params | JSON |
| `/api/resource` | POST | Create resource | JSON body | JSON |

**Request/Response Examples:**

```json
// POST /api/resource
// Request:
{
    "field1": "value1",
    "field2": 123
}

// Response (201 Created):
{
    "id": "uuid",
    "field1": "value1",
    "field2": 123,
    "created_at": "2025-01-01T00:00:00Z"
}
```

#### 4.1.2 File Interfaces

| File | Format | Purpose | Schema |
|------|--------|---------|--------|
| `input.csv` | CSV | Input data | [Schema reference] |
| `output.json` | JSON | Output results | [Schema reference] |

#### 4.1.3 External Service Interfaces

| Service | Protocol | Authentication | Rate Limits |
|---------|----------|----------------|-------------|
| [Service] | HTTPS/REST | API Key | 100 req/min |

### 4.2 Internal Interfaces

| From Unit | To Unit | Interface | Data Flow |
|-----------|---------|-----------|-----------|
| [Unit1] | [Unit2] | [Function/Method] | [Description] |

---

## 5. Data Design

### 5.1 Data Model

```
┌─────────────────┐       ┌─────────────────┐
│     Entity1     │       │     Entity2     │
├─────────────────┤       ├─────────────────┤
│ id: UUID (PK)   │──────▶│ id: UUID (PK)   │
│ name: String    │       │ entity1_id: FK  │
│ created_at: DT  │       │ value: Float    │
└─────────────────┘       └─────────────────┘
```

### 5.2 Database Schema

```sql
-- Table: entity1
CREATE TABLE entity1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: entity2
CREATE TABLE entity2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity1_id UUID NOT NULL REFERENCES entity1(id),
    value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entity2_entity1_id ON entity2(entity1_id);
```

### 5.3 Data Validation Rules

| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| name | String | Non-empty, max 255 chars | "Name is required and must be <= 255 characters" |
| value | Decimal | Positive number | "Value must be a positive number" |

### 5.4 Data Flow

```
[Input Source]
    │
    ▼
[Validation Unit] ──▶ [Error Handler]
    │
    ▼
[Processing Unit]
    │
    ▼
[Persistence Unit] ──▶ [Database]
    │
    ▼
[Output Formatter]
    │
    ▼
[Output Destination]
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

| Resource | Auth Required | Roles Allowed |
|----------|---------------|---------------|
| [Resource] | Yes | Admin, User |

### 6.2 Data Protection

| Data Type | Classification | Protection Mechanism |
|-----------|----------------|---------------------|
| User credentials | Sensitive | Hashed (bcrypt) |
| API keys | Secret | Encrypted at rest |

### 6.3 Input Validation

| Input | Validation | Sanitization |
|-------|------------|--------------|
| User input | Whitelist allowed chars | HTML escape |
| File uploads | Type check, size limit | Virus scan |

### 6.4 Security Controls

- [ ] Input validation on all external inputs
- [ ] Output encoding for all outputs
- [ ] Parameterized queries for database access
- [ ] Secure session management
- [ ] Error messages don't leak sensitive information

---

## 7. Performance Considerations

### 7.1 Performance Requirements

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| Response time | < 200ms (p95) | API latency |
| Throughput | > 100 req/sec | Load test |

### 7.2 Optimization Strategies

| Strategy | Applied To | Expected Impact |
|----------|------------|-----------------|
| Caching | [Component] | 50% latency reduction |
| Indexing | [Table] | 10x query speedup |

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Unit | Test Cases | Coverage Target |
|------|------------|-----------------|
| [Unit1] | [Test case list] | 80% |
| [Unit2] | [Test case list] | 80% |

### 8.2 Integration Tests

| Integration Point | Test Scenario | Expected Result |
|-------------------|---------------|-----------------|
| [A ↔ B] | [Scenario] | [Result] |

### 8.3 Test Data Requirements

| Test Type | Data Required | Source |
|-----------|---------------|--------|
| Unit tests | Mock data | Fixtures |
| Integration | Sample dataset | `tests/data/` |

---

## 9. Design Decisions

| ID | Decision | Rationale | Alternatives Considered | Session |
|----|----------|-----------|------------------------|---------|
| DD-001 | [Decision] | [Why this choice] | [Other options] | X |
| DD-002 | [Decision] | [Why this choice] | [Other options] | Y |

---

## 10. Open Issues & Risks

| ID | Issue/Risk | Impact | Mitigation | Status |
|----|------------|--------|------------|--------|
| RISK-001 | [Description] | [Impact] | [Mitigation plan] | Open |

---

## 11. Revision History

| Version | Date | Session | Author | Changes |
|---------|------|---------|--------|---------|
| 1.0 | YYYY-MM-DD | X | Claude | Initial creation |
| 1.1 | YYYY-MM-DD | Y | Claude | Added Unit X |

---

## 12. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | | | |
| Reviewer | | | |
| Approver | | | |

---

**IEC 62304 Compliance Note:**
This document fulfills Software Detailed Design requirements per IEC 62304:2006+A1:2015 Section 5.4 for Class B medical device software:
- 5.4.1: Software is subdivided into software units (Section 3)
- 5.4.2: Interfaces between software units are documented (Section 4)
- 5.4.3: Detailed design of each software unit is documented (Section 3.x)

**Template Version:** 1.0
**Compatible with:** SDP v2.0
