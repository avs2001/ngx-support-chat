# Software Detailed Design: TASK-XXX - [Component Name]

**Document ID:** SDD-TASK-XXX
**Version:** 1.0
**Created:** YYYY-MM-DD | Session X
**Last Updated:** YYYY-MM-DD | Session Y
**Status:** [Draft | In Review | Approved | Implemented]

---

## 1. Overview

### 1.1 Purpose

[What this software component/unit does and why it exists]

### 1.2 Scope

**In Scope:**
- [Functionality included]

**Out of Scope:**
- [Functionality excluded]

### 1.3 References

| Document | Location |
|----------|----------|
| Task Plan | `docs/project_tasks/TASK-XXX-plan.md` |
| System Architecture | `docs/architecture/system_architecture.md` |

---

## 2. Architecture Context

### 2.1 Component Overview

[How this component fits in the overall system]

```
[Simple ASCII diagram showing component relationships]
```

### 2.2 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| [component/library] | Internal/External | [why needed] |

---

## 3. Software Units

### 3.1 Unit: [UnitName]

**Purpose:** [What this unit does]
**File:** `src/path/to/file.py`

#### Interface

```python
def function_name(param1: Type, param2: Type) -> ReturnType:
    """Brief description."""
```

#### Algorithm

[Description of key algorithm or logic]

#### Error Handling

| Error Condition | Response |
|-----------------|----------|
| [condition] | [what happens] |

---

### 3.2 Unit: [NextUnit]

[Repeat for each unit]

---

## 4. Interfaces

### 4.1 External Interfaces

| Interface | Type | Purpose |
|-----------|------|---------|
| [API/file/service] | [REST/File/etc] | [purpose] |

### 4.2 Internal Interfaces

| From | To | Purpose |
|------|-----|---------|
| [unit] | [unit] | [purpose] |

---

## 5. Data Structures

### 5.1 Key Data Models

```python
@dataclass
class ModelName:
    """Description."""
    field1: Type  # description
    field2: Type  # description
```

### 5.2 Database Schema (if applicable)

```sql
CREATE TABLE table_name (
    column1 TYPE,
    column2 TYPE
);
```

---

## 6. Design Decisions

| Decision | Rationale | Session |
|----------|-----------|---------|
| [what was decided] | [why] | X |

---

## 7. Revision History

| Version | Date | Session | Changes |
|---------|------|---------|---------|
| 1.0 | YYYY-MM-DD | X | Initial creation |

---

**Template Version:** 2.0 (Simple - Non-Regulated)
**For IEC 62304 regulated projects, use SDD_TEMPLATE.md**
