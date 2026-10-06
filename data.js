// Component content and guided scenarios.
// Component entries: title, subtitle, role, control, business relevance.
// Scenario steps: component ID, narration, optional state (blocked/offline).

const components = {
  intake: [
    "Controlled intake",
    "Request or approved import",
    "Receives a service request or a sealed import through an authorised channel.",
    "Validate the source and purpose; imported content requires scanning and approval.",
    "Creates a controlled entry point without suggesting a direct public-internet connection.",
  ],
  identity: [
    "Identity & access",
    "Verify user and device",
    "Checks the identity, role and device associated with a request.",
    "MFA, least privilege and device trust checks.",
    "Restricts access to authorised users and reduces unnecessary exposure.",
  ],
  policy: [
    "Policy & classification",
    "Authorise intended use",
    "Applies classification, purpose and data-access rules.",
    "Governance enforcement before processing or exchange.",
    "Supports consistent treatment of sensitive information across agencies.",
  ],
  services: [
    "Government services",
    "Process core transactions",
    "Hosts identity, records, tax and emergency-service workloads.",
    "Segmented services and governed internal interfaces.",
    "Core service delivery is designed to remain independent of AI availability.",
  ],
  data: [
    "Governed data",
    "Protect and trace records",
    "Stores operational records with metadata, classification and lineage.",
    "Encryption, sovereign key custody and retention controls.",
    "Preserves control, traceability and accountability over government information.",
  ],
  ai: [
    "Sovereign AI",
    "Advisory assistance",
    "Operational AI assists metadata and classification; decision intelligence uses approved secondary data.",
    "Approved models, access controls and logged prompts and responses.",
    "Supports analysis and knowledge discovery without taking final decision authority.",
  ],
  human: [
    "Human approval",
    "Accountable decisions",
    "An authorised official reviews AI advice or completes a manual assessment.",
    "Mandatory human review and approval for advisory decisions.",
    "Keeps responsibility with people and preserves a manual path.",
  ],
  audit: [
    "Local monitoring & audit",
    "Record and investigate",
    "Captures events for local monitoring and auditable decision records.",
    "SIEM, protected logs and incident-response procedures.",
    "Provides evidence for oversight and supports threat detection.",
  ],
  outcome: [
    "Controlled outcome",
    "Release authorised results",
    "Releases an approved service result or data-sharing package.",
    "Outcome-release and internal-exchange policies.",
    "Delivers services while preserving control over what is shared.",
  ],
  backup: [
    "Offline backup",
    "Protected recovery copies",
    "Maintains encrypted recovery copies separated from routine operations.",
    "Validate integrity and select a clean recovery point.",
    "Provides a recovery option after corruption or an incident.",
  ],
  dr: [
    "Separate recovery site",
    "Restore priority services",
    "Supports recovery outside the affected primary environment.",
    "Authorised recovery runbooks and tested restoration procedures.",
    "Supports continuity; actual recovery time depends on deployment and drills.",
  ],
};
const scenarios = [
  {
    name: "Citizen service",
    sub: "Authorised request to outcome",
    title: "Follow one authorised request.",
    desc: "See how identity, policy and data controls support a government service.",
    out: "Expected outcome: an authorised service result with an auditable trail.",
    steps: [
      ["intake", "A request enters through a controlled service channel."],
      ["identity", "The user and device pass the simulated identity checks."],
      [
        "policy",
        "The role, purpose and data classification permit this request.",
      ],
      [
        "services",
        "The responsible government service processes the transaction.",
      ],
      ["data", "Required records are accessed under data-governance controls."],
      ["audit", "The service action is recorded for accountability."],
      [
        "outcome",
        "The authorised result is released through a controlled channel.",
      ],
    ],
  },
  {
    name: "Access denied",
    sub: "Policy enforcement in action",
    title: "Stop an unauthorised request.",
    desc: "A valid identity alone does not grant access to every government record.",
    out: "Expected outcome: the request is denied, logged and available for review.",
    steps: [
      ["intake", "A simulated request asks for a restricted record."],
      [
        "identity",
        "Identity is verified, but access still requires policy approval.",
      ],
      [
        "policy",
        "The requested purpose or role does not permit access. Request blocked.",
        "blocked",
      ],
      [
        "audit",
        "The denial is logged for investigation. No restricted record is released.",
      ],
    ],
  },
  {
    name: "AI decision support",
    sub: "Advice with human approval",
    title: "Use AI. Preserve accountability.",
    desc: "Approved secondary information supports advice; an official controls the decision.",
    out: "Expected outcome: a human-approved decision with traceable AI assistance.",
    steps: [
      ["identity", "An authorised officer starts an advisory assessment."],
      ["policy", "Policy checks permit this purpose and information scope."],
      ["data", "Approved secondary information is selected for analysis."],
      ["ai", "Local knowledge retrieval supports a simulated recommendation."],
      [
        "human",
        "The officer reviews evidence and approves or rejects the advice.",
      ],
      ["audit", "The recommendation and human decision are recorded."],
      [
        "outcome",
        "Only the authorised decision proceeds to a business outcome.",
      ],
    ],
  },
  {
    name: "AI unavailable",
    sub: "Continue through a manual path",
    title: "Keep core services independent.",
    desc: "This scenario removes AI assistance while retaining human-led processing.",
    out: "Expected outcome: service processing continues through a manual decision path; it may take longer.",
    steps: [
      ["intake", "An advisory request is received."],
      ["identity", "Identity and role checks remain in force."],
      ["policy", "Normal policy checks still apply."],
      [
        "ai",
        "AI assistance is unavailable in this simulated scenario.",
        "offline",
      ],
      ["human", "An authorised officer performs a manual assessment."],
      ["services", "The core service executes the approved business action."],
      ["audit", "The manual decision and action are logged."],
      ["outcome", "The approved outcome is released without AI assistance."],
    ],
  },
  {
    name: "Recovery exercise",
    sub: "Primary environment unavailable",
    title: "Demonstrate recovery readiness.",
    desc: "Walk through an illustrative incident and restoration sequence.",
    out: "Proposed report targets: RTO ≤ 4 hours; RPO ≤ 30 minutes. Targets are not measured results and require validation.",
    steps: [
      [
        "services",
        "The primary service environment is unavailable in this exercise.",
        "blocked",
      ],
      [
        "audit",
        "The incident is declared and the affected environment is isolated.",
      ],
      [
        "backup",
        "Operators verify a clean backup and an appropriate recovery point.",
      ],
      ["dr", "The authorised recovery procedure restores priority workloads."],
      [
        "human",
        "Service owners validate integrity and readiness before release.",
      ],
      [
        "outcome",
        "Priority services resume from the recovery environment after approval.",
      ],
    ],
  },
];
