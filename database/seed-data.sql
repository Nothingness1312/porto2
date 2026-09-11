-- =====================================================================
--  KKARINZZZ — demo seed data for Supabase
--  Order  : run AFTER schema.sql (tables must exist). rls.sql is optional
--           before this file - seeding happens as postgres (bypasses RLS).
--  Usage  : Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--  Idempotent: re-runs are safe (ON CONFLICT DO NOTHING, natural keys).
--
--  NOT seeded here (by design):
--   * admin user  -> create via Authentication -> Users -> Add user,
--                    then set App metadata { "role": "admin" }
--                    (see rls.sql header)
--   * messages    -> come from the public contact form
--   * activity    -> written by the admin panel itself
-- =====================================================================

-- ============================  SiteSetting  ===========================
INSERT INTO "SiteSetting" ("key", "value", "updatedAt") VALUES
  ('site_title',           '"KKARINZZZ"'::jsonb, NOW()),
  ('site_subtitle',        '"Cybersecurity Researcher"'::jsonb, NOW()),
  ('site_tagline',         '"CTF Player · Reverse Engineer · Security Enthusiast"'::jsonb, NOW()),
  ('hero_description',     '"Breaking systems apart to understand how they work."'::jsonb, NOW()),
  ('about_intro',          '"Cybersecurity researcher, reverse engineer, and CTF player."'::jsonb, NOW()),
  ('about_bio_1',          '"I break software for a living and for fun. My focus is understanding how systems fail - then writing up exactly how, so the next person doesn''t have to learn it the hard way."'::jsonb, NOW()),
  ('about_bio_2',          '"From binary exploitation to web app recon, every project here is documented with the same discipline: reproduce, isolate, exploit, fix, write it up."'::jsonb, NOW()),
  ('about_bio_3',          '"I spend most nights in CTF rooms, reversing firmware, and hunting bugs in things other people assume are safe."'::jsonb, NOW()),
  ('about_focus',          '"reverse eng."'::jsonb, NOW()),
  ('about_status',         '"open to work"'::jsonb, NOW()),
  ('about_timezone',       '"UTC+7 (WIB)"'::jsonb, NOW()),
  ('about_language',       '"Python / C / JS"'::jsonb, NOW()),
  ('about_os',             '"Arch / Kali"'::jsonb, NOW()),
  ('about_editor',         '"Neovim"'::jsonb, NOW()),
  ('about_tea',            '"critical"'::jsonb, NOW()),
  ('favicon_url',          '"/favicon.svg"'::jsonb, NOW()),
  ('contact_email',        '"kkarinzzz@protonmail.com"'::jsonb, NOW()),
  ('available_for_hire',   '"false"'::jsonb, NOW()),
  ('open_to_collaboration','"true"'::jsonb, NOW())
ON CONFLICT ("key") DO NOTHING;

-- ============================  Project  ===============================
INSERT INTO "Project" ("title", "slug", "description", "content", "category", "featured", "published", "technologies", "tools", "githubUrl", "difficulty", "updatedAt") VALUES
(
  'Android Root Detection Bypass Framework',
  'android-root-detection-bypass',
  'A Frida-based framework that dynamically patches common Android root detection mechanisms in banking and fintech applications.',
  $$## Overview

This project provides a modular framework for bypassing root detection in Android applications using Frida's dynamic instrumentation capabilities.

## Technical Details

The framework hooks into multiple detection layers:

- **Native checks**: `/system` partition access, `su` binary presence
- **API-based**: `SafetyNet` / `Play Integrity` attestation workarounds
- **File system**: Hidden root file detection, Magisk Hide integration
- **Process monitoring**: Detection of Frida server and root-related processes

## Architecture

```
android-root-bypass/
├── bypass_engine.ts       # Core bypass engine
├── modules/
│   ├── file_system.ts     # File-based detection bypass
│   ├── native_checks.ts   # Native library hooking
│   ├── api_attestation.ts # SafetyNet/PI attestation
│   └── process_monitor.ts # Process detection bypass
└── config.yaml            # Target app configuration
```

## Results

Successfully bypassed root detection in 12+ banking applications across Android 10–14.$$,
  'mobile-security', true, true,
  ARRAY['TypeScript','Frida','Android','Java','Kotlin'],
  ARRAY['Frida','JADX','APKTool','ADB','Objection'],
  'https://github.com/kkarinzzz/android-root-bypass',
  'advanced', NOW()
),
(
  'Memory Forensics Toolkit',
  'memory-forensics-toolkit',
  'Custom Volatility plugins and automation scripts for extracting artifacts from Windows memory dumps during incident response.',
  $$## Overview

A collection of custom Volatility 3 plugins and Python automation scripts designed for efficient memory forensics analysis during incident response engagements.

## Features

- Automated memory dump triage
- Custom plugin for extracting browser credentials
- Network connection reconstruction from memory
- Process injection detection via VAD analysis
- Timeline generation from memory artifacts

## Toolchain

Built on Volatility 3 with custom extensions:

```python
class ExtractBrowserCreds(volatility3.framework.layers.pslist.PsList):
    """Extract browser credentials from memory."""
    def _generator(self, procs):
        for proc in procs:
            # Parse in-memory credential stores
            ...
```

## Use Cases

- Incident response engagements
- Malware analysis
- CTF memory forensics challenges
- Digital forensics examinations$$,
  'digital-forensics', true, true,
  ARRAY['Python','Volatility 3','Windows Internals'],
  ARRAY['Volatility','Python','YARA','Strings','Wireshark'],
  'https://github.com/kkarinzzz/memforensics-toolkit',
  'advanced', NOW()
),
(
  'Network Traffic Analyzer with Deep Packet Inspection',
  'network-traffic-analyzer',
  'A high-performance network traffic analyzer built with libpcap for protocol dissection, anomaly detection, and traffic classification.',
  $$## Overview

Custom network traffic analyzer implementing deep packet inspection for identifying protocols, detecting anomalies, and classifying network flows.

## Architecture

- High-performance packet capture with libpcap
- Protocol dissection engine (HTTP, DNS, TLS, SMB)
- Statistical anomaly detection (entropy analysis)
- Flow reconstruction and session tracking
- Real-time alert generation

## Capabilities

- Protocol identification up to Layer 7
- DNS tunneling detection via entropy analysis
- Encrypted traffic classification (JA3/JA3S)
- Beacon detection for C2 identification
- Automated PCAP report generation$$,
  'network-analysis', false, true,
  ARRAY['Python','C','libpcap','Scapy'],
  ARRAY['Wireshark','tshark','tcpdump','Zeek'],
  NULL,
  'advanced', NOW()
),
(
  'CTF Challenge Solver Collection',
  'ctf-solver-collection',
  'A curated collection of automated and semi-automated scripts for solving CTF challenges across multiple categories.',
  $$## Overview

Growing collection of CTF challenge solvers, organized by category.

## Categories

### Reverse Engineering
- ELF/PE binary analyzer
- Obfuscation pattern detector
- Symbolic execution helpers (angr scripts)

### Cryptography
- RSA common attacks (Wiener, Hastad, Franklin-Reiter)
- AES mode oracle detector
- Hash length extension attack tool

### Web
- SQL injection payload generator
- SSRF mapping tool
- JWT vulnerability scanner

### Forensics
- Steganography detection suite
- File carving automator
- Metadata extraction pipeline$$,
  'ctf', true, true,
  ARRAY['Python','Bash','C','JavaScript'],
  ARRAY['Ghidra','IDA','angr','z3','SageMath'],
  'https://github.com/kkarinzzz/ctf-solvers',
  'intermediate', NOW()
),
(
  'Web Application Security Scanner',
  'web-app-security-scanner',
  'An automated web vulnerability scanner with modular payload generation and intelligent crawling capabilities.',
  $$## Overview

Custom web application security scanner built for discovering vulnerabilities in modern web applications.

## Features

- Intelligent spider/crawler with JavaScript rendering
- Modular vulnerability detection plugins
- Custom payload generation engine
- Authentication flow handling (OAuth, MFA)
- API endpoint discovery (OpenAPI/Swagger)
- Report generation in HTML and JSON formats

## Plugin Architecture

```javascript
class XSSPlugin extends ScannerPlugin {
  name = 'xss-detection';
  payloads = readPayloads('xss');

  async scan(context) {
    for (const param of context.params) {
      const response = await this.inject(param, this.payloads);
      if (this.detectReflection(response)) {
        return this.report('xss', param, response);
      }
    }
  }
}
```$$,
  'web-security', false, true,
  ARRAY['TypeScript','Node.js','Playwright'],
  ARRAY['Burp Suite','OWASP ZAP','Playwright','curl'],
  NULL,
  'intermediate', NOW()
),
(
  'Malware Sample Analysis Workbench',
  'malware-analysis-workbench',
  'Automated malware analysis pipeline combining static and dynamic analysis in an isolated sandbox environment.',
  $$## Overview

An automated malware analysis pipeline that combines static analysis, dynamic behavioral analysis, and sandboxed execution for comprehensive malware characterization.

## Pipeline Stages

1. **Static Analysis**: PE header parsing, import table analysis, string extraction, YARA rule matching
2. **Dynamic Analysis**: API call monitoring, file system activity, registry modifications, network communication
3. **Sandbox Execution**: Isolated VM execution with behavioral monitoring
4. **Reporting**: Automated IOC extraction and MITRE ATT&CK mapping

## MITRE ATT&CK Mapping

Automatically maps observed behaviors to ATT&CK techniques:
- T1059 - Command and Scripting Interpreter
- T1053 - Scheduled Task/Job
- T1071 - Application Layer Protocol
- T1486 - Data Encrypted for Impact$$,
  'malware-analysis', false, true,
  ARRAY['Python','C++','Docker','QEMU'],
  ARRAY['YARA','PEframe','Cuckoo Sandbox','Wireshark','Procmon'],
  NULL,
  'advanced', NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- ============================  Writeup  ===============================
INSERT INTO "Writeup" ("title", "slug", "excerpt", "content", "category", "difficulty", "tags", "published", "publishedAt", "updatedAt") VALUES
(
  'Reverse Engineering Android Apps with Frida',
  'reverse-engineering-android-frida',
  'A practical guide to using Frida for dynamic instrumentation and reverse engineering Android applications.',
  $$## Introduction

Frida is a powerful dynamic instrumentation toolkit that lets you inject JavaScript or native code into running processes.

## Setup

```bash
# Install frida-tools
pip install frida-tools

# Download frida-server for your device architecture
adb push frida-server-16.x.x-android-arm64 /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
adb shell /data/local/tmp/frida-server &
```

## Basic Hooking

```javascript
// Hook a Java method
Java.perform(function() {
  var MainActivity = Java.use('com.target.app.MainActivity');
  MainActivity.checkPin.implementation = function(pin) {
    console.log('Pin entered: ' + pin);
    return true; // Always return true for testing
  };
});
```

## SSL Pinning Bypass

```javascript
Java.perform(function() {
  var TrustManager = Java.registerClass({
    name: 'com.trustmanager.TrustManager',
    implements: [Java.use('javax.net.ssl.X509TrustManager')],
    methods: {
      checkClientTrusted: function(chain, authType) {},
      checkServerTrusted: function(chain, authType) {},
      getAcceptedIssuers: function() { return []; }
    }
  });
  // Apply to SSL context
});
```

## Conclusion

Frida provides a flexible approach to mobile application security testing that complements static analysis tools like JADX and APKTool.$$,
  'mobile-security', 'intermediate',
  ARRAY['frida','android','reverse-engineering','dynamic-analysis'],
  true, NOW(), NOW()
),
(
  'Windows Memory Forensics with Volatility 3',
  'windows-memory-forensics-volatility',
  'Deep dive into extracting forensic artifacts from Windows memory dumps using Volatility 3 framework.',
  $$## Overview

Memory forensics is one of the most powerful techniques in digital forensics, allowing analysts to extract volatile evidence that doesn't persist on disk.

## Key Artifacts

### Process Analysis
```bash
vol -f memory.dmp windows.pslist
vol -f memory.dmp windows.pstree
vol -f memory.dmp windows.psscan  # Hidden processes
```

### Network Connections
```bash
vol -f memory.dmp windows.netscan
vol -f memory.dmp windows.netstat
```

### Registry Hives
```bash
vol -f memory.dmp windows.registry.hivelist
vol -f memory.dmp windows.hashdump  # Extract password hashes
```

## Building Custom Plugins

Volatility 3's plugin architecture allows extending functionality:

```python
class CustomPlugin(interfaces.plugins.PluginInterface):
    _required_framework_version = (2, 0, 0)

    def _generator(self):
        for proc in self.context.modules[self.config.primary].processes():
            # Extract custom artifacts
            yield (0, (proc.UniqueProcessId, proc.ImageFileName))
```

## Best Practices

1. Always verify the memory dump integrity before analysis
2. Note the system time offset for timeline correlation
3. Cross-reference findings with disk forensics
4. Document your analysis methodology$$,
  'digital-forensics', 'advanced',
  ARRAY['volatility','memory-forensics','windows','incident-response'],
  true, NOW(), NOW()
),
(
  'Building a Basic Fuzzer with Python',
  'building-basic-fuzzer-python',
  'Step-by-step guide to creating a custom fuzzer for finding vulnerabilities in binary applications.',
  $$## What is Fuzzing?

Fuzz testing is an automated software testing technique that involves providing invalid, unexpected, or random data as input to a computer program.

## Simple Fuzzer Architecture

```python
import subprocess
import random
import string

def generate_input(max_length=1024):
    strategy = random.choice(['random', 'known_bad', 'boundary'])
    if strategy == 'random':
        length = random.randint(1, max_length)
        return ''.join(random.choices(string.printable, k=length))
    elif strategy == 'known_bad':
        payloads = ['A' * 256, 'A' * 65536, '\x00' * 100, '\xff' * 100]
        return random.choice(payloads)
    else:  # boundary
        return str(random.choice([0, 1, -1, 127, 128, 255, 256, 32767, 32768, 65535]))

def fuzz(target_binary, iterations=1000):
    for i in range(iterations):
        test_input = generate_input()
        try:
            proc = subprocess.run(
                [target_binary],
                input=test_input.encode(),
                timeout=5,
                capture_output=True
            )
            if proc.returncode == -11:  # SIGSEGV
                print(f'[!] Crash at iteration {i}')
                save_crash(test_input)
        except subprocess.TimeoutExpired:
            pass
```

## Advanced Techniques

- Coverage-guided fuzzing with AFL/libFuzzer
- Mutation-based vs generation-based approaches
- Corpus management
- Crash deduplication$$,
  'ctf', 'beginner',
  ARRAY['fuzzing','python','vulnerability-research','binary-analysis'],
  true, NOW(), NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- ============================  Skill  =================================
INSERT INTO "Skill" ("name", "category", "description", "proficiency", "icon", "sortOrder", "updatedAt") VALUES
  ('Ghidra',       'reverse-engineering',  'NSA''s open-source reverse engineering framework', 90, 'ghidra',       1, NOW()),
  ('IDA Pro',      'reverse-engineering',  'Industry-standard disassembler and debugger',       85, 'ida',          2, NOW()),
  ('Frida',        'reverse-engineering',  'Dynamic instrumentation toolkit for mobile and desktop', 92, 'frida',      3, NOW()),
  ('JADX',         'mobile-security',      'Android APK decompiler and code analyzer',          88, 'jadx',         1, NOW()),
  ('Burp Suite',   'web-security',         'Web application security testing platform',        85, 'burp',         1, NOW()),
  ('Wireshark',    'network-analysis',     'Network protocol analyzer',                        90, 'wireshark',    1, NOW()),
  ('Volatility',   'digital-forensics',    'Memory forensics framework',                        85, 'volatility',   1, NOW()),
  ('Python',       'programming',          'Primary scripting and tool development language',   90, 'python',       1, NOW()),
  ('C/C++',        'programming',          'Systems programming and exploit development',       75, 'c',            2, NOW()),
  ('TypeScript',   'programming',          'Full-stack web development and tooling',            85, 'typescript',   3, NOW()),
  ('Linux',        'system-administration','System administration and security testing',        90, 'linux',        1, NOW()),
  ('Docker',       'system-administration','Containerized environments for analysis and deployment', 82, 'docker',   2, NOW()),
  ('Metasploit',   'penetration-testing',  'Penetration testing framework',                     80, 'metasploit',   1, NOW()),
  ('SQLMap',       'web-security',         'Automated SQL injection testing',                   85, 'sqlmap',       2, NOW()),
  ('Nmap',         'network-analysis',     'Network discovery and port scanning',               88, 'nmap',         2, NOW()),
  ('YARA',         'malware-analysis',     'Pattern matching for malware identification',       80, 'yara',         1, NOW()),
  ('Binary Ninja', 'reverse-engineering',  'Modern binary analysis platform',                   70, 'binaryninja',  4, NOW()),
  ('Hashcat',      'cryptography',         'Password recovery and hash cracking',               78, 'hashcat',      1, NOW()),
  ('OpenSSL',      'cryptography',         'Cryptographic toolkit',                             75, 'openssl',      2, NOW()),
  ('Git',          'system-administration','Version control and collaboration',                 88, 'git',          3, NOW())
ON CONFLICT ("name") DO NOTHING;

-- ============================  Certificate  ===========================
INSERT INTO "Certificate" ("title", "issuer", "description", "imageUrl", "url", "date", "sortOrder", "updatedAt") VALUES
  ('Certified Ethical Hacker (CEH)', 'EC-Council',
   'Professional certification covering network security, ethical hacking, and penetration testing methodologies.',
   'https://images.credential.net/embed/zc6xqnl7/18092021_093623_2_145.jpg',
   'https://www.credential.net/verify/zc6xqnl7', '2023-05-15', 1, NOW()),
  ('CompTIA Security+', 'CompTIA',
   'Foundational certification in IT security covering threats, vulnerabilities, cryptography, and risk management.',
   'https://images.credential.net/embed/abcd1234/24022022_103000_1_891.jpg',
   'https://www.credential.net/verify/abcd1234', '2022-02-24', 2, NOW()),
  ('TryHackMe - Advent of Cyber', 'TryHackMe',
   'Completed the Advent of Cyber security challenge covering log analysis, web exploitation, and blue-team defense.',
   'https://tryhackme.com/img/badges/adventofcyber.svg',
   'https://tryhackme.com/kkarinzzz', '2024-01-05', 3, NOW())
ON CONFLICT ("title") DO NOTHING;

-- ============================  Achievement  ===========================
INSERT INTO "Achievement" ("title", "description", "date", "organization", "type", "isPlaceholder", "updatedAt") VALUES
  ('CTF Competition Participant',
   'Active participant in various CTF competitions including HackTheBox and TryHackMe challenges',
   '2024-01-15', 'Online CTF Platforms', 'competition', true, NOW()),
  ('Security Research Portfolio',
   'Built comprehensive portfolio of security research projects spanning mobile security, forensics, and web application testing',
   '2024-06-01', 'Independent', 'milestone', true, NOW()),
  ('Responsible Disclosure',
   'Submitted security vulnerability reports through responsible disclosure programs',
   '2023-11-01', 'Various Bug Bounty Platforms', 'research', true, NOW())
ON CONFLICT ("title") DO NOTHING;

-- ============================  SocialLink  ============================
INSERT INTO "SocialLink" ("platform", "url", "username", "icon", "sortOrder", "updatedAt") VALUES
  ('GitHub',    'https://github.com/kkarinzzz',                 'kkarinzzz', 'github',     1, NOW()),
  ('LinkedIn',  'https://linkedin.com/in/kkarinzzz',             'kkarinzzz', 'linkedin',   2, NOW()),
  ('HackTheBox','https://app.hackthebox.com/profile/kkarinzzz',  'kkarinzzz', 'hackthebox', 3, NOW()),
  ('TryHackMe', 'https://tryhackme.com/p/kkarinzzz',             'kkarinzzz', 'tryhackme',  4, NOW()),
  ('Email',     'mailto:kkarinzzz@protonmail.com',               'kkarinzzz@protonmail.com', 'email', 5, NOW())
ON CONFLICT ("platform") DO NOTHING;

-- Done. Next step after this seed:
--   1. supabase-auth: create the admin account (see rls.sql header)
--   2. Then deploy/connect the frontend (frontend-v2) with
--      VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.