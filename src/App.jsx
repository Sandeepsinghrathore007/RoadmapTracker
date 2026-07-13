import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { loadTrackerState, saveTrackerState } from "./lib/trackerStorage";

// ============================================================================
// ROADMAP DATA — placeholder content matching your 6-month / 26-week structure.
// Swap the `title`, `kpi`, and `exit` fields per week with your real content;
// day tasks auto-generate from each week's title (7 per week).
// ============================================================================

// Source of truth: Cybersecurity-Internship-Roadmap-6Months.md
// Objective: signed internship offer by end of Month 6.
// Weeks 1-10 = pure skill + portfolio build. Week 11 = applications begin, never stop.

const RAW_MONTHS = [
  {
    month: 1,
    title: "Core Fundamentals",
    weeks: [
      {
        week: 1,
        title: "Networking Foundations I",
        objective: "OSI/TCP-IP model recall without notes, first GitHub repo live.",
        days: [
          "OSI 7 layers — what each layer does, one real-world analogy per layer. Set up GitHub repo `cybersec-journey`, push a README.",
          "TCP/IP model, how it maps to OSI. TCP vs UDP — differences, when each is used.",
          "TCP three-way handshake — draw it from memory 5 times until automatic.",
          "IP addressing — classes, public vs private ranges, NAT concept.",
          "Common ports and protocols (21, 22, 23, 25, 53, 80, 443, 445, 3389, etc.) — flashcard drill, 15 min, twice today.",
          "Install Wireshark. Capture your own browsing traffic. Identify a TCP handshake and a DNS query in the capture.",
          "(Revision) Redo the handshake diagram and port list from memory, no notes. Write a 1-page notes doc, commit to GitHub.",
        ],
        kpi: "Can explain OSI + TCP handshake out loud, unprompted, in under 3 minutes.",
        exit: "Port/protocol flashcard drill scores 90%+ without hints.",
      },
      {
        week: 2,
        title: "Networking Foundations II",
        objective: "Subnetting fluency, DNS/HTTP/TLS understood end-to-end.",
        days: [
          "Subnetting — CIDR notation, how to calculate subnet ranges by hand. 10 practice problems.",
          "Subnetting — 15 more practice problems until you can do a /24 → /27 split in under 60 seconds.",
          "DNS resolution flow — recursive vs authoritative, record types (A, CNAME, MX, TXT).",
          "HTTP/HTTPS — request/response structure, status codes, headers, cookies vs sessions.",
          "TLS handshake — certificate exchange, symmetric key negotiation, why HTTPS matters.",
          "Wireshark lab — capture an HTTPS session, identify the TLS handshake packets.",
          "(Revision) Timed subnetting drill (10 problems, 10 minutes). Commit notes.",
        ],
        kpi: "10/10 subnetting problems correct within time limit.",
        exit: "Can explain DNS resolution and TLS handshake from memory without hesitation.",
      },
      {
        week: 3,
        title: "Linux Fundamentals",
        objective: "Command-line fluency, first wargame progress.",
        days: [
          "Filesystem hierarchy, navigation, file operations (cp/mv/rm/find/grep).",
          "Permissions — chmod/chown numerically and symbolically, SUID/SGID/sticky bit concepts.",
          "Process management (ps, top, kill), systemd basics, cron jobs.",
          "Bash scripting — variables, conditionals, loops. Write a 10-line script that pings a list of IPs and reports which are up.",
          "OverTheWire Bandit — levels 0-8.",
          "OverTheWire Bandit — levels 9-16.",
          "(Revision) Bandit levels 17-20+ (as far as you get). Commit write-ups per level (2-3 lines: what it tested, how you solved it).",
        ],
        kpi: "15+ Bandit levels cleared with write-ups.",
        exit: "Can write a 15-line bash script without looking up syntax for basic constructs.",
      },
      {
        week: 4,
        title: "Core Security Concepts + Resume v1 + LinkedIn",
        objective: "Foundational security vocabulary solid; professional presence live.",
        days: [
          "CIA triad, AAA (authentication/authorization/accounting), threat vs vulnerability vs risk.",
          "Encryption vs hashing — symmetric vs asymmetric, common algorithms by name only (AES, RSA, SHA-256).",
          "Common attack types conceptually — phishing, malware, MITM, DoS/DDoS, social engineering (1 real example each).",
          "OWASP Top 10 — conceptual pass only, one sentence per item, no exploitation yet.",
          "Draft Resume v1 — header, 2-line summary, skills (Linux, Networking, Python, Bash), education, Bandit/networking progress as early proof points.",
          "Build LinkedIn profile — headline (role + 2 core skills), About section (3-4 lines), skills section populated.",
          "(Revision) Re-explain CIA triad, AAA, and 3 OWASP Top 10 items out loud, unscripted. Commit Resume v1 draft to GitHub.",
        ],
        kpi: "Resume v1 exists, LinkedIn is live and complete.",
        exit: "MONTH 1 GATE — Can explain OSI, TCP handshake, subnetting, CIA triad, and 3 OWASP items without notes. 20+ Bandit levels or equivalent Linux comfort. GitHub has 15+ commits.",
        milestone: "Resume v1 drafted, LinkedIn live",
      },
    ],
  },
  {
    month: 2,
    title: "Practical Tools + Dual-Track Skill",
    weeks: [
      {
        week: 5,
        title: "TryHackMe Pre Security Completion + Nmap",
        objective: "Close out foundational path, get hands-on with the industry's core recon tool.",
        days: [
          "TryHackMe \"Pre Security\" path — complete remaining modules.",
          "TryHackMe \"Pre Security\" path — complete remaining modules.",
          "Nmap — scan types (SYN, TCP connect, UDP), common flags (-sV, -sC, -A, -p-).",
          "Nmap — scripting engine basics (NSE), scan Metasploitable2 (set up the VM today if not already).",
          "Practice: scan 3 different target VMs, document open ports/services found for each.",
          "TryHackMe rooms tagged \"Nmap\" — 2-3 rooms.",
          "(Revision) Rescan a Day-3 target from memory, no notes. Commit scan write-ups.",
        ],
        kpi: "\"Pre Security\" path 100% complete. Can run and interpret an Nmap scan unaided.",
        exit: "Can explain what 5 different Nmap flags do without checking -h.",
      },
      {
        week: 6,
        title: "SOC Track Start + Windows Basics",
        objective: "Blue-team foundation begins; Windows fluency added (most SOC roles need it).",
        days: [
          "What is a SOC, what does a SOC analyst do day-to-day, tiers (L1/L2/L3) — orientation only.",
          "TryHackMe \"SOC Level 1\" path — begin (TryHackMe's current best entry-level blue-team track).",
          "Windows CLI/PowerShell basics — navigation, common cmdlets, comparing to Linux equivalents you already know.",
          "Continue SOC Level 1 path.",
          "Continue SOC Level 1 path.",
          "MITRE ATT&CK framework — what it is, how it's structured (tactics → techniques), fluency not memorization.",
          "(Revision) Explain the SOC analyst's job and MITRE ATT&CK structure out loud. Commit notes.",
        ],
        kpi: "SOC Level 1 path 25-30% complete.",
        exit: "Can explain what a SOC analyst does and what MITRE ATT&CK is for, in your own words, to a non-technical person.",
      },
      {
        week: 7,
        title: "Web Application Security Basics",
        objective: "OWASP Top 10 moves from conceptual to hands-on.",
        days: [
          "Set up OWASP Juice Shop and DVWA locally.",
          "SQL Injection — concept, then exploit it manually in DVWA (low security level).",
          "XSS — concept, then exploit reflected XSS in DVWA/Juice Shop.",
          "Broken Authentication + IDOR — concept and one hands-on example each.",
          "Install Burp Suite Community. Set up the proxy, intercept a request in your browser.",
          "Burp Suite — Repeater basics, modify and resend a request.",
          "(Revision) Redo SQLi and XSS exploitation from Day 2-3 without notes. Commit write-ups for each vuln (what it is, how you exploited it, how you'd fix it).",
        ],
        kpi: "4 OWASP Top 10 items exploited hands-on and documented.",
        exit: "Can demo and explain SQLi and XSS live, unscripted, in under 5 minutes each.",
      },
      {
        week: 8,
        title: "SIEM Lab + First Script Project + Resume v2",
        objective: "First real SOC-tooling exposure; first portfolio-grade project shipped.",
        days: [
          "Install Wazuh (single-node) or set up Splunk Free tier.",
          "Ingest sample/sample-generated logs, explore the dashboard, understand what an alert looks like.",
          "Trigger a basic alert (e.g., simulate a failed-login burst), observe how it surfaces.",
          "Build Project 1: Recon Automation Script — a Python/Bash tool that wraps Nmap, grabs banners, outputs a clean markdown report for a given target.",
          "Continue Project 1: Recon Automation Script. Push to GitHub with a proper README (what it does, how to run it, sample output).",
          "Update Resume v2 — add THM path completions with links, Project 1, quantify wherever possible (\"automated recon reducing manual scan documentation time\").",
          "(Revision) Redo the SIEM alert trigger from memory. Commit everything.",
        ],
        kpi: "Working local SIEM lab (screenshot + short write-up), Project 1 live on GitHub, Resume v2 done.",
        exit: "MONTH 2 GATE — Can explain 4+ OWASP items hands-on, has a working SIEM lab, has 1 real GitHub project beyond wargame notes, Resume v2 exists.",
        milestone: "Resume v2, 2 GitHub projects live, first SIEM lab working",
      },
    ],
  },
  {
    month: 3,
    title: "Home Lab + Applications Begin",
    weeks: [
      {
        week: 9,
        title: "Home Lab Build",
        objective: "A real, documented lab environment — your single best interview talking point so far.",
        days: [
          "Install VirtualBox/Proxmox on your host machine, configure host-only/internal networking.",
          "Set up Kali as attacker VM.",
          "Set up Metasploitable2 as target.",
          "Set up a Windows 10 target VM.",
          "Run a full attack chain against Metasploitable2 (scan → identify service → exploit → gain shell) using what you've learned so far.",
          "Write up the entire lab build as a GitHub README with screenshots — network diagram, VM specs, the attack chain you ran.",
          "(Revision) Rebuild the network config from scratch without notes to confirm you understand it, not just followed steps.",
        ],
        kpi: "3-VM lab running, fully documented on GitHub.",
        exit: "Can explain your lab's network topology and walk through the attack chain from memory.",
        milestone: "Home lab built and documented",
      },
      {
        week: 10,
        title: "TryHackMe Jr Penetration Tester: Recon & Enumeration",
        objective: "Formal offensive methodology begins.",
        days: [
          "TryHackMe \"Jr Penetration Tester\" path — Network Reconnaissance modules.",
          "TryHackMe \"Jr Penetration Tester\" path — Network Reconnaissance modules.",
          "Continue path — Nmap deep-dive modules (you'll move faster here since Week 5 groundwork).",
          "Continue path — Nmap deep-dive modules.",
          "Continue path — Web Application Security Fundamentals modules.",
          "Continue path — Web Application Security Fundamentals modules.",
          "(Revision) Write up 2 rooms completed this week in your GitHub findings library (title, what it tested, how you solved it).",
        ],
        kpi: "Jr Penetration Tester path 20-25% complete.",
        exit: "Comfortable navigating unfamiliar rooms without a walkthrough for at least 30 minutes before seeking help.",
      },
      {
        week: 11,
        title: "Continue Path + APPLICATIONS BEGIN + Networking Starts",
        objective: "First real-world signal: resume screens, rejections, JD patterns. This data is more valuable right now than more theory.",
        days: [
          "Continue Jr Penetration Tester path — Web Application Vulnerabilities modules.",
          "Continue Jr Penetration Tester path — Web Application Vulnerabilities modules.",
          "Update resume for calibration round (Resume v2 is enough). Identify 15-20 target roles on Internshala, LinkedIn, Naukri.",
          "Apply to 5 roles — tailor keywords per JD, 10-15 min max per application.",
          "Apply to 5 more roles. Start connecting with 5 relevant people/week on LinkedIn with a short personalized note.",
          "Continue path modules.",
          "(Revision) Review this week's applications — which JDs kept repeating requirements you don't have yet? Note them for Month 4.",
        ],
        kpi: "10 applications sent, 5 new relevant LinkedIn connections.",
        exit: "Applications are going out weekly from here on — this never returns to zero.",
        milestone: "Applications begin, LinkedIn networking begins",
      },
      {
        week: 12,
        title: "Mock Interview #1 + Continued Momentum",
        objective: "First real test of whether you can explain what you know, live, under mild pressure.",
        days: [
          "Continue Jr Penetration Tester path — Privilege Escalation basics (Linux fundamentals).",
          "Continue Jr Penetration Tester path — Privilege Escalation basics (Windows fundamentals).",
          "Prep for mock interview — review your own projects, be ready to explain each in under 90 seconds.",
          "Mock Interview #1 — self-recorded or with a peer/mentor. Cover: OSI model, a project, one OWASP item, why cybersecurity.",
          "Review the recording/feedback. Identify 2-3 weak spots specifically (not \"I did badly\" — specifically \"I froze explaining TLS\").",
          "Apply to 5-8 more roles. Continue path.",
          "(Revision) Drill the 2-3 weak spots identified Day 5 until they're gone.",
        ],
        kpi: "Mock Interview #1 completed with specific, written feedback.",
        exit: "Can re-answer the weak-spot questions cleanly by end of week.",
        milestone: "Mock Interview #1",
      },
      {
        week: 13,
        title: "Buffer & Consolidation Week",
        objective: "No new topics. Close every gap from Weeks 9-12 before Month 4 raises the pace.",
        days: [
          "Review and polish all GitHub READMEs — would a recruiter understand each project in 30 seconds of skimming?",
          "Revisit any Bandit/THM room that felt shaky — redo it cold.",
          "Review application funnel: how many sent, how many replies/screens? If replies are near zero after ~25-30 applications, the resume — not your skill — is likely the bottleneck.",
          "Catch up on any incomplete week from Month 2-3.",
          "Apply to 5-8 more roles.",
          "Free/flex day — rest or go deeper on whatever felt most interesting this month (reward, not obligation).",
          "(Revision) Full-month review — write a 1-page \"what I know now\" summary, commit to GitHub.",
        ],
        kpi: "Portfolio (GitHub + resume + LinkedIn) is genuinely presentable, no loose ends.",
        exit: "MONTH 3 GATE — Home lab live, Jr Pentester path 20%+ complete, ~30-40 applications sent cumulative, 1 mock interview done, LinkedIn network growing.",
        milestone: "Portfolio consolidation checkpoint",
      },
    ],
  },
  {
    month: 4,
    title: "Scale Applications + Deepen Skill",
    weeks: [
      {
        week: 14,
        title: "Networking Ramp + Application Scale-Up",
        objective: "Increase surface area — more applications, more real conversations.",
        days: [
          "Continue Jr Penetration Tester path (Password Attacks module — Hydra/Hashcat/John basics).",
          "Continue Jr Penetration Tester path (Password Attacks module).",
          "Reach out to 3-5 professionals this week for a short informational chat (about their day-to-day and path, not a job ask).",
          "Apply to 8-10 roles, tailored.",
          "Continue path. Apply to 3-5 more roles.",
          "Active Directory basics module (conceptual — just enough to discuss AD misconfigurations in an interview, not exploitation depth).",
          "(Revision) Write up the AD basics concept in your own words. Commit.",
        ],
        kpi: "10-15 applications this week, 1+ informational chat completed.",
        exit: "Comfortable discussing basic AD concepts (domain, DC, user/group) even without deep exploitation skill.",
      },
      {
        week: 15,
        title: "Capstone Project",
        objective: "One flagship project that anchors your entire portfolio conversation.",
        days: [
          "Decide direction based on application traction so far — Option A (offensive): automated recon/reporting tool building on Project 1. Option B (SOC): log-analysis tool flagging suspicious patterns, mapped to MITRE ATT&CK IDs.",
          "Build the chosen capstone project.",
          "Build the chosen capstone project.",
          "Build the chosen capstone project.",
          "Write the GitHub README properly — problem it solves, how it works, sample output, what you'd improve next.",
          "Apply to 8-10 roles. Continue path modules.",
          "(Revision) Walk through a live demo of the capstone to yourself/a friend, timed under 3 minutes.",
        ],
        kpi: "Capstone project live on GitHub with a clean README.",
        exit: "Can demo the capstone confidently, unscripted, in under 3 minutes.",
        milestone: "Capstone project live on GitHub",
      },
      {
        week: 16,
        title: "Mock Interview #2 + Continued Applications",
        objective: "Higher-fidelity interview simulation.",
        days: [
          "Continue Jr Penetration Tester path.",
          "Continue Jr Penetration Tester path.",
          "Build a personal question bank from real JDs you've been applying to — note recurring asks.",
          "Mock Interview #2 — full 30-45 min simulation, technical + behavioral, ideally with someone who isn't you.",
          "Review feedback, drill weak points.",
          "Apply to 8-10 roles.",
          "(Revision) Redo the toughest question from Mock #2 until it's clean.",
        ],
        kpi: "Mock Interview #2 completed, visibly stronger than #1.",
        exit: "No single question type causes you to freeze for more than a few seconds.",
        milestone: "Mock Interview #2",
      },
      {
        week: 17,
        title: "Interview Prep Deep-Dive + Resume v3",
        objective: "Final resume form, full interview question bank drilled.",
        days: [
          "Build/finalize your interview question bank — write your own answers, don't just read others'.",
          "Drill technical answers out loud, not silently in your head — this is a different skill.",
          "Drill behavioral answers the same way.",
          "Finalize Resume v3 — home lab, capstone, all path/CTF stats, tailored keyword pass, quantified action-verb bullets, 1 page max.",
          "Post a project update on LinkedIn (capstone demo or key learning) — start a weekly posting habit.",
          "Apply to 8-10 roles with Resume v3.",
          "(Revision) Full run-through — every resume line, can you defend it in an interview? Cut anything you can't.",
        ],
        kpi: "Resume v3 live, full question bank drilled at least once.",
        exit: "MONTH 4 GATE — Capstone shipped, 2 mock interviews done, ~90-110 applications sent cumulative, resume in final form.",
        milestone: "Resume v3 (final polish)",
      },
    ],
  },
  {
    month: 5,
    title: "Interview Execution Phase",
    weeks: [
      {
        week: 18,
        title: "Funnel Audit or Interview Focus",
        objective: "Branch based on real signal — you'll know which by now.",
        days: [
          "Assess your real signal: are callbacks coming in, or near zero after 100+ applications?",
          "If callbacks ARE coming in: shift 60% of daily time to interview prep for those specific companies — research them, tailor project explanations to their stack/domain.",
          "If callbacks are NEAR ZERO: this is a funnel problem, not a skill problem — widen target titles (IT Support, QA+Security hybrid, Trainee programs).",
          "If callbacks are NEAR ZERO: get 2-3 people to review your resume/LinkedIn cold, increase direct outreach to hiring managers.",
          "Apply to 10-15 roles regardless of branch.",
          "Continue light path work — 1-2 hrs/day max from here; applications and interview prep take priority now.",
          "(Revision) Confirm you have a clear diagnosis of your funnel status and a specific fix in motion.",
        ],
        kpi: "Clear diagnosis of your funnel status + a specific fix in motion.",
        exit: "You know exactly why callbacks are or aren't happening, and you've acted on it.",
        milestone: "Funnel audit — diagnose & fix",
      },
      {
        week: 19,
        title: "Mock Interview #3 + Negotiation Basics",
        objective: "Final interview simulation, plus the conversation nobody prepares for.",
        days: [
          "Continue applications (10-15/week baseline).",
          "Continue applications (10-15/week baseline).",
          "Mock Interview #3 — hardest version yet, include at least one curveball/unfamiliar question to test composure, not just recall.",
          "Learn stipend/offer negotiation basics — know your minimum acceptable stipend, how to ask about learning scope and mentorship professionally.",
          "Continue applications.",
          "LinkedIn post + 3-5 new connections.",
          "(Revision) Review Mock #3, close any remaining gaps.",
        ],
        kpi: "Mock Interview #3 done, can articulate your minimum stipend and 2 things you'd ask about in an offer conversation.",
        exit: "No technical or behavioral question in your bank causes visible hesitation.",
        milestone: "Mock Interview #3 + stipend negotiation basics",
      },
      {
        week: 20,
        title: "Interview-First Mode",
        objective: "Maximum energy toward live interviews; learning becomes maintenance, not growth.",
        days: [
          "Prioritize any live interview prep over new learning this week.",
          "If no interviews this week: maintain applications at 10-15/week.",
          "If no interviews this week: 1-2 hrs/day light review only — not new topics.",
          "LinkedIn: post an update this week.",
          "LinkedIn: connect with 3-5 new people this week — this is often where the actual referral comes from.",
          "Prep thoroughly for any confirmed interview — walk in rested, not rushed.",
          "(Revision) Confirm zero missed or unprepared interviews this week.",
        ],
        kpi: "Zero missed or unprepared interviews this week.",
        exit: "Every interview you sit is one you walked into rested and prepped, not rushed.",
      },
      {
        week: 21,
        title: "Second Project / Open-Source Contribution",
        objective: "A differentiator most candidates at this stage don't have (if bandwidth allows).",
        days: [
          "Assess your interview load this week — light or heavy?",
          "If light: find a small open-source security tool to contribute to.",
          "If light: make one meaningful contribution — a bug fix, a doc improvement, or a small feature.",
          "If heavy: skip the OSS contribution entirely — interviews always win the time allocation.",
          "Applications continue at 10-15/week regardless.",
          "Applications continue at 10-15/week regardless.",
          "(Revision) Confirm at least one interview pipeline is active and moving forward.",
        ],
        kpi: "Either a small OSS contribution shipped, or interview pipeline actively worked — not both required.",
        exit: "MONTH 5 GATE — At least one interview pipeline is active and moving forward.",
        milestone: "Second project / open-source contribution",
      },
    ],
  },
  {
    month: 6,
    title: "Close",
    weeks: [
      {
        week: 22,
        title: "Continue & Follow Up (I)",
        objective: "Persistence. Most offers land in exactly this stretch for people who kept applying.",
        days: [
          "Apply to 10-15 roles — no exceptions.",
          "Apply to 10-15 roles — no exceptions.",
          "Follow up on every application/interview past its stated timeline with a short, professional check-in.",
          "Apply to 10-15 roles — no exceptions.",
          "Keep LinkedIn activity alive this week — post or engage.",
          "Apply to 10-15 roles — no exceptions.",
          "(Revision) Confirm no pending interview or application goes untracked or unfollowed-up.",
        ],
        kpi: "No pending interview or application goes untracked or unfollowed-up.",
        exit: "Applications and follow-ups sent every day this week — zero days skipped.",
      },
      {
        week: 23,
        title: "Continue & Follow Up (II)",
        objective: "Persistence. Most offers land in exactly this stretch for people who kept applying.",
        days: [
          "Apply to 10-15 roles — no exceptions.",
          "Apply to 10-15 roles — no exceptions.",
          "Follow up on every application/interview past its stated timeline with a short, professional check-in.",
          "Apply to 10-15 roles — no exceptions.",
          "Keep LinkedIn activity alive this week — post or engage.",
          "Apply to 10-15 roles — no exceptions.",
          "(Revision) Confirm no pending interview or application goes untracked or unfollowed-up.",
        ],
        kpi: "No pending interview or application goes untracked or unfollowed-up.",
        exit: "Applications and follow-ups sent every day this week — zero days skipped.",
      },
      {
        week: 24,
        title: "Offer Evaluation",
        objective: "If you're fortunate enough to have options, choose well.",
        days: [
          "List every offer/pipeline currently in motion.",
          "Rank each offer by learning opportunity & mentor quality — this matters most at this stage.",
          "Rank each offer by tech stack exposure relevant to your target track (offensive vs SOC).",
          "Compare stipend across offers — factor in, but don't lead with it.",
          "Compare brand name last — it matters least at this stage.",
          "Make your decision using the full ranked criteria, not gut feel alone.",
          "(Revision) If no offer yet, treat this week as final applications push — Month 6 gate is coming.",
        ],
        kpi: "Applied a clear, ranked decision framework: learning/mentor quality > tech stack fit > stipend > brand name.",
        exit: "Decision made and communicated professionally — or funnel still actively running if no offer yet.",
        milestone: "Offer evaluation (if multiple in hand)",
      },
      {
        week: 25,
        title: "Contingency Activation (I)",
        objective: "If you don't have a signed offer by Week 24-25, activate all of this immediately — don't wait.",
        days: [
          "Widen target roles explicitly: IT Support (security-adjacent), QA/Security hybrid roles, Trainee/Graduate programs.",
          "Consider a low-stipend/unpaid internship at a reputable firm as a bridge — better than a 7th month with nothing.",
          "Escalate direct referral asks with everyone in your LinkedIn network built since Week 11 — specific, not vague.",
          "Research 2-3 Vulnerability Disclosure Programs (VDPs) on HackerOne/Bugcrowd.",
          "Submit your first VDP report — unpaid, but a real validated finding is a genuine talking point.",
          "Get your resume reviewed by someone outside your own head — a Discord community, a mentor, anyone with hiring-side experience.",
          "(Revision) Apply to 10-15 more roles regardless — this never returns to zero.",
        ],
        kpi: "Contingency plan fully activated — widened roles, referral asks, VDP research, and external resume review all in motion.",
        exit: "All 4 contingency tracks active: widened roles, referrals, VDP submissions, external resume review.",
        milestone: "Contingency activation if unsigned",
      },
      {
        week: 26,
        title: "Contingency Activation (II) + Final Gate",
        objective: "This roadmap doesn't end until the internship is signed.",
        days: [
          "Submit a second VDP report.",
          "Submit a third VDP report if not already done — even one accepted VDP report is a genuine talking point.",
          "Follow up on every widened-role application sent this month.",
          "Follow up on every referral ask sent — specific, professional check-ins.",
          "Apply to 10-15 more roles.",
          "Review resume feedback received and apply final edits.",
          "(Revision) Final gate check — is the internship signed?",
        ],
        kpi: "At least one VDP report submitted, referral asks sent, resume reviewed externally.",
        exit: "FINAL GATE — Internship signed. If not yet, the contingency plan is already running — this roadmap doesn't end until that line is true.",
        milestone: "FINAL GATE: Internship signed",
      },
    ],
  },
];

const MILESTONES = {};
RAW_MONTHS.forEach((m) => m.weeks.forEach((w) => { if (w.milestone) MILESTONES[w.week] = w.milestone; }));

const MASTER_SKILLS = [
  "Networking: OSI/TCP-IP, subnetting, DNS, HTTP/HTTPS, TLS handshake, common ports",
  "Linux: permissions, processes, systemd, cron, bash scripting",
  "Core security: CIA triad, AAA, encryption vs hashing, OWASP Top 10 (conceptual + basic hands-on)",
  "Tools: Nmap, Wireshark, Burp Suite Community, one SIEM (Wazuh or Splunk Free)",
  "Basic Python/Bash scripting for automation",
  "Log analysis and alert triage fundamentals",
  "Resume writing, LinkedIn presence, interview communication",
];

const POSTPONE_SKILLS = [
  "Active Directory exploitation depth (Kerberoasting, lateral movement)",
  "OSCP-level binary exploitation / buffer overflows",
  "Live bug bounty hunting for money",
  "Cloud security depth (AWS/Azure)",
  "Malware reverse engineering",
  "Any paid certification (Security+, eJPT, PNPT, OSCP) — optional, never a gate",
  "Mobile security, hardware hacking, HTB hard/insane-rated boxes",
];

const PHASES = [
  { id: "build", name: "Skill + Portfolio Build", range: [1, 10] },
  { id: "apply", name: "Applications Live", range: [11, 17] },
  { id: "interview", name: "Interview Execution", range: [18, 21] },
  { id: "close", name: "Close", range: [22, 26] },
];

const MONTHS = RAW_MONTHS;

const ALL_WEEKS = MONTHS.flatMap((m) => m.weeks);
const TOTAL_WEEKS = ALL_WEEKS.length; // 26
const ITEMS_PER_WEEK = 9; // 7 daily tasks + kpi + exit
const CAREER_ITEMS = 6; // 3 resume versions + 3 mock interviews
const TOTAL_ITEMS = TOTAL_WEEKS * ITEMS_PER_WEEK + CAREER_ITEMS;

// Applications guidance by phase (from the roadmap's cumulative targets)
const APPLICATION_TARGETS = [
  { week: 11, note: "Applications begin — 10 sent, 5 new LinkedIn connections this week." },
  { week: 13, note: "~30-40 applications sent cumulative (Month 3 gate)." },
  { week: 17, note: "~90-110 applications sent cumulative (Month 4 gate)." },
  { week: 26, note: "10-15/week baseline continues — never drops to zero." },
];

const LEVELS = [
  { min: 0, max: 500, name: "Script Kiddie" },
  { min: 500, max: 1500, name: "Recon Rookie" },
  { min: 1500, max: 3000, name: "Lab Rat" },
  { min: 3000, max: 5000, name: "Exploit Apprentice" },
  { min: 5000, max: 8000, name: "Recon Master" },
  { min: 8000, max: Infinity, name: "Internship Ready" },
];

const STORAGE_KEY = "cyberquest-tracker-state";

const DEFAULT_STATE = {
  startDate: null,
  tasks: {}, // "w{week}-d{day}": true
  kpi: {}, // "w{week}": true
  exit: {}, // "w{week}": true
  dailyLog: {}, // "YYYY-MM-DD": true
  resume: { v1: false, v2: false, v3: false },
  mockInterviews: { m1: false, m2: false, m3: false },
  applications: 0, // cumulative applications sent
};

// ============================================================================
// HELPERS
// ============================================================================

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function computeXP(state) {
  const taskCount = Object.values(state.tasks).filter(Boolean).length;
  const kpiCount = Object.values(state.kpi).filter(Boolean).length;
  const exitCount = Object.values(state.exit).filter(Boolean).length;
  const resumeCount = Object.values(state.resume || {}).filter(Boolean).length;
  const mockCount = Object.values(state.mockInterviews || {}).filter(Boolean).length;
  return {
    xp: taskCount * 10 + kpiCount * 50 + exitCount * 100 + resumeCount * 50 + mockCount * 50,
    taskCount,
    kpiCount,
    exitCount,
    resumeCount,
    mockCount,
  };
}

function getLevel(xp) {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

function calcStreak(dailyLog) {
  const dates = Object.keys(dailyLog)
    .filter((d) => dailyLog[d])
    .sort();
  if (!dates.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(dates[dates.length - 1]);
  const gapFromToday = Math.round((today - mostRecent) / 86400000);
  if (gapFromToday > 1) return 0; // streak broken (a full day was skipped)

  let count = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const cur = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    const diff = Math.round((cur - prev) / 86400000);
    if (diff === 1) count++;
    else break;
  }
  return count;
}

function getTodayInfo(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - start) / 86400000) + 1;
  if (diffDays < 1) return { upcoming: true, daysUntil: 1 - diffDays };
  if (diffDays > TOTAL_WEEKS * 7) return { finished: true };
  const week = Math.ceil(diffDays / 7);
  const day = ((diffDays - 1) % 7) + 1;
  return { week, day, diffDays };
}

function weekStats(state, week) {
  const w = ALL_WEEKS.find((x) => x.week === week);
  let done = 0;
  for (let d = 1; d <= 7; d++) if (state.tasks[`w${week}-d${d}`]) done++;
  if (state.kpi[`w${week}`]) done++;
  if (state.exit[`w${week}`]) done++;
  const xp =
    (done - (state.kpi[`w${week}`] ? 1 : 0) - (state.exit[`w${week}`] ? 1 : 0)) *
      10 +
    (state.kpi[`w${week}`] ? 50 : 0) +
    (state.exit[`w${week}`] ? 100 : 0);
  return { done, total: ITEMS_PER_WEEK, pct: Math.round((done / ITEMS_PER_WEEK) * 100), xp, week: w };
}

// ============================================================================
// SMALL UI PIECES
// ============================================================================

function ProgressBar({ pct, colorClass = "bg-emerald-400", trackClass = "bg-zinc-800", height = "h-2" }) {
  return (
    <div className={`w-full ${height} ${trackClass} rounded-full overflow-hidden border border-zinc-700`}>
      <div
        className={`${height} ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function AsciiBar({ pct }) {
  const total = 20;
  const filled = Math.round((pct / 100) * total);
  return (
    <span className="font-mono text-[10px] text-emerald-400/70 tracking-tighter select-none hidden sm:inline">
      [{"█".repeat(filled)}
      {"░".repeat(total - filled)}]
    </span>
  );
}

function Checkbox({ checked, onChange, label, sub, accent = "emerald" }) {
  const accentClasses =
    accent === "cyan"
      ? "peer-checked:bg-cyan-400 peer-checked:border-cyan-400"
      : accent === "amber"
      ? "peer-checked:bg-amber-400 peer-checked:border-amber-400"
      : "peer-checked:bg-emerald-400 peer-checked:border-emerald-400";
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1.5">
      <span className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          className={`block w-4 h-4 rounded-sm border-2 border-zinc-600 bg-zinc-900 transition-colors ${accentClasses}`}
        />
        {checked && (
          <svg
            viewBox="0 0 16 16"
            className="absolute inset-0 w-4 h-4 text-zinc-950 pointer-events-none"
            fill="none"
          >
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={`block text-sm font-mono leading-snug ${
            checked ? "text-zinc-500 line-through" : "text-zinc-200"
          }`}
        >
          {label}
        </span>
        {sub && <span className="block text-[11px] text-zinc-500 mt-0.5">{sub}</span>}
      </span>
    </label>
  );
}

function ConfettiBurst({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 0.9 + Math.random() * 0.6,
        color: ["#34d399", "#22d3ee", "#a3e635", "#fbbf24"][i % 4],
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block w-1.5 h-3 rounded-sm confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .confetti-piece { animation-name: confettiFall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-5 py-3 rounded-md bg-zinc-900 border border-emerald-400/50 shadow-lg shadow-emerald-500/10 flex items-center gap-2 max-w-[90vw]">
      <span className="text-emerald-400 font-mono text-sm">▸</span>
      <span className="font-mono text-xs sm:text-sm text-emerald-300">{message}</span>
    </div>
  );
}

function ConfirmModal({ title, body, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-lg p-5 shadow-xl">
        <p className="font-mono text-cyan-400 text-sm mb-1">{title}</p>
        <p className="text-zinc-400 text-sm mb-5">{body}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-mono rounded border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEK CARD
// ============================================================================

function WeekCard({ week, state, onToggleTask, onToggleKPI, onToggleExit, onResetWeek, isToday, todayDay }) {
  const stats = weekStats(state, week.week);
  const exitDone = !!state.exit[`w${week.week}`];

  return (
    <div
      className={`rounded-lg border ${
        isToday ? "border-cyan-400/60 shadow-md shadow-cyan-500/10" : "border-zinc-800"
      } bg-zinc-900/60 overflow-hidden`}
    >
      <div className="px-4 pt-3 pb-2 border-b border-zinc-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-cyan-400 text-xs">WEEK {String(week.week).padStart(2, "0")}</span>
            {isToday && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                TODAY
              </span>
            )}
            {exitDone && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                ✓ CLEARED
              </span>
            )}
          </div>
          <h3 className="text-zinc-100 font-semibold text-sm mt-1">{week.title}</h3>
          {week.objective && (
            <p className="text-zinc-500 text-[11px] mt-0.5 leading-snug">{week.objective}</p>
          )}
          {week.milestone && (
            <span className="inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
              ★ {week.milestone}
            </span>
          )}
        </div>
        <button
          onClick={() => onResetWeek(week.week)}
          title="Reset this week"
          className="text-[10px] font-mono text-zinc-600 hover:text-red-400 flex-shrink-0 mt-0.5"
        >
          reset
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-2 border-b border-zinc-800/60">
        <ProgressBar pct={stats.pct} />
        <span className="font-mono text-[11px] text-zinc-500 flex-shrink-0 w-9 text-right">{stats.pct}%</span>
      </div>

      <div className="px-4 py-2 divide-y divide-zinc-800/50">
        {week.days.map((task, idx) => {
          const day = idx + 1;
          const checked = !!state.tasks[`w${week.week}-d${day}`];
          return (
            <div
              key={day}
              className={
                isToday && todayDay === day
                  ? "rounded-md -mx-2 px-2 bg-cyan-400/5 ring-1 ring-cyan-400/20"
                  : ""
              }
            >
              <Checkbox
                checked={checked}
                onChange={() => onToggleTask(week.week, day)}
                label={`Day ${day} · ${task}`}
                accent="emerald"
              />
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/40">
        <Checkbox
          checked={!!state.kpi[`w${week.week}`]}
          onChange={() => onToggleKPI(week.week)}
          label="KPI"
          sub={week.kpi}
          accent="cyan"
        />
        <Checkbox
          checked={exitDone}
          onChange={() => onToggleExit(week.week)}
          label="Exit Criteria"
          sub={week.exit}
          accent="amber"
        />
      </div>
    </div>
  );
}

// ============================================================================
// FUNNEL STRIP — Skill Build → Applications Live → Interview Execution → Close
// ============================================================================

function FunnelStrip({ currentWeek }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <p className="text-cyan-400 text-xs mb-3">$ placement --funnel</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {PHASES.map((p, i) => {
          const isCurrent = currentWeek && currentWeek >= p.range[0] && currentWeek <= p.range[1];
          const isPast = currentWeek && currentWeek > p.range[1];
          return (
            <div key={p.id} className="flex items-center gap-2 flex-1">
              <div
                className={`flex-1 rounded-md border px-2.5 py-2 ${
                  isCurrent
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : isPast
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-zinc-800 bg-zinc-950/40"
                }`}
              >
                <p
                  className={`text-[10px] font-mono ${
                    isCurrent ? "text-cyan-300" : isPast ? "text-emerald-400/70" : "text-zinc-600"
                  }`}
                >
                  {isPast ? "✓ " : ""}W{p.range[0]}-{p.range[1]}
                </p>
                <p className={`text-[11px] leading-snug ${isCurrent ? "text-zinc-100" : "text-zinc-500"}`}>
                  {p.name}
                </p>
              </div>
              {i < PHASES.length - 1 && <span className="text-zinc-700 hidden sm:inline">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// DOCTRINE PANEL — Master vs Postpone skill map (collapsible)
// ============================================================================

function DoctrinePanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 sm:px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-cyan-400 text-xs">$ cat master_skill_map.md</span>
        <span className="text-zinc-500 text-xs">{open ? "▲ hide" : "▼ show"}</span>
      </button>
      {open && (
        <div className="px-3 sm:px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-emerald-400 text-[11px] mb-2">MASTER (the entire technical bar for an internship)</p>
            <ul className="space-y-1.5">
              {MASTER_SKILLS.map((s, i) => (
                <li key={i} className="text-[11px] text-zinc-400 flex gap-1.5">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-red-400 text-[11px] mb-2">POSTPONE (until after Month 7 — do not touch)</p>
            <ul className="space-y-1.5">
              {POSTPONE_SKILLS.map((s, i) => (
                <li key={i} className="text-[11px] text-zinc-500 flex gap-1.5">
                  <span className="text-red-400/70 flex-shrink-0">✕</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CAREER HQ — Applications tracker, Resume versions, Mock interviews
// ============================================================================

function CareerHQ({ state, currentWeek, onApplicationsChange, onToggleResume, onToggleMock }) {
  const nextTarget = APPLICATION_TARGETS.find((t) => !currentWeek || t.week >= currentWeek) || APPLICATION_TARGETS[APPLICATION_TARGETS.length - 1];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 space-y-4">
      <p className="text-cyan-400 text-xs">$ career --hq</p>

      {/* Applications */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-zinc-400">APPLICATIONS SENT (cumulative)</span>
          <span className="text-emerald-400 font-bold text-lg">{state.applications}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApplicationsChange(Math.max(0, state.applications - 5))}
            className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            −5
          </button>
          <button
            onClick={() => onApplicationsChange(state.applications + 1)}
            className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            +1
          </button>
          <button
            onClick={() => onApplicationsChange(state.applications + 5)}
            className="px-3 h-8 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 text-xs"
          >
            +5
          </button>
          <span className="text-[11px] text-zinc-600 ml-1 leading-snug">{nextTarget.note}</span>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Resume versions */}
      <div>
        <span className="text-[11px] text-zinc-400 block mb-2">RESUME VERSIONS</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "v1", label: "v1", sub: "Week 4" },
            { key: "v2", label: "v2", sub: "Week 8" },
            { key: "v3", label: "v3", sub: "Week 17 (final)" },
          ].map((r) => {
            const checked = !!state.resume[r.key];
            return (
              <button
                key={r.key}
                onClick={() => onToggleResume(r.key)}
                className={`rounded-md border px-2 py-2 text-center transition-colors ${
                  checked
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-700 text-zinc-500 hover:bg-zinc-800"
                }`}
              >
                <p className="text-sm font-bold font-mono">{checked ? "✓ " : ""}{r.label}</p>
                <p className="text-[10px] mt-0.5">{r.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mock interviews */}
      <div>
        <span className="text-[11px] text-zinc-400 block mb-2">MOCK INTERVIEWS</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "m1", label: "#1", sub: "Week 12" },
            { key: "m2", label: "#2", sub: "Week 16" },
            { key: "m3", label: "#3", sub: "Week 19" },
          ].map((m) => {
            const checked = !!state.mockInterviews[m.key];
            return (
              <button
                key={m.key}
                onClick={() => onToggleMock(m.key)}
                className={`rounded-md border px-2 py-2 text-center transition-colors ${
                  checked
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                    : "border-zinc-700 text-zinc-500 hover:bg-zinc-800"
                }`}
              >
                <p className="text-sm font-bold font-mono">{checked ? "✓ " : ""}{m.label}</p>
                <p className="text-[10px] mt-0.5">{m.sub}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// XP CHART
// ============================================================================

function XPChart({ state }) {
  const data = ALL_WEEKS.map((w) => {
    const s = weekStats(state, w.week);
    return { name: `W${w.week}`, xp: s.xp };
  });

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <p className="font-mono text-xs text-cyan-400 mb-3">$ xp --per-week</p>
      <div className="h-48 sm:h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#71717a", fontSize: 9, fontFamily: "monospace" }}
              interval={2}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 6,
                fontFamily: "monospace",
                fontSize: 12,
              }}
              labelStyle={{ color: "#22d3ee" }}
              itemStyle={{ color: "#34d399" }}
              cursor={{ fill: "#ffffff08" }}
            />
            <Bar dataKey="xp" radius={[2, 2, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.xp > 0 ? "#34d399" : "#3f3f46"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'all'|'week', week? }
  const [saveError, setSaveError] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const hydratedRef = useRef(false);

  // Load state
  useEffect(() => {
    const savedState = loadTrackerState(STORAGE_KEY, null);
    setState(savedState ? { ...DEFAULT_STATE, ...savedState } : DEFAULT_STATE);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !state) return;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    const isSaved = saveTrackerState(STORAGE_KEY, state);
    setSaveError(!isSaved);
    setSaveStatus(isSaved ? "saved" : "error");

    const timer = window.setTimeout(() => {
      if (isSaved) setSaveStatus("saved");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [loaded, state]);

  const updateState = useCallback(
    (updater) => {
      setState((prev) => updater(prev));
    },
    []
  );

  const markDailyLog = (draft) => {
    draft.dailyLog = { ...draft.dailyLog, [todayStr()]: true };
  };

  const toggleTask = (week, day) => {
    updateState((prev) => {
      const key = `w${week}-d${day}`;
      const draft = { ...prev, tasks: { ...prev.tasks } };
      const willBeChecked = !draft.tasks[key];
      draft.tasks[key] = willBeChecked;
      if (willBeChecked) markDailyLog(draft);
      return draft;
    });
  };

  const toggleKPI = (week) => {
    updateState((prev) => {
      const key = `w${week}`;
      const draft = { ...prev, kpi: { ...prev.kpi } };
      const willBeChecked = !draft.kpi[key];
      draft.kpi[key] = willBeChecked;
      if (willBeChecked) markDailyLog(draft);
      return draft;
    });
  };

  const toggleExit = (week) => {
    updateState((prev) => {
      const key = `w${week}`;
      const draft = { ...prev, exit: { ...prev.exit } };
      const willBeChecked = !draft.exit[key];
      draft.exit[key] = willBeChecked;
      if (willBeChecked) {
        markDailyLog(draft);
        setToast(`🎉 Week ${week} exit criteria cleared — +100 XP`);
        setConfetti(true);
      }
      return draft;
    });
  };

  const setStartDate = () => {
    if (!dateInput) return;
    updateState((prev) => ({ ...prev, startDate: dateInput }));
  };

  const setApplications = (n) => {
    updateState((prev) => ({ ...prev, applications: n }));
  };

  const toggleResume = (key) => {
    updateState((prev) => {
      const draft = { ...prev, resume: { ...prev.resume, [key]: !prev.resume[key] } };
      if (draft.resume[key]) {
        markDailyLog(draft);
        setToast(`📄 Resume ${key} marked done — +50 XP`);
      }
      return draft;
    });
  };

  const toggleMock = (key) => {
    updateState((prev) => {
      const draft = { ...prev, mockInterviews: { ...prev.mockInterviews, [key]: !prev.mockInterviews[key] } };
      if (draft.mockInterviews[key]) {
        markDailyLog(draft);
        setToast(`🎤 Mock interview ${key.replace("m", "#")} logged — +50 XP`);
      }
      return draft;
    });
  };

  const doResetWeek = (week) => {
    updateState((prev) => {
      const draft = { ...prev, tasks: { ...prev.tasks }, kpi: { ...prev.kpi }, exit: { ...prev.exit } };
      for (let d = 1; d <= 7; d++) delete draft.tasks[`w${week}-d${d}`];
      delete draft.kpi[`w${week}`];
      delete draft.exit[`w${week}`];
      return draft;
    });
    setConfirmModal(null);
  };

  const doResetAll = () => {
    updateState(() => ({ ...DEFAULT_STATE }));
    setConfirmModal(null);
  };

  if (!loaded || !state) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-mono text-emerald-400 text-sm animate-pulse">$ booting cyberquest_tracker...</p>
      </div>
    );
  }

  const { xp, taskCount, kpiCount, exitCount, resumeCount, mockCount } = computeXP(state);
  const level = getLevel(xp);
  const streak = calcStreak(state.dailyLog);
  const completedItems = taskCount + kpiCount + exitCount + resumeCount + mockCount;
  const overallPct = Math.round((completedItems / TOTAL_ITEMS) * 100);
  const todayInfo = getTodayInfo(state.startDate);
  const weeksCleared = Object.values(state.exit).filter(Boolean).length;

  const levelIdx = LEVELS.findIndex((l) => l.name === level.name);
  const nextLevel = LEVELS[levelIdx + 1];
  const levelPct = nextLevel
    ? Math.round(((xp - level.min) / (level.max - level.min)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-mono relative">
      {confetti && <ConfettiBurst onDone={() => setConfetti(false)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.type === "all" ? "reset_all_progress()" : `reset_week(${confirmModal.week})`}
          body={
            confirmModal.type === "all"
              ? "This wipes all XP, checkmarks, streak, and start date. This can't be undone."
              : `This clears all tasks, KPI, and exit criteria for Week ${confirmModal.week}.`
          }
          onConfirm={() =>
            confirmModal.type === "all" ? doResetAll() : doResetWeek(confirmModal.week)
          }
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* header */}
      <header className="border-b border-zinc-800 sticky top-0 z-30 bg-black/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-400 text-lg">&gt;_</span>
            <h1 className="text-emerald-400 font-bold tracking-tight text-sm sm:text-base truncate">
              CYBERQUEST<span className="text-cyan-400">_TRACKER</span>
              <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle animate-pulse" />
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] px-2 py-1 rounded border ${
                saveStatus === "saving"
                  ? "border-cyan-400/40 text-cyan-300 bg-cyan-400/10"
                  : saveStatus === "error"
                    ? "border-red-400/40 text-red-300 bg-red-400/10"
                    : "border-emerald-400/30 text-emerald-300 bg-emerald-400/10"
              }`}
            >
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "error"
                  ? "Save failed"
                  : "Saved locally"}
            </span>
            <button
              onClick={() => setConfirmModal({ type: "all" })}
              className="text-[11px] text-zinc-600 hover:text-red-400 flex-shrink-0"
            >
              reset all
            </button>
          </div>
        </div>
        {saveError && (
          <div className="bg-red-950/40 text-red-400 text-[11px] text-center py-1 px-2">
            ⚠ progress couldn't be saved — check your connection
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* EMPTY STATE */}
        {!state.startDate && (
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-5">
            <p className="text-cyan-400 text-sm mb-1">$ init --start-date</p>
            <p className="text-zinc-400 text-sm mb-4">
              Set your Day 1 to unlock the Today view and start tracking your streak.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={setStartDate}
                disabled={!dateInput}
                className="px-4 py-2 rounded bg-emerald-400 text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-300"
              >
                begin roadmap →
              </button>
            </div>
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[10px] text-zinc-500 mb-1">TOTAL XP</p>
            <p className="text-emerald-400 text-xl font-bold">{xp.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[10px] text-zinc-500 mb-1">STREAK</p>
            <p className="text-amber-400 text-xl font-bold">
              {streak} <span className="text-base">🔥</span>
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[10px] text-zinc-500 mb-1">WEEKS CLEARED</p>
            <p className="text-cyan-400 text-xl font-bold">
              {weeksCleared}
              <span className="text-zinc-600 text-sm">/{TOTAL_WEEKS}</span>
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[10px] text-zinc-500 mb-1">RANK</p>
            <p className="text-emerald-300 text-sm font-bold leading-tight mt-1">{level.name}</p>
          </div>
        </div>

        {/* LEVEL PROGRESS */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-zinc-400">
              {level.name}
              {nextLevel && <span className="text-zinc-600"> → {nextLevel.name}</span>}
            </span>
            <span className="text-zinc-500">
              {nextLevel ? `${xp - level.min} / ${level.max - level.min} XP` : "MAX RANK"}
            </span>
          </div>
          <ProgressBar pct={levelPct} colorClass="bg-emerald-400" />
        </div>

        {/* OVERALL ROADMAP PROGRESS */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-cyan-400">$ roadmap --progress</span>
            <span className="text-zinc-400">{overallPct}% complete</span>
          </div>
          <div className="flex items-center gap-2">
            <ProgressBar pct={overallPct} colorClass="bg-cyan-400" height="h-3" />
          </div>
          <div className="mt-1">
            <AsciiBar pct={overallPct} />
          </div>
        </div>

        {/* PLACEMENT FUNNEL */}
        <FunnelStrip currentWeek={todayInfo && !todayInfo.upcoming && !todayInfo.finished ? todayInfo.week : null} />

        {/* MASTER VS POSTPONE REFERENCE */}
        <DoctrinePanel />

        {/* CAREER HQ */}
        <CareerHQ
          state={state}
          currentWeek={todayInfo && !todayInfo.upcoming && !todayInfo.finished ? todayInfo.week : null}
          onApplicationsChange={setApplications}
          onToggleResume={toggleResume}
          onToggleMock={toggleMock}
        />

        {/* TODAY VIEW */}
        {state.startDate && (
          <div className="rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-400/5 to-transparent p-3 sm:p-4">
            <p className="text-cyan-400 text-xs mb-2">$ whoami --today</p>
            {todayInfo?.upcoming && (
              <p className="text-zinc-400 text-sm">
                Roadmap starts in {todayInfo.daysUntil} day{todayInfo.daysUntil !== 1 ? "s" : ""}. Get ready.
              </p>
            )}
            {todayInfo?.finished && (
              <p className="text-emerald-400 text-sm">
                🏁 26-week roadmap window complete. Review any unfinished weeks below.
              </p>
            )}
            {todayInfo && !todayInfo.upcoming && !todayInfo.finished && (
              <p className="text-zinc-300 text-sm">
                Day {todayInfo.diffDays} overall — Week {todayInfo.week}, Day {todayInfo.day}. Scroll to
                the highlighted card below to log today's task.
              </p>
            )}
          </div>
        )}

        {/* XP CHART */}
        <XPChart state={state} />

        {/* MONTHS + WEEKS */}
        <div className="space-y-6">
          {MONTHS.map((m) => (
            <div key={m.month}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-zinc-600 text-xs">MONTH {m.month}</span>
                <h2 className="text-zinc-200 font-semibold text-sm">{m.title}</h2>
                <span className="flex-1 h-px bg-zinc-800" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {m.weeks.map((w) => (
                  <WeekCard
                    key={w.week}
                    week={w}
                    state={state}
                    onToggleTask={toggleTask}
                    onToggleKPI={toggleKPI}
                    onToggleExit={toggleExit}
                    onResetWeek={(week) => setConfirmModal({ type: "week", week })}
                    isToday={todayInfo && !todayInfo.upcoming && !todayInfo.finished && todayInfo.week === w.week}
                    todayDay={todayInfo?.day}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="text-center text-zinc-700 text-[11px] pt-4 pb-8">
          progress saved automatically · {TOTAL_WEEKS} weeks · {TOTAL_ITEMS} total checkpoints
        </footer>
      </main>
    </div>
  );
}
