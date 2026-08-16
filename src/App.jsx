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
// ROADMAP DATA 1: CYBERSECURITY 6-MONTH (26 WEEKS)
// ============================================================================

const RAW_MONTHS_CYBER = [
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
        objective: "Core blue-team tool lab running; first GitHub tool repo; resume updated.",
        days: [
          "Set up a local SIEM — Wazuh (recommended) or Splunk Free. Ingest your own machine's logs.",
          "Generate basic alerts (failed SSH logins, sudo usage) and locate them in the SIEM dashboard.",
          "Write a simple Python/Bash script that parses an auth.log / syslog file and outputs the top 5 IPs with failed login attempts.",
          "Polish the script: add arguments (`--file`, `--threshold`), format output cleanly, push to GitHub with a solid README.",
          "TryHackMe SIEM-related rooms (e.g., \"Splunk: Basics\" or \"Wazuh\").",
          "Update Resume to v2 — add THM progress, Nmap, Burp Suite, SIEM lab, and the log-parser script under \"Projects\".",
          "(Revision) Walk through your log-parser script line by line out loud as if explaining it to an interviewer. Commit Resume v2.",
        ],
        kpi: "SIEM ingesting logs; log-parser script on GitHub with good README; Resume v2 ready.",
        exit: "MONTH 2 GATE — Can explain what a SIEM does and show a query in yours; can explain SQLi and XSS from memory; log-parser script runnable by a stranger from its README.",
        milestone: "Resume v2 updated with projects",
      },
    ],
  },
  {
    month: 3,
    title: "Portfolio Projects + Dual Track Deepening",
    weeks: [
      {
        week: 9,
        title: "SOC Track Deepening (Alert Triage & Log Analysis)",
        objective: "Move from tool-setup to actual analyst workflow (detect → investigate → report).",
        days: [
          "Continue SOC Level 1 path (Incident Response and Log Analysis modules).",
          "Continue SOC Level 1 path.",
          "Practice alert triage — pick 3 simulated alerts in THM/Wazuh, write a 5-line triage note for each (True/False Positive, evidence, recommendation).",
          "Snort/Suricata basics — rule structure, what a basic detection rule looks like.",
          "Write 1 custom Snort rule that flags an ICMP ping to a specific IP; test it.",
          "TryHackMe \"Investigating Windows\" or similar blue-team room.",
          "(Revision) Write an Incident Response summary for one of the THM scenarios — structured as: Summary, Timeline, Impact, Remediation. Commit to GitHub.",
        ],
        kpi: "SOC Level 1 path 60%+ complete. 3 written triage notes committed.",
        exit: "Can explain the difference between a True Positive and False Positive with a concrete example from your own lab.",
      },
      {
        week: 10,
        title: "Web Security Track (PortSwigger Web Security Academy)",
        objective: "Real-world web vulnerability depth; second portfolio artifact.",
        days: [
          "Create a PortSwigger Web Security Academy account (free, industry gold standard).",
          "Complete SQL Injection labs (Apprentice level — all of them).",
          "Complete XSS labs (Apprentice level — all of them).",
          "Complete CSRF labs (Apprentice level).",
          "Complete Authentication / Session Management labs (Apprentice level).",
          "Write up the 3 most interesting PortSwigger labs you solved — format: Vulnerability, Exploitation steps, Remediation code. Commit as markdown to GitHub.",
          "(Revision) Re-solve one practitioner-level lab without looking at the solution. Commit notes.",
        ],
        kpi: "15+ PortSwigger Apprentice labs solved. 3 detailed write-ups on GitHub.",
        exit: "Can explain CSRF vs XSS differences and defenses without hesitating.",
      },
      {
        week: 11,
        title: "Portfolio Project: Detection Lab or Vuln Assessment Report + APPLY 1-10",
        objective: "Flagship portfolio piece live on GitHub; first applications sent.",
        days: [
          "Choose your flagship project: (A) Home Lab Detection Showcase (Wazuh + Sysmon + documented attack replay), OR (B) Vulnerability Assessment Report of an authorized lab environment (e.g., Juice Shop / Metasploitable).",
          "Build / execute the project — focus on documentation, screenshots, clear methodology.",
          "Write the README / Report — make it read like a professional deliverable, not a student assignment.",
          "Push project to GitHub. Add a 60-second video demo (Loom or screen recording) if possible.",
          "Applications begin: identify 10 companies hiring for security intern / junior SOC / IT security. Apply to 5 today.",
          "Apply to the remaining 5. Send 5 connection requests on LinkedIn to security practitioners (not recruiters yet) at those companies with a 2-sentence note.",
          "(Revision) Review application responses / bounces. Log all 10 in a tracker sheet. Commit project README final polish.",
        ],
        kpi: "Flagship project live on GitHub. 10 applications sent, 5 LinkedIn connection requests sent.",
        exit: "First 10 applications logged in your tracker with dates, company names, and job URLs.",
        milestone: "Applications open — 10 sent",
      },
      {
        week: 12,
        title: "Interview Prep Phase 1 + Mock #1 + APPLY 11-20",
        objective: "First verbal interview test; application rhythm sustained.",
        days: [
          "Compile a \"Core Technical Questions\" doc — 25 standard security interview questions (OSI, TCP handshake, DNS, CIA triad, SQLi, XSS, symmetric vs asymmetric, SIEM, ports).",
          "Write out bullet-point answers for all 25 — focus on conciseness (under 90 seconds per answer).",
          "Practice speaking the answers aloud using a voice recorder or mirror. Identify filler words and weak explanations.",
          "Mock Interview #1 — peer, mentor, or self-recorded 30-minute technical drill. Score yourself ruthlessly.",
          "Apply to 10 more roles (cumulative: 20). Send 5 LinkedIn messages.",
          "Review mock interview recording — list 3 weakest answers, rewrite and re-record them.",
          "(Revision) Timed flashcard drill on all 25 questions. Commit updated answer doc.",
        ],
        kpi: "Mock Interview #1 completed and reviewed. 20 cumulative applications sent.",
        exit: "MONTH 3 GATE — Portfolio has 2+ GitHub repos with real documentation; 15+ PortSwigger labs cleared; 20 applications sent; Mock #1 done.",
        milestone: "Mock Interview #1 cleared",
      },
    ],
  },
  {
    month: 4,
    title: "Application Acceleration + Dual Track Expansion",
    weeks: [
      {
        week: 13,
        title: "Active Directory Basics + APPLY 21-35",
        objective: "Enterprise security context added (AD is tested in almost every enterprise security role); application volume up.",
        days: [
          "What is Active Directory — Domain Controllers, forests, domains, objects, Kerberos authentication flow (high level).",
          "TryHackMe \"Active Directory Basics\" or equivalent room.",
          "Common AD attack concepts — Pass-the-Hash, Kerberoasting (conceptual only, understand what they target).",
          "TryHackMe AD-related room.",
          "Apply to 15 roles this week (3/day across Tue-Fri). Send 7 LinkedIn notes.",
          "Apply to remaining roles. Reach out to 2 alumni or former school connections working in tech.",
          "(Revision) Explain Kerberos authentication in 2 minutes out loud. Commit notes.",
        ],
        kpi: "35 cumulative applications sent. Can explain Kerberos at a high level.",
        exit: "Can explain the difference between authentication and authorization in an AD environment.",
      },
      {
        week: 14,
        title: "Python for Security / Script #2 + APPLY 36-50",
        objective: "Second automation tool; application pipeline healthy.",
        days: [
          "Python `requests` library — write a script that sends HTTP requests and inspects response headers/status codes.",
          "Build a simple Security Headers Checker — takes a URL, checks for CSP, HSTS, X-Frame-Options, outputs a score.",
          "Add clean CLI formatting (using `argparse` and `colorama`/`rich`), push to GitHub with full README.",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 50).",
          "Send 10 LinkedIn connection requests to security team leads / managers.",
          "(Revision) Re-run the security headers tool against 5 live websites. Commit any bug fixes.",
        ],
        kpi: "Security Headers script live on GitHub. 50 cumulative applications sent.",
        exit: "Script runs with `--help` and handles invalid URLs gracefully without crashing.",
      },
      {
        week: 15,
        title: "Network Security & Packet Analysis Deep-Dive + APPLY 51-70",
        objective: "Wireshark fluency elevated to interview-ready level.",
        days: [
          "Wireshark display filters mastery — `ip.addr`, `tcp.flags`, `http.request`, `dns.flags.response`, frame size filters.",
          "Analyze 2 sample PCAPs from Malware-Traffic-Analysis.net (beginner tutorials).",
          "Document findings from PCAP 1 — infected host IP, malicious domain, downloaded file hash.",
          "Document findings from PCAP 2.",
          "Apply to 10 roles today.",
          "Apply to 10 roles today (cumulative: 70). Send 8 LinkedIn notes.",
          "(Revision) Write a 1-page \"PCAP Analysis Walkthrough\" markdown doc, push to GitHub. Review applications tracker.",
        ],
        kpi: "2 PCAP analyses documented. 70 cumulative applications sent.",
        exit: "Can write 5 complex Wireshark display filters from memory without checking syntax references.",
      },
      {
        week: 16,
        title: "Interview Prep Phase 2 + Mock #2 + APPLY 71-90",
        objective: "Behavioral + scenario-based interview readiness; second mock milestone.",
        days: [
          "Behavioral questions preparation using the STAR method (Situation, Task, Action, Result) — write stories for: \"Tell me about a time you solved a tough technical problem\", \"Why security?\", \"How do you handle something you don't know?\".",
          "Scenario questions: \"You see an alert for an unusual outbound connection at 2 AM — walk me through what you do step-by-step.\"",
          "Scenario questions: \"A user reports their computer is slow and they saw a pop-up — what do you do?\"",
          "Mock Interview #2 — full 45-minute technical + behavioral mock with a mentor, senior practitioner, or through a platform (Pramp/Discord community).",
          "Apply to 10 roles today.",
          "Apply to 10 roles today (cumulative: 90).",
          "(Revision) Review Mock #2 feedback. Update the STAR stories document. Commit notes.",
        ],
        kpi: "Mock #2 completed with documented feedback. 90 cumulative applications sent.",
        exit: "MONTH 4 GATE — 90+ applications sent; 3 GitHub project repos; STAR stories written and practiced; Mock #2 completed with passing feedback from reviewer.",
        milestone: "Mock Interview #2 cleared",
      },
    ],
  },
  {
    month: 5,
    title: "Interview Execution + Target Outreach",
    weeks: [
      {
        week: 17,
        title: "Resume v3 + Targeted Cold Outreach + APPLY 91-110",
        objective: "Resume polished to final form; high-touch outreach begins for target companies.",
        days: [
          "Update Resume to v3 — add AD knowledge, Python security headers tool, PCAP analysis sample, refined bullet points focusing on impact.",
          "Build a \"Target 20\" list — 20 companies you specifically want to work at. Find the security team leads or engineering managers on LinkedIn.",
          "Write personalized, 3-sentence outreach messages referencing a specific project or post from the person or company.",
          "Send 5 targeted messages today.",
          "Send 5 targeted messages today. Apply to 10 general listings (cumulative: 100).",
          "Apply to 10 more general listings (cumulative: 110). Send remaining targeted messages.",
          "(Revision) Follow up on any application sent 2+ weeks ago that hasn't received a response. Commit Resume v3.",
        ],
        kpi: "Resume v3 final. Target 20 list built and contacted. 110 cumulative applications.",
        exit: "All 20 target companies contacted with custom notes.",
        milestone: "Resume v3 (final) live",
      },
      {
        week: 18,
        title: "Live Interview Readiness Drill + APPLY 111-125",
        objective: "Active interview loop management; zero degradation in fundamentals.",
        days: [
          "Daily: 15-minute fundamentals flashcard drill (ports, OSI, attack types, defenses) — do this every morning this week.",
          "Daily: check and respond to all email / LinkedIn interview invitations within 2 hours of receiving them.",
          "Prepare company-specific research doc for any active interview processes (company's product, tech stack, recent security news).",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 125).",
          "Practice 3 whiteboard/explain-on-a-call scenarios: (1) How DNS works, (2) How you'd investigate a phishing email, (3) How HTTPS protects data.",
          "(Revision) Re-run and polish all GitHub repo demos so they are live and clean if an interviewer clicks them during a call.",
        ],
        kpi: "125 cumulative applications. Zero unresponded recruiter emails > 24 hours.",
        exit: "Can explain all 3 whiteboard scenarios smoothly in under 3 minutes each.",
      },
      {
        week: 19,
        title: "Mock Interview #3 (Full Panel Simulation) + APPLY 126-140",
        objective: "Final mock hurdle — simulating the full interview panel experience.",
        days: [
          "Mock Interview #3 — full 60-minute panel simulation (HR intro + technical deep dive + scenario triage + candidate questions for the panel).",
          "Review Mock #3 recording / feedback — address any remaining gaps immediately.",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 140).",
          "Send 5 follow-up notes to recruiters/managers for active applications.",
          "Deep-dive into any technical question from Mock #3 that wasn't answered at 100% confidence.",
          "(Revision) Update answers document with all new questions encountered this week. Commit.",
        ],
        kpi: "Mock #3 completed with >= 85% score from reviewer. 140 cumulative applications.",
        exit: "Reviewer gives explicit \"hire\" recommendation in Mock #3.",
        milestone: "Mock Interview #3 cleared",
      },
      {
        week: 20,
        title: "Active Interviewing & Follow-Up Rhythm + APPLY 141-155",
        objective: "Handle first-round and second-round interviews while keeping top-of-funnel full.",
        days: [
          "Execute any scheduled first/second round interviews.",
          "Send structured thank-you emails within 4 hours of every interview (reference one specific technical topic discussed).",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 155).",
          "Review notes from completed interviews — document every question you were asked that you didn't have a perfect answer for.",
          "Research and master the answers to those questions.",
          "(Revision) Weekly pipeline review: how many active processes, what stages, what's next for each. Commit notes.",
        ],
        kpi: "155 cumulative applications. All interview thank-you notes sent within 4 hours.",
        exit: "MONTH 5 GATE — At least 1 active interview process in progress OR 155+ applications sent with 20+ targeted outreaches completed.",
      },
      {
        week: 21,
        title: "Take-Home Challenges & Technical Assessments + APPLY 156-170",
        objective: "Excel at take-home assignments (common in security hiring); maintain pipeline.",
        days: [
          "Take-home assessment strategy: timebox, document assumptions, prioritize clean code/writing over perfection, include a brief video walkthrough.",
          "Practice a simulated 4-hour take-home: analyze a log file, identify the attack, write a 2-page report.",
          "Execute any real take-home assessments from active interview processes.",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 170).",
          "Follow up on all outstanding take-homes and applications.",
          "(Revision) Review and commit the sample take-home report to your private reference library.",
        ],
        kpi: "Sample take-home report complete. 170 cumulative applications.",
        exit: "Any real take-home submitted within 48 hours of receipt, with professional documentation.",
      },
    ],
  },
  {
    month: 6,
    title: "Closing Offers + Final Push",
    weeks: [
      {
        week: 22,
        title: "Final Rounds & Pipeline Maintenance + APPLY 171-185",
        objective: "Final interview rounds; do not slow down applications until an offer is in writing.",
        days: [
          "Execute final-round interviews (often with a VP, CISO, or team lead).",
          "Prepare 5 thoughtful, strategic questions to ask the interviewer (e.g., \"What does success look like in the first 90 days for this role?\", \"What's the team's biggest challenge right now?\").",
          "Apply to 7 roles today.",
          "Apply to 8 roles today (cumulative: 185).",
          "Continue daily 15-minute fundamentals flashcard drill.",
          "Follow up on all pending final-round decisions.",
          "(Revision) Document lessons learned from every final round completed. Commit notes.",
        ],
        kpi: "185 cumulative applications. All final-round interviews executed with structured prep.",
        exit: "Can list 5 high-impact questions to ask interviewers tailored to the specific company.",
      },
      {
        week: 23,
        title: "Offer Evaluation & Negotiation + APPLY 186-200",
        objective: "Evaluate any offers received professionally; negotiate if appropriate; keep applying if no written offer yet.",
        days: [
          "How to evaluate a security internship offer: compensation, mentor quality, tech stack relevance, return offer conversion rate.",
          "How to negotiate professionally as an intern: ask for a modest adjustment or relocation/stipend politely, once, with rationale.",
          "Apply to 7 roles today (if no offer in writing yet).",
          "Apply to 8 roles today (cumulative: 200).",
          "If an offer is received: acknowledge receipt, express enthusiasm, ask for the deadline to respond.",
          "If multiple offers: communicate professionally with all parties, never ghost.",
          "(Revision) Review your tracking sheet. Celebrate progress — 200 applications logged.",
        ],
        kpi: "200 cumulative applications logged. Offer evaluation framework understood.",
        exit: "All written offers evaluated against the structured criteria.",
      },
      {
        week: 24,
        title: "Contingency Execution / Widened Scope + APPLY 201-215",
        objective: "If no offer in hand yet, widen the search scope immediately (IT support, junior sysadmin, QA, security adjacent roles).",
        days: [
          "Widen role search: include \"IT Support Specialist\", \"Junior Systems Administrator\", \"NOC Analyst\", \"Security Compliance Intern\" — all of these transition to SOC/security within 6-12 months.",
          "Adapt Resume slightly for IT/NOC roles — emphasize networking, Linux, and troubleshooting.",
          "Apply to 7 widened-scope roles today.",
          "Apply to 8 roles today (cumulative: 215).",
          "Reach out to 5 staffing agencies / recruiters specializing in IT/security placements.",
          "Continue interview prep daily — stay sharp.",
          "(Revision) Review agency contacts and follow up. Commit adjusted resume versions.",
        ],
        kpi: "215 cumulative applications. Search scope successfully widened.",
        exit: "5 staffing agencies or contract recruiters contacted with your resume.",
      },
      {
        week: 25,
        title: "Pre-Onboarding Prep or Final Sprint + APPLY 216-230",
        objective: "Either preparing for Day 1 at your new role, or pushing the final application sprint.",
        days: [
          "If offer accepted: research the company's tech stack, review their public blog/engineering posts, set up your learning plan for Day 1-30.",
          "If still interviewing: apply to 7 roles today.",
          "If still interviewing: apply to 8 roles today (cumulative: 230).",
          "Reach out directly to 3 second-degree connections on LinkedIn asking for a 15-minute informational chat.",
          "Conduct informational chat(s) — ask about their career path, tips for landing the first role.",
          "Send thank-you notes for all informational chats.",
          "(Revision) Organize all roadmap notes, projects, and cheatsheets into a permanent reference repo.",
        ],
        kpi: "230 cumulative applications (or offer signed). Reference repo organized.",
        exit: "Permanent security reference repo created and organized on GitHub.",
      },
      {
        week: 26,
        title: "Final Gate Check + Close + Continuous Rhythm",
        objective: "Roadmap complete. Either onboarding begins, or the continuous weekly application rhythm is permanent until placed.",
        days: [
          "If placed: celebrate, set 90-day internship goals (convert to full-time, learn the production stack, find a mentor on the team).",
          "If not yet placed: lock in the permanent weekly baseline (10-15 applications/week, 2 GitHub commits/week, 1 blog post or write-up/month) — it is a mathematical certainty if you maintain this volume.",
          "Submit 1 vulnerability report to a Vulnerability Disclosure Program (VDP on HackerOne/Bugcrowd — pick a wide-scope program with no bounties, just kudos).",
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

const PHASES_CYBER = [
  { id: "build", name: "Skill + Portfolio Build", range: [1, 10] },
  { id: "apply", name: "Applications Live", range: [11, 17] },
  { id: "interview", name: "Interview Execution", range: [18, 21] },
  { id: "close", name: "Close", range: [22, 26] },
];

const MASTER_SKILLS_CYBER = [
  "Networking: OSI/TCP-IP, subnetting, DNS, HTTP/HTTPS, TLS handshake, common ports",
  "Linux: permissions, processes, systemd, cron, bash scripting",
  "Core security: CIA triad, AAA, encryption vs hashing, OWASP Top 10 (conceptual + basic hands-on)",
  "Tools: Nmap, Wireshark, Burp Suite Community, one SIEM (Wazuh or Splunk Free)",
  "Basic Python/Bash scripting for automation",
  "Log analysis and alert triage fundamentals",
  "Resume writing, LinkedIn presence, interview communication",
];

// ============================================================================
// ROADMAP DATA 2: RSMSSB IA & HIGH COURT (REASONING + RAJASTHAN GK - 16 WEEKS)
// ============================================================================

const RAW_MONTHS_IA_GK = [
  {
    month: 1,
    title: "Analytical Reasoning, Machine Logic & Rajasthan Geography",
    weeks: [
      {
        week: 1,
        title: "Series Completion & Rajasthan Physical Framework",
        objective: "Instant recall of A-Z letter positions, number series recognition, and mastery over Rajasthan's geographical location & Thar Desert.",
        days: [
          "[Reasoning] Number Series (Arithmetic & Geometric) — Difference method, prime series, square/cube patterns (n^2 +/- 1, n^3 +/- 1). Solve 25 problems. | [GK] Rajasthan Geographical Location, Latitudinal/Longitudinal Extent, Borders with 5 Neighboring States & International Redcliffe Line.",
          "[Reasoning] Number Series (Alternating & Multi-tier) — Double difference method, alternating series, fractional series. Solve 25 problems. | [GK] Western Sandy Desert (Thar) — Great Marusthali, Sand Dune types (Barchan, Seif, Transverse) & Desertification.",
          "[Reasoning] Alphabetical Series & Letter Positions — Memorize A-Z forward (1-26) and reverse (26-1) positions using EJOTY (5,10,15,20,25) and opposite pairs (A-Z, B-Y, C-X). Solve 20 questions. | [GK] Semi-Arid Sandy Plains (Rajasthan Bangar) — Luni Basin (Godwar), Nagaur Uplands (Fluoride belt/Kubad Patti) & Shekhawati Inland drainage.",
          "[Reasoning] Continuous Pattern Series (Letter-Repeating) — Grouping technique (group of 3, 4, or 5 letters), missing blanks in series. Solve 20 questions. | [GK] Aravalli Mountain Range — Origin, Geological structure, Guru Shikhar (1722m), Major Peaks (Ser, Dilwara, Jarga, Achalgarh) & Passes (Nal).",
          "[Reasoning] Mixed Alphanumeric Series — Numbers, letters, and symbols combination. Finding n-th element to left/right. Solve 20 questions. | [GK] Eastern Plains & South-Eastern Hadoti Plateau — Chappan Plains (Mahi 56 villages), Banas Basin & Vindhyan Scarplands.",
          "[Reasoning] Speed Drill & Error Analysis — Timed 30-question mixed series test on LearnLedger. | [GK] Combined 30-question Rajasthan Physical Divisions PYQ test.",
          "(Revision) Re-solve all flagged reasoning series questions from memory. Memorize Rajasthan geographical boundary facts & Aravalli peak heights.",
        ],
        kpi: "Solves standard series questions in under 45 seconds; recalls top 6 Aravalli peaks in descending order unprompted.",
        exit: "25-Question Series speed test score >= 90%; Rajasthan Physical Geography quiz score >= 85%.",
      },
      {
        week: 2,
        title: "Analogy, Classification & Rajasthan Drainage System (Rivers & Lakes)",
        objective: "Flawless classification/analogy logic and complete clarity on Arabian Sea vs Bay of Bengal drainage and saline/freshwater lakes.",
        days: [
          "[Reasoning] Numerical Analogy — Squares, cubes, prime numbers, sum/product of digits relations. Solve 25 questions. | [GK] Arabian Sea Drainage System — Luni River (Origin: Nag Pahar, Balotra salinity change, Tributaries: Bandi, Sukri, Jawai).",
          "[Reasoning] Alphabetical Analogy — Shifting positions (+2, -3, reverse), opposite letter pairs. Solve 25 questions. | [GK] Arabian Sea Drainage System (Part 2) — Mahi River (Origin: MP, Tropics of Cancer twice-cutting river, Chappan Plains, Som-Mahi-Jakam Triveni Sangam) & Sabarmati / West Banas.",
          "[Reasoning] Verbal & Semantic Analogy — State-Capital, Currency, Tool-Worker, Instrument-Measurement relationships. Solve 30 questions. | [GK] Bay of Bengal Drainage System (Part 1) — Chambal River (Origin: Janapav, Dams: Gandhi Sagar, Rana Pratap Sagar, Jawahar Sagar, Kota Barrage, Chulia Fall) & Badlands topography.",
          "[Reasoning] Number Classification (Odd One Out) — Finding odd number/pair based on divisibility, prime/composite, square/cube roots. Solve 25 questions. | [GK] Bay of Bengal Drainage System (Part 2) — Banas River (Origin: Khamnore hills, Van Ki Asha, Triveni Sangam at Bigod) & Banganga / Gambhiri.",
          "[Reasoning] Word & Letter Classification — Odd letter-group out based on vowel counts, position differences; odd word out based on semantic class. Solve 25 questions. | [GK] Inland Drainage Rivers — Ghaggar (Dead River), Kantli (Torawati region), Sabi, Ruparel & Kakney.",
          "[Reasoning] Figural & Non-Verbal Analogy/Classification — Image rotations (90°, 180°), mirror/water reflection logic. Solve 20 questions. | [GK] Lakes of Rajasthan — Saline Lakes (Sambhar, Pachpadra, Didwana) & Freshwater Lakes (Jaisamand, Rajsamand, Pichhola, Fateh Sagar, Nakki Lake).",
          "(Revision) Timed 35-question Analogy/Classification test. Draw river origin and tributary flow maps on blank Rajasthan outline map.",
        ],
        kpi: "Instantly spots math relations in numerical analogies; accurately lists all 4 Chambal river dams in geographical sequence.",
        exit: "Scores >= 32/35 on Week 2 reasoning test; 100% accuracy on Rajasthan River tributaries matching.",
      },
      {
        week: 3,
        title: "Coding-Decoding, Math Signs & Rajasthan Climate, Soil & Forests",
        objective: "Fast sentence deciphering, 100% accuracy in BODMAS sign substitution, and mastery over Koppen climate classification & forest reports.",
        days: [
          "[Reasoning] Letter Coding (Shift & Pattern) — Forward, backward, cross-pattern shifting (+1, +2, +3 or -1, -2, -3). Solve 25 questions. | [GK] Climate of Rajasthan — Temperature extremes (Churu, Phalodi), Annual rainfall distribution, Loo (hot winds) & Mawath (Winter rainfall / Golden Drops).",
          "[Reasoning] Opposite Letter & Reverse Coding — Coding words using exact opposite letters (e.g., KING -> TRIP) and position reversal. Solve 25 questions. | [GK] Climatic Classification — Koppen's Classification (Aw, BShw, BWhw, Cwg) with district representations & Thornthwaite basics.",
          "[Reasoning] Number & Symbol Coding — Coding letters to numbers (sum/product of positions, vowel counts). Solve 25 questions. | [GK] Soils of Rajasthan — USDA Soil Taxonomy (Aridisols, Alfisols, Entisols, Inceptisols, Vertisols - Hadoti black soil) & Soil Erosion issues.",
          "[Reasoning] Sentence Deciphering Coding — Finding code for specific words by comparing common words across sentences ('pit dar na' means 'you are good'). Solve 20 questions. | [GK] Forest Wealth of Rajasthan — Recorded Forest Area, Reserved, Protected and Unclassified Forests classification (Latest ISFR State of Forest Report data).",
          "[Reasoning] Substitution & Matrix Coding — \"If Red is called Green...\", Matrix Coding tables (Row-Column indexing). Solve 25 questions. | [GK] National Parks & Wildlife Sanctuaries — Ranthambore, Keoladeo Ghana (UNESCO Wetland), Mukundra Hills, Ramgarh Vishdhari (4th Tiger Reserve), Khejri (State Tree), Chinkara/Camel (State Animals), Godawan (State Bird).",
          "[Reasoning] Mathematical Operations Substitution — Replacing arithmetic signs (+ means -, * means /) and evaluating strictly via BODMAS. Solve 25 questions. | [GK] Combined 30-question Climate, Soil & Forest PYQ drill on LearnLedger.",
          "(Revision) Timed mixed 30-question Coding-Decoding test. Write Koppen climate code formulas and district mapping from memory.",
        ],
        kpi: "Deciphers sentence-based codes in under 30 seconds; identifies Koppen codes (BWhw vs BShw) for any given Rajasthan district without error.",
        exit: "Solves 10/10 sentence coding problems with zero errors; 100% score on Koppen climate mapping.",
      },
      {
        week: 4,
        title: "Inequality, Input-Output, Direction Sense & Rajasthan Minerals + Month 1 Gate",
        objective: "Flawless mastery over Direct/Coded Inequalities, Machine Input-Output shifting, Direction & Distance Sense, and Rajasthan mineral resources.",
        days: [
          "[Reasoning] Inequality I (Direct & Chained Statements) — Basic symbols (>, <, >=, <=, =), combining inequality chains, definite truth vs false relations. Solve 25 questions. | [GK] Mineral Wealth of Rajasthan (Metallic) — Lead-Zinc (Zawar, Rampura-Agucha), Copper (Khetri, Chandmari), Iron Ore (Mori-Banja, Nimla-Raisalo).",
          "[Reasoning] Inequality II (Coded & Either-Or Cases) — Coded inequality symbols (@, #, $, %), either-or complementary pairs (e.g., A >= B and A < B). Solve 25 questions. | [GK] Non-Metallic Minerals & Energy — Gypsum (Jamsar), Rock Phosphate (Jhamarkotra), Wollastonite & Barite (Rajasthan 100% monopoly), Petroleum (Barmer-Sanchore basin: Mangla, Bhagyam, Aishwarya wells).",
          "[Reasoning] Machine Input-Output (Shifting & Arranging) — Step-by-step word/number rearrangement rules (alphabetical left-shift, numerical right-shift), identifying Step number and final output. Solve 20 questions. | [GK] Irrigation & Canal Projects — Indira Gandhi Canal Project (IGNP - Origin: Harike Barrage, Feeder vs Main canal, 7 Lift Canals & beneficiary districts).",
          "[Reasoning] Direction & Distance Sense I — Cardinal directions, Pythagoras theorem shortest distance (H^2 = B^2 + P^2), angle-based turns (45°, 90°, 135°, 180°). Solve 20 questions. | [GK] Major River Valley Projects — Bisalpur Project (Banas river - drinking water lifeline), Jakam Project, Narmada Canal (Sprinkler irrigation mandatory).",
          "[Reasoning] Direction & Distance Sense II — Shadow cases (morning vs evening sun), facing North/South shadow orientation, Coded direction sense. Solve 20 questions. | [GK] Agriculture & Crops of Rajasthan — Rabi, Kharif, Zaid crops; Leading position in Mustard, Bajra, Guar, Gram production; Agro-climatic zones (10 zones).",
          "[Reasoning] Machine Logic & Direction Combined Practice Drill — 25 mixed Inequality, Input-Output, and Direction problems from PYQs. | [GK] Full Rajasthan Geography 50-Question Mega Test covering all Month 1 topics.",
          "(Revision) Month 1 Cumulative Test — 50 Questions (25 Reasoning including Inequality/Input-Output + 25 Rajasthan Geography) under a 45-minute strict timer. Full error review.",
        ],
        kpi: "Solves chained inequality expressions in under 20 seconds; names the 7 IGNP lift canals and their renamed names from memory.",
        exit: "MONTH 1 GATE — Month 1 Cumulative Test score >= 85% (43/50 correct within 45 minutes); zero errors in inequality and cardinal direction orientation.",
        milestone: "Month 1 Gate: Geography & Machine Logic Mastered",
      },
    ],
  },
  {
    month: 2,
    title: "Relational Logic, Syllogisms, Word Ranking & Rajasthan Art & Culture",
    weeks: [
      {
        week: 5,
        title: "Cross-Phase Quiz #1 + Blood Relations & UNESCO Hill Forts & Architecture",
        objective: "Rapid family tree mapping and complete architectural knowledge of Rajasthan's 6 UNESCO hill forts, palaces & cenotaphs.",
        days: [
          "[Cross-Phase Recall] Cross-Phase Mixed Quiz #1 — 20 Questions (10 Reasoning Series/Inequality + 10 Rajasthan Geography from Phase 1). | [Reasoning] Family Tree Construction Basics — Symbols convention (Male = +, Female = -, Couple = <=>, Sibling = ---, Generation gap = Vertical line). Solve 20 basic generation questions. | [GK] UNESCO World Heritage Hill Forts (Part 1) — Chittorgarh Fort (3 Sakas: 1303, 1535, 1568; Vijay Stambh, Kirti Stambh, Padmini Palace) & Kumbhalgarh Fort (Katargarh, 36 km wall, Birthplace of Maharana Pratap).",
          "[Reasoning] Multi-Generation Relationship Puzzles — Maternal vs Paternal relations (Uncle, Aunt, Cousin, Grandparents, Nephew, Niece). Solve 20 questions. | [GK] UNESCO World Heritage Hill Forts (Part 2) — Ranthambore Fort (Trinetra Ganesh temple, 1301 Saka of Hammir Dev), Amer Fort (Sheesh Mahal, Shila Devi temple) & Gagron Fort (Jhalawar - Water Fort / Jal Durg).",
          "[Reasoning] Pointing / Dialogue-Based Questions — \"Pointing to a photograph, a man said: He is the only son of my mother's father...\" Breaking statements backwards. Solve 20 questions. | [GK] UNESCO Hill Forts (Part 3) & Other Major Forts — Jaisalmer (Sonar Qila - Yellow sandstone, Half Saka), Mehrangarh (Jodhpur - Mayurdhwaj, Chamunda Devi), Junagarh (Bikaner - 'Zameen Ka Gewar', Anup Mahal) & Taragarh (Ajmer/Bundi).",
          "[Reasoning] Coded Blood Relations (Basic) — A + B means A is father of B; A - B means A is sister of B. Decoding given expressions. Solve 20 questions. | [GK] Palaces & Monuments of Rajasthan — Hawa Mahal (5 storeys: Sharad, Ratan, Vichitra, Prakash, Hawa; Lal Chand Usta), City Palace (Jaipur/Udaipur), Jal Mahal, Umaid Bhawan Palace.",
          "[Reasoning] Coded Blood Relations (Inverse & Elimination) — Checking which expression proves 'P is nephew of Q'. Elimination using gender and generation gap. Solve 20 questions. | [GK] Cenotaphs (Chhatris) & Stepwells (Baoris) — 84-Pillared Chhatri (Bundi), 80-Pillared Moosi Maharani Chhatri (Alwar), Bada Bagh (Jaisalmer), Chand Baori (Abhaneri, Dausa), Rani Ji Ki Baori (Bundi).",
          "[Reasoning] Mixed Blood Relations Speed Test — 25 questions including tricky in-law relationships. | [GK] 30-Question Forts & Architecture PYQ drill on LearnLedger.",
          "(Revision & Buffer) Re-solve all pointing-type and coded relation errors. Consolidate fort constructors, dates, and architectural features.",
        ],
        kpi: "Accurately draws a 3-generation family tree diagram in under 40 seconds; names the 5 storeys of Hawa Mahal and 6 UNESCO hill forts instantly.",
        exit: "Cross-Phase Quiz #1 score >= 85%; 20-Question Blood Relations timed quiz score >= 90%; Rajasthan Forts & Monuments quiz score >= 85%.",
      },
      {
        week: 6,
        title: "Venn Diagrams, Syllogisms & Folk Deities, Saints & Sects",
        objective: "100% error-free Syllogism deductions (including Either-Or) and deep factual retention of Rajasthan Panch-Pirs, Folk Deities & Bhakti Saints.",
        days: [
          "[Reasoning] Logical Venn Diagrams (Geometric Selection) — Selecting the best representing diagram among 3 words (Doctors, Humans, Engineers; State, Country, City). Solve 25 questions. | [GK] Folk Deities (Panch-Pir) — Ramdevji (Runecha, Kamadiya panth, Terah Tali dance, 24 Baniyan), Pabuji (Plague protector, Camel bringer, Rebari deity, Phad painting, Pavade), Gogaji (Dadrewa, Gogamedi, Dhurmadi, Snake deity).",
          "[Reasoning] Multi-Figure Overlapping Venn Diagrams — Counting specific categories from overlapping circles/rectangles/triangles (\"Educated rural women who are employed\"). Solve 20 questions. | [GK] Other Major Folk Deities — Mehaji Mangaliya (Bapini), Hadbuji (Bhankti, vehicle: cart), Tejaji (Khadnal, Parbatsar cattle fair, Snake-bite protector), Devnarayanji (Gurjar deity, longest Phad painting on postal stamp), Mallinathji & Tallinathji.",
          "[Reasoning] Syllogism Fundamentals (100% Rules) — Universal Positive (All A are B), Universal Negative (No A is B), Particular Positive (Some A are B), Particular Negative (Some A are not B). Standard Venn drawings. | [GK] Folk Goddesses (Lok Deviyan) — Karni Mata (Deshnoke, Bikaner - Rats / Kabas, White rat), Jin Mata (Rewasa, Sikar - Longest folk song), Shila Devi (Amer - brought by Man Singh I from Bengal), Sheetla Mata (Chaksu, Jaipur - donkey vehicle, cold food / Basoda festival), Tanot Mata (Jaisalmer - soldiers' deity).",
          "[Reasoning] Syllogism 2-Statement Deductions — Valid conclusions, definite conclusions vs possibilities. Avoiding invalid assumptions. Solve 25 questions. | [GK] Religious Sects & Saints (Bhakti / Nirguna) — Jambhoji (Bishnoi sect, 29 rules, Samrathal Dhora, Mukam, environmental conservation), Jasnathji (Katriyasor, Bikaner - 36 rules, Agni Nritya / Fire dance).",
          "[Reasoning] Syllogism 3-Statement & \"Either-Or\" Cases — Conditions for 'Either I or II follows' (Same subject-predicate, one positive & one negative, both individually doubtful). Solve 20 questions. | [GK] Major Saints & Reformers — Dadu Dayal (Rajasthan's Kabir, Naraina, Dadu Panth, Alakh Dariba), Meera Bai (Bhakti poetess, Krishna devotee, Raidas as guru), Sant Pipaji (Gagron, tailor community deity), Sant Dhannaji, Charandasji.",
          "[Reasoning] Syllogism & Venn Diagram Combined Drill — 30 questions matching exact RSMSSB IA & High Court question style. | [GK] 30-Question Folk Deities & Saints PYQ test on LearnLedger.",
          "(Revision & Buffer) Review all \"Either-Or\" edge cases. Re-verify the 5 Panch-Pirs and temple locations on Rajasthan map.",
        ],
        kpi: "100% mastery of identifying \"Either-Or\" complementary pairs; lists the 5 Panch-Pirs and their chief temples without hesitation.",
        exit: "Syllogism speed test score >= 85%; Folk Deities & Saints quiz score >= 90%.",
      },
      {
        week: 7,
        title: "Critical Statement Logic & Fairs, Festivals, Folk Dances & Music",
        objective: "Evaluating assumptions, arguments, and conclusions objectively, and mastering Rajasthan's fairs, calendar festivals, folk dances & musical instruments.",
        days: [
          "[Reasoning] Statement & Assumptions I — Understanding implicit vs explicit statements. Rules for valid assumptions (Assumption must be directly related, non-extreme, no 'only/all' traps). Solve 20 questions. | [GK] Traditional Festivals (Hindu/Jain/Muslim/Sikh Calendars) — Chaitra to Falgun months; Teej (Shravan Shukla Tritiya), Kajli Teej (Bundi - Bhadrapada Krishna Tritiya), Gangaur (Chaitra Shukla Tritiya), Sheetlashtami, Paryushan Parva.",
          "[Reasoning] Statement & Assumptions II — Advertisement, notice, official appeal and government policy assumptions. Solve 20 questions. | [GK] Famous Fairs of Rajasthan — Pushkar Fair (Kartik Purnima, Ajmer), Beneshwar Fair (Magh Purnima, Dungarpur - Som/Mahi/Jakam, Adivasi Kumbh), Kolayat Fair (Kapil Muni, Bikaner), Ramdevra Fair (Pokhran), Khatu Shyamji Fair (Sikar).",
          "[Reasoning] Statement & Conclusions — Direct derivation from given facts only. Differentiating between a conclusion (definite truth) and a presumption. Solve 20 questions. | [GK] Folk Dances of Rajasthan (Part 1) — Professional/Social Dances: Ghoomar (State Dance / Soul of Rajasthan Dances), Kalbelia (Gulabo Sapera - UNESCO Intangible Heritage 2010), Terah Tali (Kamadiya panth, Ramdevra), Chari Dance (Kishangarh, Gujjar community, Falgu Bai), Kacchi Ghodi (Shekhawati).",
          "[Reasoning] Statement & Arguments (Strong vs Weak) — Analyzing arguments on government decisions and social policies. Strong argument rules (factual, logical, realistic) vs Weak arguments (emotional, ambiguous, biased). Solve 20 questions. | [GK] Tribal Folk Dances (Part 2) — Bhil Dances (Gair, Gauri / Rai dance drama, Yuddh, Dwichakri), Garasia Dances (Valar - dance without instrument, Loor, Mandal, Kood), Meena & Sahariya Dances (Shikari dance).",
          "[Reasoning] Statement & Course of Action — Practical, feasible, and proportional solutions to a given problem. Avoiding harsh/unrealistic extremes. Solve 20 questions. | [GK] Folk Dramas (Lok Natya) — Khyal (Kuchamani, Shekhawati, Turra-Kalangi), Rammat (Bikaner/Jaisalmer, Tej Kavi), Tamasha (Jaipur, Banshidhar Bhatt), Swang, Nautanki (Bharatpur).",
          "[Reasoning] Cause & Effect / Assertion-Reason — Identifying independent causes, principal effects, or common causes. Solve 20 questions. | [GK] Folk Musical Instruments (Vadya Yantra) — Tat (Rawanhattha, Sarangi, Kamayacha, Jantar), Sushir (Algoza - State Instrument, Shehnai, Pungi, Bankiya), Avanaddh (Mridang, Dhol, Chang, Khanjari), Ghan (Manjira, Khartal, Ghanti).",
          "(Revision) Mixed Verbal Logic Test of 30 questions. Write down personal rules for avoiding assumption bias. Review folk instrument classifications.",
        ],
        kpi: "Distinguishes between definite logical conclusions and unsupported outside assumptions; classifies any given folk instrument into Tat/Sushir/Avanaddh/Ghan instantly.",
        exit: "Verbal logic test score >= 80%; Folk Dances & Music quiz score >= 85%.",
      },
      {
        week: 8,
        title: "Order, Ranking, Dictionary Word Ordering, Seating & Paintings, Handicrafts + Month 2 Gate",
        objective: "Linear ranking formulas, dictionary word rank sequencing, circular seating execution, and deep retention of Rajasthan painting schools & handicrafts.",
        days: [
          "[Reasoning] Linear Ranking (Single Person & Interchanging) — Total = (Left + Right) - 1; Position from Right = (Total - Left) + 1; Finding total after position interchange. Solve 25 questions. | [GK] Rajasthani Painting Schools (Chitrakala) — Mewar School (Chawand style under Maharana Pratap, Ragmala by Nisardin, Sahibdin), Nathdwara School (Pichhwai paintings - Krishna Leela, Manorath).",
          "[Reasoning] Dictionary & Alphabetical Word Ranking — Arranging words in alphabetical dictionary order, finding the 3rd/4th word in sequence, calculating numerical rank of a word. Solve 25 questions. | [GK] Marwar & Hadoti Painting Schools — Jodhpur style (Dhola-Maru), Kishangarh Style (Nihal Chand, 'Bani-Thani' - Monalisa of India by Eric Dickinson), Bundi Style (Animal-bird paintings, Chitrashala), Kota Style (Hunting scenes / Shikar by women).",
          "[Reasoning] Ranking Comparisons — Vertical comparisons of Height, Weight, Marks, Age (A is taller than B but shorter than C). Solve 20 questions. | [GK] Dhundhar School & Frescoes — Jaipur style (Adamkad portraits by Sahibram), Alwar style, Shekhawati Haveli Wall Paintings (Open Art Gallery of Rajasthan).",
          "[Reasoning] Linear Seating Arrangement — Single row, all facing North; single row, North & South facing. Solve 15 puzzles. | [GK] Handicrafts of Rajasthan (Hastshilp) — Blue Pottery (Jaipur, Kripal Singh Shekhawat), Usta Kala (Bikaner - Camel leather art, Hisamuddin Usta), Thewa Kala (Pratapgarh - Gold work on green glass, Soni family), Terracotta (Molela village, Rajsamand), Tarkashi (Nathdwara - Silver wire work).",
          "[Reasoning] Circular Seating Arrangement (Facing Inward) — 6 and 8 persons seated around a circle facing center (Left = Clockwise, Right = Anti-Clockwise). Solve 12 puzzles. | [GK] Textile Crafts, Costumes & Ornaments — Sanganeri & Bagru prints (Jaipur), Azrak & Malir prints (Barmer), Bandhej/Tie & Dye, Kota Doria (Masuria saree); Ornaments of Head (Rakhdi, Borla, Sheeshphool), Ear (Jhumka, Toti), Nose (Nath, Long), Neck (Hansli, Timaniya, Thela), Hand/Foot (Kadla, Pajeb, Ramjhol).",
          "[Reasoning] Square / Rectangular Seating & Facing Outward — Corner vs Middle seating; Left/Right orientation when facing outward. Solve 10 puzzles. | [GK] Full Rajasthan Art, Culture & Heritage 50-Question Mega Test covering all Month 2 topics.",
          "(Revision) Month 2 Cumulative Test — 50 Questions (25 Reasoning Puzzles & Dictionary Ranking + 25 Rajasthan Culture) under a 50-minute timer. Full error analysis.",
        ],
        kpi: "Solves linear position-interchanging & dictionary word ranking problems in under 30 seconds; identifies the craft/artist for Blue Pottery, Thewa Kala, and Usta Kala with zero errors.",
        exit: "MONTH 2 GATE — Month 2 Cumulative Test score >= 85% (43/50 correct within 50 minutes).",
        milestone: "Month 2 Gate: Culture & Seating Logic Mastered",
      },
    ],
  },
  {
    month: 3,
    title: "Clocks, Calendars, Dice, Figure Series & Rajasthan History & Integration",
    weeks: [
      {
        week: 9,
        title: "Cross-Phase Quiz #2 + Clocks & Angle Calculations + Ancient Sites & Mewar Dynasty",
        objective: "Clock angle formula fluency, coinciding/opposite hand frequencies, and historical mastery of Rajasthan's archaeological sites & Mewar dynasty.",
        days: [
          "[Cross-Phase Recall] Cross-Phase Mixed Quiz #2 — 20 Questions (10 Reasoning from Phases 1-2 + 10 Rajasthan Geography/Culture). | [Reasoning] Angle Between Clock Hands — Formula: Angle = |30*H - (11/2)*M|. Calculating angles at exact times (3:40, 7:20, 8:45). Solve 25 questions. | [GK] Ancient Civilizations of Rajasthan — Kalibanga (Hanumangarh, Ghaggar river, A. Ghosh / B.B. Lal, Ploughed field evidence, Fire altars, Camel bones), Ahar (Udaipur, Berach river, Tamravati Nagari, Black & Red ware), Ganeshwar (Sikar, Kantli river, Copper civilization mother).",
          "[Reasoning] Reflex Angles & Special Times — Calculating reflex angle (360° - angle); angles at zero minutes and fractional minutes. Solve 20 questions. | [GK] Other Ancient Sites — Bairat (Viratnagar, Jaipur, Banganga river, Maurya period, Ashoka Bhabru inscription, Buddhist monastery), Bagor (Bhilwara, Kothari river, Animal husbandry early evidence), Nagari (Chittor), Gilund (Rajsamand).",
          "[Reasoning] Coinciding & Opposite Hands — Finding exact time when hands coincide (0° / 11 times in 12 hrs, 22 in 24 hrs) and when hands are in opposite direction (180° / 11 times in 12 hrs, 22 in 24 hrs). Solve 20 questions. | [GK] Mewar Dynasty (Part 1: Origin to Rawal Branch) — Guhiladitya, Bappa Rawal (Nagda capital, Eklingji temple), Jaitra Singh (Battle of Bhutala 1227 vs Iltutmish), Rawal Ratan Singh (Siege of Chittor 1303 by Alauddin Khilji, Padmini Jauhar, Amir Khusro's Khazain-ul-Futuh).",
          "[Reasoning] Right Angles (90° Positions) — Finding exact times when hands are at right angles (22 times in 12 hrs / 44 times in 24 hrs). Solve 20 questions. | [GK] Mewar Dynasty (Part 2: Sisodia Branch & Golden Era) — Rana Hammir (Mewar Uddharak, 1326), Rana Lakha (Zawar silver mine discovered, Pichhola lake built by Banjara), Rana Kumbha (1433-1468: Battle of Sarangpur 1437 vs Mahmud Khilji, Vijay Stambh constructed, Kaviraj Shyamaldas's Veer Vinod stating Kumbha built 32 of 84 forts, Sangeet Raj, Sood Prabandh).",
          "[Reasoning] Faulty Clocks (Fast / Slow Clocks) — Calculating true time when a clock gains or loses uniform minutes per day. Solve 15 questions. | [GK] Mewar Dynasty (Part 3: Rana Sanga & Battle of Khanwa) — Rana Sanga (1509-1528: Battle of Khatoli 1517 vs Ibrahim Lodi, Battle of Gagron vs Mahmud II, Battle of Bayana 1527 vs Babur, Battle of Khanwa 17 March 1527, Pati Perwan custom, 80 wounds on body).",
          "[Reasoning] Speed Drill on Clock Calculations — 25 mixed clock problems timed. Practice direct formula substitution. | [GK] Mewar Dynasty (Part 4: Maharana Pratap & Resistance) — Maharana Udai Singh (Chittor 3rd Saka 1568, Jaimal-Patta, founding of Udaipur 1559); Maharana Pratap (1572-1597: Coronation at Gogunda, Battle of Haldighati 18 June 1576 vs Man Singh, Battle of Dewair 1582 - Marathon of Mewar by James Tod, Chawand capital 1585).",
          "(Revision & Buffer) Memorize standard clock frequency facts. Re-solve faulty clock errors. Review Mewar timeline and battle dates (1303, 1437, 1527, 1576, 1582).",
        ],
        kpi: "Solves hand angle problems in under 30 seconds with 100% accuracy; accurately sequences all major Mewar battles from 1303 to 1582.",
        exit: "Cross-Phase Quiz #2 score >= 85%; 15-Question Clock drill score 100%; Ancient Sites & Mewar History quiz score >= 90%.",
      },
      {
        week: 10,
        title: "Calendar Calculations & Odd Days + Marwar, Bikaner & Amber Dynasties",
        objective: "Odd days method for any historical date in under 60 seconds, and comprehensive knowledge of Rathore & Kachhwaha dynasties.",
        days: [
          "[Reasoning] Leap Years & Odd Days Basics — Ordinary year = 1 odd day (365 days), Leap year = 2 odd days (366 days), Century leap years (divisible by 400). Odd days in 100 yrs (5), 200 yrs (3), 300 yrs (1), 400 yrs (0). Solve 20 questions. | [GK] Marwar Rathore Dynasty (Part 1) — Rao Siha (Founder), Rao Chunda (Mandore capital), Rao Jodha (Founding of Jodhpur 1459, Mehrangarh Fort), Rao Maldeo (1531-1562: 'Hasmatwala Raja', 52 battles victor, Battle of Giri-Sumel Jan 1544 vs Sher Shah Suri - \"For a handful of bajra, I would have lost the empire of Hindustan\", Uma De - 'Roothi Rani').",
          "[Reasoning] Finding Day for Same Year Different Months — Calculating odd days between two dates within the same year. Solve 25 questions. | [GK] Marwar Rathore Dynasty (Part 2) — Rao Chandrasen (1562-1581: 'Forgotten Hero of Rajasthan', 'Pratap of Marwar', Nagaur Court 1570 resistance to Akbar), Maharaja Jaswant Singh I (Battle of Dharmat 1658 vs Aurangzeb), Durgadas Rathore (30-year struggle for Ajit Singh, 'Ulysses of Rathores' by James Tod).",
          "[Reasoning] Finding Day for Different Years (Close Range) — Calculating day of week when date/month is same but year changes (+1 day for ordinary year, +2 days if Feb 29 included). Solve 25 questions. | [GK] Bikaner Rathore Dynasty — Rao Bika (Founding of Bikaner 1488, Kodamdesar), Rao Jaitsi (Battle of Rati-Ghati 1534 vs Kamran), Raja Rai Singh (1574-1612: 'Karna of Rajputana' by Munshi Devi Prasad, built Junagarh Fort 1589-94, Rai Singh Prashasti), Maharaja Anup Singh (Anup Library, patron of literature), Maharaja Ganga Singh (Gang Canal 1927, Chamber of Princes, 3 Round Table Conferences).",
          "[Reasoning] Finding Day for Any Historical Date (Universal Method) — Finding day for dates like 15 August 1947, 26 January 1950, or arbitrary past/future dates without reference. Solve 20 questions. | [GK] Amber/Jaipur Kachhwaha Dynasty (Part 1) — Dulha Rai (Founder), Kokil Dev (Amer capital 1207), Raja Bharmal (First Rajput king to accept Akbar's suzerainty at Sambhar 1562, Harkha Bai marriage), Raja Man Singh I (1589-1614: Akbar's 7000 Mansabdar, Farzand title, conquests of Kabul, Bihar, Bengal, Shila Devi temple Amer).",
          "[Reasoning] Repetition of Calendars — Determining when a given year's calendar will repeat (Leap year + 28 yrs, Leap + 1 = +6 yrs, Leap + 2 / Leap + 3 = +11 yrs). Solve 20 questions. | [GK] Amber/Jaipur Kachhwaha Dynasty (Part 2) — Mirza Raja Jai Singh (1621-1667: Served 3 Mughal emperors, Treaty of Purandar 11 June 1665 with Shivaji, Bihari Lal patron); Sawai Jai Singh II (1700-1743: Founded Jaipur 18 Nov 1727 by Vidyadhar Bhattacharya, 5 Astronomical Observatories / Jantar Mantar at Jaipur, Delhi, Ujjain, Varanasi, Mathura; Hurda Conference 17 July 1734).",
          "[Reasoning] Age Calculation & Day Puzzles — \"3 days before yesterday was Tuesday, what will be 2 days after tomorrow?\" Solve 25 questions. | [GK] Chauhan Dynasty (Ajmer & Ranthambore) — Ajayraj (Ajmer 1113), Arnoraj (Ana Sagar lake), Vigraharaj IV (Bisaldev, Harikeli drama, Sanskrit school / Adhai Din Ka Jhonpra), Prithviraj Chauhan III (1177-1192: Rai Pithora, Battle of Tarain I 1191 vs Ghori, Tarain II 1192); Hammir Dev Chauhan of Ranthambore (1282-1301: 32-pillared chhatri, 1301 Saka vs Alauddin).",
          "(Revision & Buffer) Timed 30-question Calendar test. Review universal date algorithm and summarize achievements of Sawai Jai Singh II and Rao Chandrasen.",
        ],
        kpi: "Can find the day of the week for any historical date in under 60 seconds without calendar aid; lists all 5 Jantar Mantar locations accurately.",
        exit: "20-Question Calendar test score >= 90%; Rajasthan Major Dynasties quiz score >= 85%.",
      },
      {
        week: 11,
        title: "Cubes, Dice, Non-Verbal Figure Series & Peasant, Tribal Movements & 1857 Revolt",
        objective: "Standard/General dice rules, painted cube cut formulas, Non-Verbal Figure Series pattern spotting, and 1857 revolt & peasant movements.",
        days: [
          "[Reasoning] Standard vs Ordinary Dice — Standard dice rule (Sum of opposite faces = 7); Ordinary dice adjacent face identification. Solve 20 questions. | [GK] 1857 Revolt in Rajasthan (Part 1) — AGG (Agent to Governor General) headquarters at Ajmer/Mount Abu, AGG George Patrick Lawrence, 6 British Military Cantonments: Nasirabad (Revolt start: 28 May 1857 by 15th Bengal Native Infantry), Neemuch (3 June, Mohammad Ali Beg), Erinpura (21 August, 'Chalo Delhi, Maro Firangi').",
          "[Reasoning] Two & Three Dice Positions — One common face rule (rotate clockwise), Two common faces rule (third remaining faces are opposite). Solve 25 questions. | [GK] 1857 Revolt in Rajasthan (Part 2) — Auwa (Thakur Kushal Singh: Battle of Bithoda 8 Sept 1857, Battle of Chelawas / Black & White Battle 18 Sept 1857 - Monk Mason head hung on Auwa fort, Sugali Mata - 10 heads & 54 arms deity); Kota Revolt (15 Oct 1857: Jaidayal & Mehrab Khan, Major Burton killed, 6 months administration by rebels).",
          "[Reasoning] Open Dice (Unfolded Cube) — Alternate face rule (in straight line, alternate boxes are opposite). Identifying valid folded boxes. Solve 25 questions. | [GK] Peasant Movements (Bijolia Kisan Andolan: 1897-1941) — Longest non-violent movement in world (44 years), 84 types of taxes (Lag-Bag), Chanwari tax (Rao Krishna Singh), Talwar Bandhai tax (Prithvi Singh); 3 Phases: Phase 1 (1897-1915: Sadhu Sitaram Das, Fateh Karan Charan), Phase 2 (1916-1923: Vijay Singh Pathik / Bhup Singh, Uparmal Panch Board 1917, Pratap newspaper by Ganesh Shankar Vidyarthi), Phase 3 (1923-1941: Manikya Lal Verma, Jamnalal Bajaj, Haribhau Upadhyaya).",
          "[Reasoning] Painted Cube Cutting Problems — Formulas for cube of side n: Total smaller cubes = n^3; 3 faces painted = 8; 2 faces painted = 12*(n-2); 1 face painted = 6*(n-2)^2; 0 faces painted = (n-2)^3. Solve 20 questions. | [GK] Other Peasant Movements — Bengu Kisan Andolan (Chittor, 1921: Ramnarayan Choudhary, Trench Commission, Rupa Ji & Kripa Ji martyrs at Govindpura 1923), Bundi / Barad Andolan (Nanak Ji Bhil martyr singing Jhanda Geet), Alwar / Neemuchana Massacre (14 May 1925 - 'Dyerism Double Distilled' by Mahatma Gandhi), Shekhawati & Sikar Farmers Movement (Kishori Devi, Katrathal Conference 1934 with 10,000 women).",
          "[Reasoning] Non-Verbal Figure Series (Shape Shifting & Patterns) — Sequential shape progression: 45°/90°/135° rotation rules, element addition/deletion, pin-arrow orientation, clockwise/anticlockwise shifts. Solve 25 questions. | [GK] Tribal Movements (Adivasi Andolan) — Bhagat Movement (Govind Giri, Samp Sabha founded 1883, Mangarh Dham Massacre 17 Nov 1913 - Jallianwala Bagh of Rajasthan); Eki / Bhomat Movement (1921: Motilal Tejawat - 'Bavji', 21-point demand letter / 'Mewar Pukar', Neemra massacre).",
          "[Reasoning] Mirror, Water Images & Embedded Figures — Tracing punch holes upon unfolding; spotting hidden figures in complex patterns. Solve 25 questions. | [GK] Prajamandal Movements — Jaipur Prajamandal (1931: Kapurchand Patni, Jamnalal Bajaj), Mewar Prajamandal (1938: Manikya Lal Verma, Balwant Singh Mehta), Marwar Lok Parishad (Jayanarayan Vyas), Bikaner Prajamandal (1936: Magharam Vaidya at Calcutta), Kota Prajamandal (Nayanuram Sharma).",
          "(Revision) Formula recap for cube cuts. Practice 15 open-to-closed dice and 15 figure series conversions. Review Bijolia 3 phases, Mangarh Dham & 1857 cantonments.",
        ],
        kpi: "Flawlessly applies all 5 painted cube formulas for any value of n; solves Figure Series rotation puzzles in under 30 seconds.",
        exit: "Cubes, Dice & Figure Series speed drill score >= 90%; Rajasthan Movements & Revolts quiz score >= 85%.",
      },
      {
        week: 12,
        title: "Arithmetic Reasoning & 7-Stage Integration + Full Composite Mock #1",
        objective: "Heads & legs animal puzzles, age equations, handshake logic, 7 stages of Rajasthan Integration, and completing Full Composite Mock #1.",
        days: [
          "[Reasoning] Missing Number in Matrix / Figures — Row-wise and column-wise mathematical relations (Sum, Product, Difference of squares). Solve 25 questions. | [GK] Integration of Rajasthan (Overview & Background) — 19 Princely States, 3 Chiefships (Kushalgarh, Lava, Neemrana) & 1 Centrally Administered Territory (Ajmer-Merwara); States Department under Sardar Vallabhbhai Patel & V.P. Menon.",
          "[Reasoning] Arithmetic Reasoning (Heads & Legs Puzzles) — 2-legged vs 4-legged animals (Ducks & Cows; Total heads = H, Total legs = L; 4-legged = L/2 - H). Solve 20 questions. | [GK] Integration Stage 1 & 2 — Stage 1: Matsya Sangh (18 March 1948 - Alwar, Bharatpur, Dholpur, Karauli + Neemrana; Capital: Alwar, Rajpramukh: Udaybhan Singh, PM: Shobharam Kumawat, Name given by K.M. Munshi); Stage 2: Rajasthan Sangh / Purva Rajasthan (25 March 1948 - 9 states: Kota, Bundi, Jhalawar, Banswara, Dungarpur, Pratapgarh, Shahpura, Tonk, Kishangarh + Kushalgarh; Capital: Kota, Rajpramukh: Bhim Singh, PM: Gokul Lal Asawa).",
          "[Reasoning] Handshakes & Gift Exchange Logic — Total handshakes for n persons = n*(n-1)/2; Total gifts exchanged = n*(n-1). Solve 20 questions. | [GK] Integration Stage 3 & 4 — Stage 3: Sanyukta Rajasthan (18 April 1948 - Udaipur merged into Purva Rajasthan; Capital: Udaipur, Rajpramukh: Bhupal Singh, PM: Manikya Lal Verma, Inaugurated by Pt. Nehru); Stage 4: Brihat Rajasthan (30 March 1949 - 4 big states: Jaipur, Jodhpur, Bikaner, Jaisalmer merged; Capital: Jaipur on Satyanarayan Rao Committee recommendation, Maharajpramukh: Bhupal Singh, Rajpramukh: Man Singh II, PM: Hiralal Shastri, Rajasthan Day: 30 March).",
          "[Reasoning] Age Puzzles & Ratio Problems in Reasoning — Present age, past age (-x years), future age (+x years) using basic linear equations and ratio balancing. Solve 25 questions. | [GK] Integration Stage 5, 6 & 7 — Stage 5: Sanyukta Brihat Rajasthan (15 May 1949 - Matsya Sangh merged into Brihat Rajasthan on Dr. Shankar Rao Deo Committee recommendation); Stage 6: Rajasthan (26 Jan 1950 - Sirohi merged excluding Delwara/Abu, formal name 'Rajasthan'); Stage 7: Punargathit Rajasthan (1 Nov 1956 - State Reorganization Commission / Fazal Ali Commission: Ajmer-Merwara, Abu-Delwara & Sunel Tappa of MP merged, Sironj given to MP; Rajpramukh post abolished, 1st Governor: Gurumukh Nihal Singh).",
          "[Reasoning] Missing Number in Circles, Triangles & Stars — Outer numbers operating on central number. Solve 25 questions. | [GK] Prominent Freedom Fighters & Women of Rajasthan — Vijay Singh Pathik, Sagarmal Gopa (Jaisalmer - 'Jaisalmer Ka Gundaraj', burned alive in jail), Kesari Singh Barhath (Chetavani Ra Chungatiya to Maharana Fateh Singh), Zorawar Singh & Pratap Singh Barhath, Arjun Lal Sethi (\"If Sethi serves the British, who will drive them out?\"), Damodar Das Rathi; Women: Janaki Devi Bajaj, Ratan Shastri, Anjana Devi Choudhary, Kishori Devi.",
          "[Reasoning + GK] Full Composite Mock #1 (50 Qs) — 25 Reasoning (all Phase 1-3 topics) + 25 Rajasthan GK (all Geography, Culture, History & Integration) under strict 45-minute exam timer.",
          "(Revision & Mock Audit) Separate full-session review of Composite Mock #1. Re-solve all mistakes. Consolidate 7 integration stages table.",
        ],
        kpi: "Solves Heads & Legs animal puzzles in under 20 seconds using formula L/2 - H; names all 7 stages of Rajasthan integration with exact dates, capitals, and prime ministers without notes.",
        exit: "MONTH 3 GATE — Full Composite Mock #1 score >= 85% (43/50 correct).",
        milestone: "Full Composite Mock #1 (Month 3 Gate)",
      },
    ],
  },
  {
    month: 4,
    title: "Data Interpretation (DI), Data Sufficiency, Rajasthan Polity & State E-Governance",
    weeks: [
      {
        week: 13,
        title: "Cross-Phase Quiz #3 + Data Interpretation I (Tables/Bars) & Rajasthan Administrative Setup / Polity",
        objective: "Rapid data extraction, percentage growth calculations from tables/bars, and complete mastery over Rajasthan's constitutional administrative framework.",
        days: [
          "[Cross-Phase Recall] Cross-Phase Mixed Quiz #3 — 20 Questions (10 Reasoning + 10 Rajasthan History/Culture from Phases 1-3). | [Reasoning] DI Math Basics Refresher — Fast percentage calculation (10%, 5%, 1% splits), Ratio simplification, Average formula (Sum/Count). Solve 20 drill questions. | [GK] State Executive (Governor) — Constitutional position, Article 153 to 161, Appointment, Powers (Executive, Legislative, Discretionary, Ordinance Art 213), First Governor (Gurumukh Nihal Singh), First Woman Governor (Pratibha Patil).",
          "[Reasoning] Tabular DI (Single & Multi-Table) — Reading row/column data, finding total production, sales, or student scores. Solve 4 complete table sets (20 questions). | [GK] State Executive (Chief Minister & Council of Ministers) — Article 163, 164, 167; Role of Chief Minister; State Council of Ministers size (Max 15% of Assembly = 30 ministers in Rajasthan including CM, Min 12); Chief Secretary (Mukhya Sachiv - Administrative head of state, 1st CS: K. Radhakrishnan).",
          "[Reasoning] Tabular DI (Percentage & Ratio Based) — Calculating percentage increase/decrease from Year 1 to Year 2, finding ratio of males to females from table data. Solve 4 sets (20 questions). | [GK] State Legislature (Rajasthan Legislative Assembly / Vidhan Sabha) — Unicameral legislature (200 Assembly seats, SC: 34, ST: 25 seats), 1st Speaker (Narottam Lal Joshi), 1st Deputy Speaker (Lal Singh Shaktawat), 1st Leader of Opposition (Jaswant Singh).",
          "[Reasoning] Simple & Grouped Bar Graphs — Reading vertical and horizontal bars, comparing multi-year company revenues or school enrollments. Solve 4 sets (20 questions). | [GK] State Judiciary (Rajasthan High Court) — Article 214, Established 29 August 1949 at Jodhpur by Maharaja Sawai Man Singh, B.R. Patel Committee, Principal Seat at Jodhpur, Bench at Jaipur (re-established 1977), 1st Chief Justice (Kamal Kant Verma).",
          "[Reasoning] Subdivided & Percentage Bar Graphs — Interpreting segmented bars (expenditure breakdown on Rent, Food, Travel). Solve 4 sets (20 questions). | [GK] Statutory & Constitutional Commissions — RPSC (Ajmer, Art 315, 1st Chairman: S.K. Ghosh, 1 Chairman + 7 Members), RSMSSB (Jaipur, estd 2014), State Election Commission (Art 243K, 1st SEC: Amar Singh Rathore), State Finance Commission (Art 243I), State Human Rights Commission (SHRC), Lokayukta (1st Lokayukta: I.D. Dua).",
          "[Reasoning] Timed Table & Bar Graph Drill — 5 complete sets (25 questions) under 25-minute timer. | [GK] Local Self Government (Panchayati Raj & Urban Local Bodies) — 73rd & 74th Constitutional Amendments; Inauguration of Panchayati Raj on 2 Oct 1959 at Nagaur (Bagdari village) by Pt. Nehru; 3-tier structure: Gram Panchayat, Panchayat Samiti, Zila Parishad; District Administration: Role of District Collector, SDM, Tehsildar, BDO.",
          "(Revision & Buffer) Review DI percentage shortcuts. Re-verify Rajasthan Polity articles, assembly seats, and 1st position holders list.",
        ],
        kpi: "Calculates percentage change between two tabular values in under 35 seconds; recalls Assembly seat reservations (SC 34, ST 25) and commission article numbers without error.",
        exit: "Cross-Phase Quiz #3 score >= 85%; Scores >= 22/25 on timed Table & Bar Graph drill; Rajasthan Polity quiz score >= 85%.",
        milestone: "Rajasthan Polity Fluency Cleared",
      },
      {
        week: 14,
        title: "Data Interpretation II (Pie/Line) & State E-Governance I (Jan Aadhaar, SSO, e-Mitra, 181) + Composite Mock #2",
        objective: "Degree-to-percentage conversion fluency in Pie Charts, technical mastery over core digital platforms (Jan Aadhaar, SSO, e-Mitra), and sitting Composite Mock #2.",
        days: [
          "[Reasoning] Pie Chart Basics (Degree & Percentage Conversion) — Total circle = 360° = 100%; 1% = 3.6°; 36° = 10%; 90° = 25%. Fast angle-to-value conversions. Solve 15 conversion problems. | [GK] Rajasthan E-Governance Framework — Department of Information Technology & Communication (DoIT&C - Estd 1987), RajCOMP Info Services Ltd (RISL - 2010), Vision of Digital Rajasthan & Paperless Governance.",
          "[Reasoning] Single Pie Chart Problems — Expenditure distribution, budget allocation, student distribution across subjects. Solve 4 complete pie chart sets (20 questions). | [GK] Jan Aadhaar Yojana (Rajasthan Jan Aadhaar Authority Act 2020) — \"One Number, One Identity, One Card\" (Launched 18 Dec 2019 replacing Bhamashah); 10-Digit Family ID & 11-Digit Individual Member ID; Head of Family: Woman (aged 18+); Direct Benefit Transfer (DBT) delivery backbone.",
          "[Reasoning] Double Pie Chart Problems — Pie Chart 1 (Total students) + Pie Chart 2 (Total girls). Finding boys in specific departments. Solve 3 complete double sets (15 questions). | [GK] Single Sign-On (SSO Rajasthan - sso.rajasthan.gov.in) — Unified citizen identity portal, One Time Registration (OTR) system for recruitment applications, Citizen Apps (G2C), Government Apps (G2G), Business Apps (G2B).",
          "[Reasoning] Single & Multi-Line Graphs — Trend analysis, profit vs loss lines across years, import-export line intersections. Solve 4 sets (20 questions). | [GK] e-Mitra & e-Mitra @ Home — Citizen service delivery network (CSC model in Rajasthan), 500+ G2C/B2C services, e-Mitra kiosk network, doorstep delivery of public services (e-Mitra @ Home), e-Wallet payment integration.",
          "[Reasoning] Combined DI Sets (Table + Pie Chart / Bar + Line Graph) — Reading combined charts for state-wise IT project expenditures. Solve 3 sets (15 questions). | [GK] Rajasthan Sampark Portal (181 Helpline) — 5-tier centralized grievance redressal system (Registration, Moderation, Allocation, Disposal, Verification), Citizen toll-free helpline 181, mobile app, and CM grievance tracking.",
          "[Reasoning + GK] Full Composite Mock #2 (50 Qs) — 25 Reasoning/DI + 25 Rajasthan GK & E-Governance Part-1 under strict 45-minute exam timer.",
          "(Revision & Mock Audit) Review all degree-percentage conversion shortcuts. Memorize Jan Aadhaar ID structure (10 digits family, 11 digits member) and portal URLs.",
        ],
        kpi: "Converts pie chart degree angles (54°, 72°, 108°) to percentage values instantly; recalls exact Jan Aadhaar ID digit specifications with zero confusion.",
        exit: "Combined DI Speed Drill score >= 85% (26/30); Full Composite Mock #2 score >= 85% (43/50).",
        milestone: "Full Composite Mock #2",
      },
      {
        week: 15,
        title: "Data Sufficiency, Puzzles & State E-Governance II (RajKaj, RajNET, iStart, SDC, GIS)",
        objective: "Evaluating sufficiency without redundant calculations and complete command over Rajasthan's e-Office, network, startup and public disclosure systems.",
        days: [
          "[Reasoning] Data Sufficiency Basics & Rules — Understanding the 5 standard answer options (Statement 1 alone is sufficient; Statement 2 alone is sufficient; Either alone is sufficient; Neither is sufficient; Both together are necessary). Solve 15 questions. | [GK] RajKaj (e-Office Rajasthan) — Electronic File Management System for government secretariat and directorates, digital noting, digital signing (DSC), leave management, Annual Performance Appraisal Reports (APAR).",
          "[Reasoning] Data Sufficiency on Ranking & Direction — \"What is R's rank from top?\" / \"In which direction is Village A from Village B?\". Solve 20 questions. | [GK] RajNET (State Wide Area Network - SWAN) — State telecom and optical fiber/satellite network infrastructure connecting State Secretariat down to Gram Panchayats and Atal Seva Kendras.",
          "[Reasoning] Data Sufficiency on Blood Relations & Ages — \"How is M related to N?\" / \"What is the present age of father?\". Solve 20 questions. | [GK] Jan Soochna Portal (jansoochna.rajasthan.gov.in) — Public information portal launched under Section 4(2) of RTI Act 2005 (Proactive disclosure of government schemes without filing RTI), single window access to welfare scheme beneficiaries.",
          "[Reasoning] Complex Matrix Puzzles (Floor / Day / Profession) — 6 persons living on 6 different floors having 6 different professions. Solve 6 full puzzles. | [GK] iStart Rajasthan & Bhamashah Techno Hub (Jaipur) — State startup incubation program, Q-Rate ranking system, funding/grants for tech startups, Bhamashah Techno Hub (largest startup incubator in India at Jhalana, Jaipur).",
          "[Reasoning] Sequential Scheduling Puzzles — 7 exams conducted on 7 days from Monday to Sunday matching person and subject. Solve 6 full puzzles. | [GK] Other Digital Initiatives — Raj-WiFi (free public Wi-Fi), State Data Center (SDC - Tier 4 data center at Jaipur), Raj-Vault (digital document locker), GIS (Raj-CAD/Raj-Dhara geographical information system), Cyber Security Helpdesk.",
          "[Reasoning] High Court & RSMSSB Data Sufficiency Speed Test — 25 mixed Data Sufficiency questions. | [GK] 30-Question Complete Rajasthan E-Governance Mega Test on LearnLedger.",
          "(Revision) Review Data Sufficiency elimination traps. Summarize all state IT initiatives, launch years, and portal functions in a 2-page master cheat-sheet.",
        ],
        kpi: "Solves Data Sufficiency questions without wasting time calculating numerical values; correctly describes the distinct purpose of RajKaj vs RajNET vs Jan Soochna Portal.",
        exit: "Data Sufficiency test score >= 85% (21/25); E-Governance Part-2 test score >= 90%.",
      },
      {
        week: 16,
        title: "Official PYQ Master Drills + Final Clearance Gate",
        objective: "100% mastery over authentic previous-year non-technical question papers (RSMSSB IA 2018, IA 2023-24 & High Court 2024).",
        days: [
          "[Reasoning + GK] RSMSSB IA 2018 Official Exam (Full Non-Tech Section) — Solve all Reasoning, DI and Rajasthan GK questions from the 2018 official exam under a strict 40-minute timer. Full error breakdown.",
          "[Reasoning + GK] RSMSSB IA 2023-24 Official Exam (Full Non-Tech Section) — Solve all Reasoning, DI and Rajasthan GK/E-Gov questions from the 2024 official exam under a strict 40-minute timer. Full error breakdown.",
          "[Reasoning + GK + English] Rajasthan High Court System Assistant 2024 (Section B) — Solve all General Knowledge, English and Reasoning questions from the High Court 2024 paper under a 30-minute timer.",
          "[Reasoning + GK] RSMSSB Computer Instructor 2022 (Paper 1 Non-Tech Section) — Solve 50 questions covering Rajasthan GK and Reasoning from the Computer Teacher exam.",
          "[Surgery Day] Weak Area Deep-Dive — Revisit personal error log from Weeks 1-15. Dedicated 2-hour drill on the 3 lowest-scoring topics (e.g., Syllogism either-or, Calendar odd days, or Integration dates).",
          "[Full-Length Marathon] 60-Question All-Non-Tech Speed Marathon (30 Reasoning/DI + 30 Rajasthan GK/E-Gov) under a 50-minute strict timer.",
          "(Revision) Final Roadmap Clearance Audit — Consolidate master formula cheat-sheet (Clock angles, Calendar odd days, Cube cuts, DI shortcuts, E-Gov ID digits, Integration dates).",
        ],
        kpi: "Scores >= 90% in official RSMSSB IA 2018 & 2023-24 non-technical sections; solves 60 mixed questions in under 45 minutes with <= 5 errors.",
        exit: "FINAL GATE — Overall Non-Technical accuracy across all PYQs >= 90%; Full 16-Week Non-Technical Roadmap 100% Cleared!",
        milestone: "FINAL GATE: 16-Week Non-Technical Roadmap Cleared",
      },
    ],
  },
];

// ============================================================================
// CENTRALIZED ROADMAP CONFIGURATIONS
// ============================================================================

const ROADMAP_CONFIGS = {
  cybersecurity: {
    id: "cybersecurity",
    title: "CYBERQUEST",
    subtitle: "_TRACKER",
    tagline: "Cybersecurity 6M (26 Weeks)",
    icon: "🛡️",
    storageKey: "cyberquest-tracker-state",
    months: RAW_MONTHS_CYBER,
    phases: PHASES_CYBER,
    masterSkills: MASTER_SKILLS_CYBER,
    hasCareerHQ: true,
    totalWeeks: 26,
    defaultStartDate: "2026-07-30",
  },
  ia_gk: {
    id: "ia_gk",
    title: "RSMSSB",
    subtitle: "_TRACKER",
    tagline: "RSMSSB IA & High Court (16 Weeks)",
    icon: "🎯",
    storageKey: "cyberquest-ia-gk-tracker-state",
    months: RAW_MONTHS_IA_GK,
    phases: [
      { id: "p1", name: "Patterns & Geography", range: [1, 4] },
      { id: "p2", name: "Deductive & Culture", range: [5, 8] },
      { id: "p3", name: "Clocks, Dice & History", range: [9, 12] },
      { id: "p4", name: "DI, Polity & E-Gov", range: [13, 16] },
    ],
    masterSkills: [
      "Reasoning: Series, Coding, Inequalities, Machine Input-Output, Direction, Blood Relations, Syllogisms (Either-Or), Ranking, Seating",
      "Logic & Numeracy: Clocks (|30H - 11/2 M|), Calendars (Odd Days), Cubes/Dice, Figure Series, Heads & Legs (L/2 - H)",
      "Data Interpretation (DI): Tabular, Bar, Pie Charts (Degree-to-%), Line Graphs, Data Sufficiency",
      "Rajasthan Geography: Physical divisions (Thar/Aravalli), Drainage (Chambal/Luni/Banas), Climate (Koppen), Soils, Minerals",
      "Rajasthan Art & Culture: 6 UNESCO Forts, Folk Deities (Panch-Pirs), Fairs/Festivals, Dances, Paintings (Bani-Thani), Handicrafts",
      "Rajasthan History: Ancient Sites (Kalibanga/Ahar), Dynasties (Mewar/Marwar/Bikaner/Amber), 1857 Revolt, Bijolia, 7 Integration Stages",
      "Polity & E-Governance: Governor, CM, Assembly, High Court, Jan Aadhaar (10/11 digits), SSO, e-Mitra, RajKaj, RajNET, 181",
    ],
    hasCareerHQ: false,
    totalWeeks: 16,
    defaultStartDate: "2026-08-17",
  },
};

const ACTIVE_ROADMAP_STORAGE_KEY = "cyberquest-active-roadmap";
const ITEMS_PER_WEEK = 9; // 7 daily tasks + kpi + exit
const CAREER_ITEMS = 6; // 3 resume versions + 3 mock interviews

// Applications guidance by phase (from the cybersecurity roadmap's cumulative targets)
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

const TIMELINE_REBASE_VERSION = 1;
const TIMELINE_REBASE_START_DATE = "2026-07-30";

const DEFAULT_STATE = {
  startDate: null,
  timelineRebaseVersion: TIMELINE_REBASE_VERSION,
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
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function computeXP(state) {
  const taskCount = Object.values(state.tasks || {}).filter(Boolean).length;
  const kpiCount = Object.values(state.kpi || {}).filter(Boolean).length;
  const exitCount = Object.values(state.exit || {}).filter(Boolean).length;
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

function calcStreak(dailyLog = {}) {
  const dates = Object.keys(dailyLog)
    .filter((d) => dailyLog[d])
    .sort();
  if (!dates.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = dateFromKey(dates[dates.length - 1]);
  const gapFromToday = Math.round((today - mostRecent) / 86400000);
  if (gapFromToday > 1) return 0; // streak broken

  let count = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const cur = dateFromKey(dates[i]);
    const prev = dateFromKey(dates[i - 1]);
    const diff = Math.round((cur - prev) / 86400000);
    if (diff === 1) count++;
    else break;
  }
  return count;
}

function getTodayInfo(startDate, totalWeeks) {
  if (!startDate) return null;
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - start) / 86400000) + 1;
  if (diffDays < 1) return { upcoming: true, daysUntil: 1 - diffDays };
  if (diffDays > totalWeeks * 7) return { finished: true };
  const week = Math.ceil(diffDays / 7);
  const day = ((diffDays - 1) % 7) + 1;
  return { week, day, diffDays };
}

function weekStats(state, week, allWeeks) {
  const w = allWeeks?.find((x) => x.week === week);
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

function TaskLabel({ taskText, dayNum, checked }) {
  // Check if task contains dual-track or specialized subject markers
  const isSegmented =
    taskText.includes("[Reasoning]") ||
    taskText.includes("[GK]") ||
    taskText.includes("[Cross-Phase Recall]") ||
    taskText.includes("[Reasoning + GK") ||
    taskText.includes("[Surgery Day]") ||
    taskText.includes("[Full-Length Marathon]");

  if (isSegmented) {
    const parts = taskText.split(/\s*\|\s*/);
    const segments = parts.map((part) => {
      const bracketMatch = part.match(/^\[(.*?)\]\s*(.*)$/);
      if (bracketMatch) {
        const tag = bracketMatch[1].trim();
        const content = bracketMatch[2].trim();
        const lower = tag.toLowerCase();

        if (lower === "reasoning") {
          return {
            badge: "REASONING",
            badgeStyle: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
            boxStyle: "border-l-2 border-cyan-500/40 bg-cyan-950/10",
            content,
          };
        } else if (lower === "gk") {
          return {
            badge: "RAJASTHAN GK",
            badgeStyle: "bg-amber-400/10 text-amber-300 border-amber-400/30",
            boxStyle: "border-l-2 border-amber-500/40 bg-amber-950/10",
            content,
          };
        } else if (lower.includes("cross-phase")) {
          return {
            badge: "CROSS-PHASE RECALL",
            badgeStyle: "bg-purple-400/10 text-purple-300 border-purple-400/30",
            boxStyle: "border-l-2 border-purple-500/40 bg-purple-950/10",
            content,
          };
        } else if (lower.includes("surgery")) {
          return {
            badge: "SURGERY DRILL",
            badgeStyle: "bg-rose-400/10 text-rose-300 border-rose-400/30",
            boxStyle: "border-l-2 border-rose-500/40 bg-rose-950/10",
            content,
          };
        } else if (lower.includes("marathon")) {
          return {
            badge: "SPEED MARATHON",
            badgeStyle: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
            boxStyle: "border-l-2 border-yellow-500/40 bg-yellow-950/10",
            content,
          };
        } else if (lower.includes("reasoning + gk")) {
          return {
            badge: "COMPOSITE DRILL",
            badgeStyle: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
            boxStyle: "border-l-2 border-emerald-500/40 bg-emerald-950/10",
            content,
          };
        } else {
          return {
            badge: tag.toUpperCase(),
            badgeStyle: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
            boxStyle: "border-l-2 border-emerald-500/40 bg-emerald-950/10",
            content,
          };
        }
      }

      const parenMatch = part.match(/^\((.*?)\)\s*(.*)$/);
      if (parenMatch) {
        const type = parenMatch[1].trim();
        const content = parenMatch[2].trim();
        return {
          badge: type.toUpperCase(),
          badgeStyle: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
          boxStyle: "border-l-2 border-emerald-500/40 bg-emerald-950/10",
          content,
        };
      }

      return {
        badge: null,
        boxStyle: "border-l-2 border-zinc-700 bg-zinc-900/30",
        content: part,
      };
    });

    return (
      <div className={`space-y-2 py-0.5 transition-opacity ${checked ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-xs ${checked ? "text-zinc-500 line-through" : "text-zinc-400"}`}>
            Day {dayNum}
          </span>
          <span className="h-px flex-1 bg-zinc-800" />
        </div>

        {segments.map((seg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 text-xs leading-relaxed pl-1.5 py-1 px-2 rounded-r ${seg.boxStyle}`}
          >
            {seg.badge && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border flex-shrink-0 ${seg.badgeStyle}`}
              >
                {seg.badge}
              </span>
            )}
            <span className={`font-mono ${checked ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
              {seg.content}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for standard single-track tasks (e.g. Cybersecurity roadmap)
  return (
    <span
      className={`block text-xs sm:text-sm font-mono leading-snug ${
        checked ? "text-zinc-500 line-through" : "text-zinc-200"
      }`}
    >
      Day {dayNum} · {taskText}
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
        {typeof label === "string" ? (
          <span
            className={`block text-sm font-mono leading-snug ${
              checked ? "text-zinc-500 line-through" : "text-zinc-200"
            }`}
          >
            {label}
          </span>
        ) : (
          label
        )}
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

function WeekCard({ week, allWeeks, state, onToggleTask, onToggleKPI, onToggleExit, onResetWeek, isToday, todayDay }) {
  const stats = weekStats(state, week.week, allWeeks);
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
                label={<TaskLabel taskText={task} dayNum={day} checked={checked} />}
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
// FUNNEL STRIP — Dynamic by active roadmap phases
// ============================================================================

function FunnelStrip({ currentWeek, phases }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <p className="text-cyan-400 text-xs mb-3">$ roadmap --phases</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {phases.map((p, i) => {
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
              {i < phases.length - 1 && <span className="text-zinc-700 hidden sm:inline">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// DOCTRINE PANEL — Master skill map (collapsible)
// ============================================================================

function DoctrinePanel({ masterSkills }) {
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
        <div className="px-3 sm:px-4 pb-4">
          <p className="text-emerald-400 text-[11px] mb-2">MASTER (high-yield topics for 100% clearance)</p>
          <ul className="space-y-1.5">
            {masterSkills.map((s, i) => (
              <li key={i} className="text-[11px] text-zinc-400 flex gap-1.5">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
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
          <span className="text-emerald-400 font-bold text-lg">{state.applications || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApplicationsChange(Math.max(0, (state.applications || 0) - 5))}
            className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            −5
          </button>
          <button
            onClick={() => onApplicationsChange((state.applications || 0) + 1)}
            className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            +1
          </button>
          <button
            onClick={() => onApplicationsChange((state.applications || 0) + 5)}
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
            const checked = !!state.resume?.[r.key];
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
            const checked = !!state.mockInterviews?.[m.key];
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
// XP CHART — Dynamic length by active roadmap
// ============================================================================

function XPChart({ state, allWeeks }) {
  const data = allWeeks.map((w) => {
    const s = weekStats(state, w.week, allWeeks);
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
              interval={allWeeks.length > 20 ? 2 : 1}
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
  const [activeRoadmap, setActiveRoadmap] = useState(
    () => localStorage.getItem(ACTIVE_ROADMAP_STORAGE_KEY) || "cybersecurity"
  );
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'all'|'week', week? }
  const [saveError, setSaveError] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);
  const backupMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const hydratedRef = useRef(false);
  const rebasePendingRef = useRef(false);

  // Close backup menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (backupMenuRef.current && !backupMenuRef.current.contains(event.target)) {
        setBackupMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeConfig = ROADMAP_CONFIGS[activeRoadmap] || ROADMAP_CONFIGS.cybersecurity;
  const MONTHS = activeConfig.months;
  const ALL_WEEKS = useMemo(() => MONTHS.flatMap((m) => m.weeks), [MONTHS]);
  const TOTAL_WEEKS = ALL_WEEKS.length;
  const TOTAL_ITEMS = TOTAL_WEEKS * ITEMS_PER_WEEK + (activeConfig.hasCareerHQ ? CAREER_ITEMS : 0);

  // Helper to load tracker state for a given roadmap ID
  const loadStateForRoadmap = useCallback((roadmapId) => {
    const config = ROADMAP_CONFIGS[roadmapId] || ROADMAP_CONFIGS.cybersecurity;
    const savedState = loadTrackerState(config.storageKey, null);
    const nextState = savedState
      ? { ...DEFAULT_STATE, ...savedState }
      : { ...DEFAULT_STATE, startDate: config.defaultStartDate };

    // Keep all tracked work intact while moving the cybersecurity roadmap calendar to its requested baseline
    if (
      roadmapId === "cybersecurity" &&
      savedState &&
      (savedState.timelineRebaseVersion || 0) < TIMELINE_REBASE_VERSION
    ) {
      nextState.startDate = TIMELINE_REBASE_START_DATE;
      nextState.timelineRebaseVersion = TIMELINE_REBASE_VERSION;
      rebasePendingRef.current = true;
    }

    return nextState;
  }, []);

  // Initial mount load
  useEffect(() => {
    const initialId = localStorage.getItem(ACTIVE_ROADMAP_STORAGE_KEY) || "cybersecurity";
    const validId = ROADMAP_CONFIGS[initialId] ? initialId : "cybersecurity";
    setActiveRoadmap(validId);
    const initialState = loadStateForRoadmap(validId);
    setState(initialState);
    setLoaded(true);
  }, [loadStateForRoadmap]);

  // Save state on mutation
  useEffect(() => {
    if (!loaded || !state) return;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      if (!rebasePendingRef.current) {
        setSaveStatus("saved");
        return;
      }
      rebasePendingRef.current = false;
    }

    setSaveStatus("saving");
    const isSaved = saveTrackerState(activeConfig.storageKey, state);
    setSaveError(!isSaved);
    setSaveStatus(isSaved ? "saved" : "error");

    const timer = window.setTimeout(() => {
      if (isSaved) setSaveStatus("saved");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [loaded, state, activeConfig.storageKey]);

  const handleSwitchRoadmap = (newRoadmapId) => {
    if (newRoadmapId === activeRoadmap) return;
    if (!ROADMAP_CONFIGS[newRoadmapId]) return;

    // 1. Auto-save current active state immediately
    if (state && activeConfig) {
      saveTrackerState(activeConfig.storageKey, state);
    }

    // 2. Persist active selection
    localStorage.setItem(ACTIVE_ROADMAP_STORAGE_KEY, newRoadmapId);

    // 3. Load target roadmap state
    const nextState = loadStateForRoadmap(newRoadmapId);
    hydratedRef.current = false;
    setActiveRoadmap(newRoadmapId);
    setState(nextState);
    setDateInput("");
    setToast(`Switched to ${ROADMAP_CONFIGS[newRoadmapId].tagline}`);
  };

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
      const draft = { ...prev, resume: { ...(prev.resume || {}), [key]: !prev.resume?.[key] } };
      if (draft.resume[key]) {
        markDailyLog(draft);
        setToast(`📄 Resume ${key} marked done — +50 XP`);
      }
      return draft;
    });
  };

  const toggleMock = (key) => {
    updateState((prev) => {
      const draft = { ...prev, mockInterviews: { ...(prev.mockInterviews || {}), [key]: !prev.mockInterviews?.[key] } };
      if (draft.mockInterviews[key]) {
        markDailyLog(draft);
        setToast(`🎤 Mock interview ${key.replace("m", "#")} logged — +50 XP`);
      }
      return draft;
    });
  };

  const handleExportAll = () => {
    setBackupMenuOpen(false);
    if (state && activeConfig) {
      saveTrackerState(activeConfig.storageKey, state);
    }

    const cyberState = loadTrackerState("cyberquest-tracker-state", null);
    const iaGkState = loadTrackerState("cyberquest-ia-gk-tracker-state", null);

    const backupData = {
      app: "cyberquest-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      activeRoadmap: activeRoadmap,
      data: {
        cybersecurity: cyberState || (activeRoadmap === "cybersecurity" ? state : null),
        ia_gk: iaGkState || (activeRoadmap === "ia_gk" ? state : null),
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = `cyberquest_progress_backup_${todayStr()}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setToast("📁 All roadmap progress exported successfully!");
  };

  const triggerFileInput = () => {
    setBackupMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (!content || typeof content !== "string") {
          throw new Error("Invalid file content");
        }
        const parsed = JSON.parse(content);

        // Format 1: Full multi-roadmap backup
        if (parsed.data && (parsed.data.cybersecurity || parsed.data.ia_gk)) {
          if (parsed.data.cybersecurity) {
            saveTrackerState("cyberquest-tracker-state", parsed.data.cybersecurity);
          }
          if (parsed.data.ia_gk) {
            saveTrackerState("cyberquest-ia-gk-tracker-state", parsed.data.ia_gk);
          }
          if (parsed.activeRoadmap && ROADMAP_CONFIGS[parsed.activeRoadmap]) {
            localStorage.setItem(ACTIVE_ROADMAP_STORAGE_KEY, parsed.activeRoadmap);
            setActiveRoadmap(parsed.activeRoadmap);
            const restoredState = loadStateForRoadmap(parsed.activeRoadmap);
            setState(restoredState);
          } else {
            const restoredState = loadStateForRoadmap(activeRoadmap);
            setState(restoredState);
          }
          setToast("🎉 Progress for all roadmaps imported successfully!");
          setConfetti(true);
        } else if (parsed.tasks || parsed.startDate || parsed.dailyLog) {
          // Format 2: Direct single-roadmap state backup
          saveTrackerState(activeConfig.storageKey, parsed);
          setState({ ...DEFAULT_STATE, ...parsed });
          setToast(`🎉 Progress for ${activeConfig.title} imported successfully!`);
          setConfetti(true);
        } else {
          throw new Error("Unrecognized backup file format");
        }
      } catch (err) {
        console.error("Import error:", err);
        setToast("❌ Failed to import: Invalid JSON backup file");
      }
    };
    reader.readAsText(file);
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
    const resetState = {
      ...DEFAULT_STATE,
      startDate: activeConfig.defaultStartDate,
    };
    setState(resetState);
    saveTrackerState(activeConfig.storageKey, resetState);
    setConfirmModal(null);
    setToast(`Reset all progress for ${activeConfig.title}`);
  };

  if (!loaded || !state) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-mono text-emerald-400 text-sm animate-pulse">$ booting {activeConfig.id}_tracker...</p>
      </div>
    );
  }

  const { xp, taskCount, kpiCount, exitCount, resumeCount, mockCount } = computeXP(state);
  const level = getLevel(xp);
  const streak = calcStreak(state.dailyLog);
  const completedItems = taskCount + kpiCount + exitCount + (activeConfig.hasCareerHQ ? resumeCount + mockCount : 0);
  const overallPct = Math.round((completedItems / TOTAL_ITEMS) * 100);
  const todayInfo = getTodayInfo(state.startDate, TOTAL_WEEKS);
  const weeksCleared = Object.values(state.exit || {}).filter(Boolean).length;

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
          title={confirmModal.type === "all" ? `reset_all_progress("${activeConfig.title}")` : `reset_week(${confirmModal.week})`}
          body={
            confirmModal.type === "all"
              ? `This wipes all XP, checkmarks, and streak for ${activeConfig.tagline}. This can't be undone.`
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
              {activeConfig.title}<span className="text-cyan-400">{activeConfig.subtitle}</span>
              <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle animate-pulse" />
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={activeRoadmap}
              onChange={(e) => handleSwitchRoadmap(e.target.value)}
              className="bg-zinc-900 text-cyan-300 font-mono text-xs border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="cybersecurity">🛡️ Cybersecurity (6M)</option>
              <option value="ia_gk">🎯 RSMSSB (4M)</option>
            </select>

            {/* Backup & Restore Dropdown */}
            <div className="relative" ref={backupMenuRef}>
              <button
                onClick={() => setBackupMenuOpen((o) => !o)}
                title="Backup & Restore Progress"
                className="flex items-center gap-1.5 bg-zinc-900 text-zinc-300 hover:text-cyan-300 font-mono text-xs border border-zinc-700 hover:border-zinc-500 rounded px-2 py-1 focus:outline-none transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="hidden sm:inline">Backup</span>
                <span className="text-[9px] text-zinc-500">▾</span>
              </button>

              {backupMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl py-1 z-50 text-xs font-mono">
                  <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Progress Backup & Sync
                  </div>
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Export Progress (.json)</span>
                  </button>
                  <button
                    onClick={triggerFileInput}
                    className="w-full text-left px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-cyan-300 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Import Progress (.json)</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>

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
                  : "Saved"}
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

        {/* PHASES FUNNEL */}
        <FunnelStrip
          phases={activeConfig.phases}
          currentWeek={todayInfo && !todayInfo.upcoming && !todayInfo.finished ? todayInfo.week : null}
        />

        {/* MASTER SKILL MAP REFERENCE */}
        <DoctrinePanel masterSkills={activeConfig.masterSkills} />

        {/* CAREER HQ (CYBERSECURITY ONLY) */}
        {activeConfig.hasCareerHQ && (
          <CareerHQ
            state={state}
            currentWeek={todayInfo && !todayInfo.upcoming && !todayInfo.finished ? todayInfo.week : null}
            onApplicationsChange={setApplications}
            onToggleResume={toggleResume}
            onToggleMock={toggleMock}
          />
        )}

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
                🏁 {TOTAL_WEEKS}-week roadmap window complete. Review any unfinished weeks below.
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
        <XPChart state={state} allWeeks={ALL_WEEKS} />

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
                    allWeeks={ALL_WEEKS}
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
