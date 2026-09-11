import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  console.log("Seeding database...");

  // Create admin user — require strong password from env
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be set to at least 8 characters (env variable required)");
  }
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: {
      username: adminUsername,
      passwordHash,
    },
  });
  console.log(`Admin user created/updated: ${adminUsername}`);

  // Seed projects
  const projectsData = [
    {
      title: "Android Root Detection Bypass Framework",
      slug: "android-root-detection-bypass",
      description:
        "A Frida-based framework that dynamically patches common Android root detection mechanisms in banking and fintech applications.",
      content:
        "## Overview\n\nThis project provides a modular framework for bypassing root detection in Android applications using Frida's dynamic instrumentation capabilities.\n\n## Technical Details\n\nThe framework hooks into multiple detection layers:\n\n- **Native checks**: `/system` partition access, `su` binary presence\n- **API-based**: `SafetyNet` / `Play Integrity` attestation workarounds\n- **File system**: Hidden root file detection, Magisk Hide integration\n- **Process monitoring**: Detection of Frida server and root-related processes\n\n## Architecture\n\n```\nandroid-root-bypass/\n├── bypass_engine.ts       # Core bypass engine\n├── modules/\n│   ├── file_system.ts     # File-based detection bypass\n│   ├── native_checks.ts   # Native library hooking\n│   ├── api_attestation.ts # SafetyNet/PI attestation\n│   └── process_monitor.ts # Process detection bypass\n└── config.yaml            # Target app configuration\n```\n\n## Results\n\nSuccessfully bypassed root detection in 12+ banking applications across Android 10–14.",
      category: "mobile-security",
      featured: true,
      published: true,
      technologies: ["TypeScript", "Frida", "Android", "Java", "Kotlin"],
      tools: ["Frida", "JADX", "APKTool", "ADB", "Objection"],
      githubUrl: "https://github.com/kkarinzzz/android-root-bypass",
      difficulty: "advanced",
    },
    {
      title: "Memory Forensics Toolkit",
      slug: "memory-forensics-toolkit",
      description:
        "Custom Volatility plugins and automation scripts for extracting artifacts from Windows memory dumps during incident response.",
      content:
        "## Overview\n\nA collection of custom Volatility 3 plugins and Python automation scripts designed for efficient memory forensics analysis during incident response engagements.\n\n## Features\n\n- Automated memory dump triage\n- Custom plugin for extracting browser credentials\n- Network connection reconstruction from memory\n- Process injection detection via VAD analysis\n- Timeline generation from memory artifacts\n\n## Toolchain\n\nBuilt on Volatility 3 with custom extensions:\n\n```python\nclass ExtractBrowserCreds(volatility3.framework.layers.pslist.PsList):\n    \"\"\"Extract browser credentials from memory.\"\"\"\n    def _generator(self, procs):\n        for proc in procs:\n            # Parse in-memory credential stores\n            ...\n```\n\n## Use Cases\n\n- Incident response engagements\n- Malware analysis\n- CTF memory forensics challenges\n- Digital forensics examinations",
      category: "digital-forensics",
      featured: true,
      published: true,
      technologies: ["Python", "Volatility 3", "Windows Internals"],
      tools: ["Volatility", "Python", "YARA", "Strings", "Wireshark"],
      githubUrl: "https://github.com/kkarinzzz/memforensics-toolkit",
      difficulty: "advanced",
    },
    {
      title: "Network Traffic Analyzer with Deep Packet Inspection",
      slug: "network-traffic-analyzer",
      description:
        "A high-performance network traffic analyzer built with libpcap for protocol dissection, anomaly detection, and traffic classification.",
      content:
        "## Overview\n\nCustom network traffic analyzer implementing deep packet inspection for identifying protocols, detecting anomalies, and classifying network flows.\n\n## Architecture\n\n- High-performance packet capture with libpcap\n- Protocol dissection engine (HTTP, DNS, TLS, SMB)\n- Statistical anomaly detection (entropy analysis)\n- Flow reconstruction and session tracking\n- Real-time alert generation\n\n## Capabilities\n\n- Protocol identification up to Layer 7\n- DNS tunneling detection via entropy analysis\n- Encrypted traffic classification (JA3/JA3S)\n- Beacon detection for C2 identification\n- Automated PCAP report generation",
      category: "network-analysis",
      featured: false,
      published: true,
      technologies: ["Python", "C", "libpcap", "Scapy"],
      tools: ["Wireshark", "tshark", "tcpdump", "Zeek"],
      difficulty: "advanced",
    },
    {
      title: "CTF Challenge Solver Collection",
      slug: "ctf-solver-collection",
      description:
        "A curated collection of automated and semi-automated scripts for solving CTF challenges across multiple categories.",
      content:
        "## Overview\n\nGrowing collection of CTF challenge solvers, organized by category.\n\n## Categories\n\n### Reverse Engineering\n- ELF/PE binary analyzer\n- Obfuscation pattern detector\n- Symbolic execution helpers (angr scripts)\n\n### Cryptography\n- RSA common attacks (Wiener, Hastad, Franklin-Reiter)\n- AES mode oracle detector\n- Hash length extension attack tool\n\n### Web\n- SQL injection payload generator\n- SSRF mapping tool\n- JWT vulnerability scanner\n\n### Forensics\n- Steganography detection suite\n- File carving automator\n- Metadata extraction pipeline",
      category: "ctf",
      featured: true,
      published: true,
      technologies: ["Python", "Bash", "C", "JavaScript"],
      tools: ["Ghidra", "IDA", "angr", "z3", "SageMath"],
      githubUrl: "https://github.com/kkarinzzz/ctf-solvers",
      difficulty: "intermediate",
    },
    {
      title: "Web Application Security Scanner",
      slug: "web-app-security-scanner",
      description:
        "An automated web vulnerability scanner with modular payload generation and intelligent crawling capabilities.",
      content:
        "## Overview\n\nCustom web application security scanner built for discovering vulnerabilities in modern web applications.\n\n## Features\n\n- Intelligent spider/crawler with JavaScript rendering\n- Modular vulnerability detection plugins\n- Custom payload generation engine\n- Authentication flow handling (OAuth, MFA)\n- API endpoint discovery (OpenAPI/Swagger)\n- Report generation in HTML and JSON formats\n\n## Plugin Architecture\n\n```javascript\nclass XSSPlugin extends ScannerPlugin {\n  name = 'xss-detection';\n  payloads = readPayloads('xss');\n  \n  async scan(context) {\n    for (const param of context.params) {\n      const response = await this.inject(param, this.payloads);\n      if (this.detectReflection(response)) {\n        return this.report('xss', param, response);\n      }\n    }\n  }\n}\n```",
      category: "web-security",
      featured: false,
      published: true,
      technologies: ["TypeScript", "Node.js", "Playwright"],
      tools: ["Burp Suite", "OWASP ZAP", "Playwright", "curl"],
      difficulty: "intermediate",
    },
    {
      title: "Malware Sample Analysis Workbench",
      slug: "malware-analysis-workbench",
      description:
        "Automated malware analysis pipeline combining static and dynamic analysis in an isolated sandbox environment.",
      content:
        "## Overview\n\nAn automated malware analysis pipeline that combines static analysis, dynamic behavioral analysis, and sandboxed execution for comprehensive malware characterization.\n\n## Pipeline Stages\n\n1. **Static Analysis**: PE header parsing, import table analysis, string extraction, YARA rule matching\n2. **Dynamic Analysis**: API call monitoring, file system activity, registry modifications, network communication\n3. **Sandbox Execution**: Isolated VM execution with behavioral monitoring\n4. **Reporting**: Automated IOC extraction and MITRE ATT&CK mapping\n\n## MITRE ATT&CK Mapping\n\nAutomatically maps observed behaviors to ATT&CK techniques:\n- T1059 - Command and Scripting Interpreter\n- T1053 - Scheduled Task/Job\n- T1071 - Application Layer Protocol\n- T1486 - Data Encrypted for Impact",
      category: "malware-analysis",
      featured: false,
      published: true,
      technologies: ["Python", "C++", "Docker", "QEMU"],
      tools: ["YARA", "PEframe", "Cuckoo Sandbox", "Wireshark", "Procmon"],
      difficulty: "advanced",
    },
  ];

  for (const project of projectsData) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log(`Seeded ${projectsData.length} projects`);

  // Seed writeups
  const writeupsData = [
    {
      title: "Reverse Engineering Android Apps with Frida",
      slug: "reverse-engineering-android-frida",
      excerpt:
        "A practical guide to using Frida for dynamic instrumentation and reverse engineering Android applications.",
      content:
        "## Introduction\n\nFrida is a powerful dynamic instrumentation toolkit that lets you inject JavaScript or native code into running processes.\n\n## Setup\n\n```bash\n# Install frida-tools\npip install frida-tools\n\n# Download frida-server for your device architecture\nadb push frida-server-16.x.x-android-arm64 /data/local/tmp/\nadb shell chmod 755 /data/local/tmp/frida-server\nadb shell /data/local/tmp/frida-server &\n```\n\n## Basic Hooking\n\n```javascript\n// Hook a Java method\nJava.perform(function() {\n  var MainActivity = Java.use('com.target.app.MainActivity');\n  MainActivity.checkPin.implementation = function(pin) {\n    console.log('Pin entered: ' + pin);\n    return true; // Always return true for testing\n  };\n});\n```\n\n## SSL Pinning Bypass\n\n```javascript\nJava.perform(function() {\n  var TrustManager = Java.registerClass({\n    name: 'com.trustmanager.TrustManager',\n    implements: [Java.use('javax.net.ssl.X509TrustManager')],\n    methods: {\n      checkClientTrusted: function(chain, authType) {},\n      checkServerTrusted: function(chain, authType) {},\n      getAcceptedIssuers: function() { return []; }\n    }\n  });\n  // Apply to SSL context\n});\n```\n\n## Conclusion\n\nFrida provides a flexible approach to mobile application security testing that complements static analysis tools like JADX and APKTool.",
      category: "mobile-security",
      difficulty: "intermediate",
      tags: ["frida", "android", "reverse-engineering", "dynamic-analysis"],
      published: true,
    },
    {
      title: "Windows Memory Forensics with Volatility 3",
      slug: "windows-memory-forensics-volatility",
      excerpt:
        "Deep dive into extracting forensic artifacts from Windows memory dumps using Volatility 3 framework.",
      content:
        "## Overview\n\nMemory forensics is one of the most powerful techniques in digital forensics, allowing analysts to extract volatile evidence that doesn't persist on disk.\n\n## Key Artifacts\n\n### Process Analysis\n```bash\nvol -f memory.dmp windows.pslist\nvol -f memory.dmp windows.pstree\nvol -f memory.dmp windows.psscan  # Hidden processes\n```\n\n### Network Connections\n```bash\nvol -f memory.dmp windows.netscan\nvol -f memory.dmp windows.netstat\n```\n\n### Registry Hives\n```bash\nvol -f memory.dmp windows.registry.hivelist\nvol -f memory.dmp windows.hashdump  # Extract password hashes\n```\n\n## Building Custom Plugins\n\nVolatility 3's plugin architecture allows extending functionality:\n\n```python\nclass CustomPlugin(interfaces.plugins.PluginInterface):\n    _required_framework_version = (2, 0, 0)\n    \n    def _generator(self):\n        for proc in self.context.modules[self.config.primary].processes():\n            # Extract custom artifacts\n            yield (0, (proc.UniqueProcessId, proc.ImageFileName))\n```\n\n## Best Practices\n\n1. Always verify the memory dump integrity before analysis\n2. Note the system time offset for timeline correlation\n3. Cross-reference findings with disk forensics\n4. Document your analysis methodology",
      category: "digital-forensics",
      difficulty: "advanced",
      tags: ["volatility", "memory-forensics", "windows", "incident-response"],
      published: true,
    },
    {
      title: "Building a Basic Fuzzer with Python",
      slug: "building-basic-fuzzer-python",
      excerpt:
        "Step-by-step guide to creating a custom fuzzer for finding vulnerabilities in binary applications.",
      content:
        "## What is Fuzzing?\n\nFuzz testing is an automated software testing technique that involves providing invalid, unexpected, or random data as input to a computer program.\n\n## Simple Fuzzer Architecture\n\n```python\nimport subprocess\nimport random\nimport string\n\ndef generate_input(max_length=1024):\n    strategy = random.choice(['random', 'known_bad', 'boundary'])\n    if strategy == 'random':\n        length = random.randint(1, max_length)\n        return ''.join(random.choices(string.printable, k=length))\n    elif strategy == 'known_bad':\n        payloads = ['A' * 256, 'A' * 65536, '\\x00' * 100, '\\xff' * 100]\n        return random.choice(payloads)\n    else:  # boundary\n        return str(random.choice([0, 1, -1, 127, 128, 255, 256, 32767, 32768, 65535]))\n\ndef fuzz(target_binary, iterations=1000):\n    for i in range(iterations):\n        test_input = generate_input()\n        try:\n            proc = subprocess.run(\n                [target_binary],\n                input=test_input.encode(),\n                timeout=5,\n                capture_output=True\n            )\n            if proc.returncode == -11:  # SIGSEGV\n                print(f'[!] Crash at iteration {i}')\n                save_crash(test_input)\n        except subprocess.TimeoutExpired:\n            pass\n```\n\n## Advanced Techniques\n\n- Coverage-guided fuzzing with AFL/libFuzzer\n- Mutation-based vs generation-based approaches\n- Corpus management\n- Crash deduplication",
      category: "ctf",
      difficulty: "beginner",
      tags: ["fuzzing", "python", "vulnerability-research", "binary-analysis"],
      published: true,
    },
  ];

  for (const writeup of writeupsData) {
    const existing = await prisma.writeup.findUnique({
      where: { slug: writeup.slug },
    });
    if (existing) {
      await prisma.writeup.update({
        where: { slug: writeup.slug },
        data: { ...writeup, publishedAt: writeup.published ? new Date() : null },
      });
    } else {
      await prisma.writeup.create({
        data: { ...writeup, publishedAt: writeup.published ? new Date() : null },
      });
    }
  }
  console.log(`Seeded ${writeupsData.length} writeups`);

  // Seed skills
  const skillsData = [
    { name: "Ghidra", category: "reverse-engineering", description: "NSA's open-source reverse engineering framework", proficiency: 90, sortOrder: 1, icon: "ghidra" },
    { name: "IDA Pro", category: "reverse-engineering", description: "Industry-standard disassembler and debugger", proficiency: 85, sortOrder: 2, icon: "ida" },
    { name: "Frida", category: "reverse-engineering", description: "Dynamic instrumentation toolkit for mobile and desktop", proficiency: 92, sortOrder: 3, icon: "frida" },
    { name: "JADX", category: "mobile-security", description: "Android APK decompiler and code analyzer", proficiency: 88, sortOrder: 1, icon: "jadx" },
    { name: "Burp Suite", category: "web-security", description: "Web application security testing platform", proficiency: 85, sortOrder: 1, icon: "burp" },
    { name: "Wireshark", category: "network-analysis", description: "Network protocol analyzer", proficiency: 90, sortOrder: 1, icon: "wireshark" },
    { name: "Volatility", category: "digital-forensics", description: "Memory forensics framework", proficiency: 85, sortOrder: 1, icon: "volatility" },
    { name: "Python", category: "programming", description: "Primary scripting and tool development language", proficiency: 90, sortOrder: 1, icon: "python" },
    { name: "C/C++", category: "programming", description: "Systems programming and exploit development", proficiency: 75, sortOrder: 2, icon: "c" },
    { name: "TypeScript", category: "programming", description: "Full-stack web development and tooling", proficiency: 85, sortOrder: 3, icon: "typescript" },
    { name: "Linux", category: "system-administration", description: "System administration and security testing", proficiency: 90, sortOrder: 1, icon: "linux" },
    { name: "Docker", category: "system-administration", description: "Containerized environments for analysis and deployment", proficiency: 82, sortOrder: 2, icon: "docker" },
    { name: "Metasploit", category: "penetration-testing", description: "Penetration testing framework", proficiency: 80, sortOrder: 1, icon: "metasploit" },
    { name: "SQLMap", category: "web-security", description: "Automated SQL injection testing", proficiency: 85, sortOrder: 2, icon: "sqlmap" },
    { name: "Nmap", category: "network-analysis", description: "Network discovery and port scanning", proficiency: 88, sortOrder: 2, icon: "nmap" },
    { name: "YARA", category: "malware-analysis", description: "Pattern matching for malware identification", proficiency: 80, sortOrder: 1, icon: "yara" },
    { name: "Binary Ninja", category: "reverse-engineering", description: "Modern binary analysis platform", proficiency: 70, sortOrder: 4, icon: "binaryninja" },
    { name: "Hashcat", category: "cryptography", description: "Password recovery and hash cracking", proficiency: 78, sortOrder: 1, icon: "hashcat" },
    { name: "OpenSSL", category: "cryptography", description: "Cryptographic toolkit", proficiency: 75, sortOrder: 2, icon: "openssl" },
    { name: "Git", category: "system-administration", description: "Version control and collaboration", proficiency: 88, sortOrder: 3, icon: "git" },
  ];

  for (const skill of skillsData) {
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name },
    });
    if (existing) {
      await prisma.skill.update({
        where: { id: existing.id },
        data: skill,
      });
    } else {
      await prisma.skill.create({ data: skill });
    }
  }
  console.log(`Seeded ${skillsData.length} skills`);

  // Seed certificates
  const certificatesData = [
    {
      title: "Certified Ethical Hacker (CEH)",
      issuer: "EC-Council",
      description:
        "Professional certification covering network security, ethical hacking, and penetration testing methodologies.",
      imageUrl: "https://images.credential.net/embed/zc6xqnl7/18092021_093623_2_145.jpg",
      url: "https://www.credential.net/verify/zc6xqnl7",
      date: new Date("2023-05-15"),
      sortOrder: 1,
    },
    {
      title: "CompTIA Security+",
      issuer: "CompTIA",
      description:
        "Foundational certification in IT security covering threats, vulnerabilities, cryptography, and risk management.",
      imageUrl: "https://images.credential.net/embed/abcd1234/24022022_103000_1_891.jpg",
      url: "https://www.credential.net/verify/abcd1234",
      date: new Date("2022-02-24"),
      sortOrder: 2,
    },
    {
      title: "TryHackMe - Advent of Cyber",
      issuer: "TryHackMe",
      description:
        "Completed the Advent of Cyber security challenge covering log analysis, web exploitation, and blue-team defense.",
      imageUrl: "https://tryhackme.com/img/badges/adventofcyber.svg",
      url: "https://tryhackme.com/kkarinzzz",
      date: new Date("2024-01-05"),
      sortOrder: 3,
    },
  ];

  for (const cert of certificatesData) {
    const existing = await prisma.certificate.findFirst({
      where: { title: cert.title },
    });
    if (existing) {
      await prisma.certificate.update({ where: { id: existing.id }, data: cert });
    } else {
      await prisma.certificate.create({ data: cert });
    }
  }
  console.log(`Seeded ${certificatesData.length} certificates`);

  // Seed achievements (placeholder/demo)
  const achievementsData = [
    {
      title: "CTF Competition Participant",
      description: "Active participant in various CTF competitions including HackTheBox and TryHackMe challenges",
      date: new Date("2024-01-15"),
      organization: "Online CTF Platforms",
      type: "competition",
      isPlaceholder: true,
    },
    {
      title: "Security Research Portfolio",
      description: "Built comprehensive portfolio of security research projects spanning mobile security, forensics, and web application testing",
      date: new Date("2024-06-01"),
      organization: "Independent",
      type: "milestone",
      isPlaceholder: true,
    },
    {
      title: "Responsible Disclosure",
      description: "Submitted security vulnerability reports through responsible disclosure programs",
      date: new Date("2023-11-01"),
      organization: "Various Bug Bounty Platforms",
      type: "research",
      isPlaceholder: true,
    },
  ];

  for (const ach of achievementsData) {
    const existing = await prisma.achievement.findFirst({
      where: { title: ach.title },
    });
    if (existing) {
      await prisma.achievement.update({ where: { id: existing.id }, data: ach });
    } else {
      await prisma.achievement.create({ data: ach });
    }
  }
  console.log(`Seeded ${achievementsData.length} achievements`);

  // Seed social links
  const socialLinksData = [
    { platform: "GitHub", url: "https://github.com/kkarinzzz", username: "kkarinzzz", icon: "github", sortOrder: 1 },
    { platform: "LinkedIn", url: "https://linkedin.com/in/kkarinzzz", username: "kkarinzzz", icon: "linkedin", sortOrder: 2 },
    { platform: "HackTheBox", url: "https://app.hackthebox.com/profile/kkarinzzz", username: "kkarinzzz", icon: "hackthebox", sortOrder: 3 },
    { platform: "TryHackMe", url: "https://tryhackme.com/p/kkarinzzz", username: "kkarinzzz", icon: "tryhackme", sortOrder: 4 },
    { platform: "Email", url: "mailto:kkarinzzz@protonmail.com", username: "kkarinzzz@protonmail.com", icon: "email", sortOrder: 5 },
  ];

  for (const link of socialLinksData) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });
    if (existing) {
      await prisma.socialLink.update({ where: { id: existing.id }, data: link });
    } else {
      await prisma.socialLink.create({ data: link });
    }
  }
  console.log(`Seeded ${socialLinksData.length} social links`);

  // Seed site settings
  const settingsData = [
    { key: "site_title", value: "KKARINZZZ" },
    { key: "site_subtitle", value: "Cybersecurity Researcher" },
    { key: "site_tagline", value: "CTF Player · Reverse Engineer · Security Enthusiast" },
    { key: "hero_description", value: "Breaking systems apart to understand how they work." },
    { key: "about_intro", value: "Cybersecurity researcher, reverse engineer, and CTF player." },
    { key: "about_bio_1", value: "I break software for a living and for fun. My focus is understanding how systems fail - then writing up exactly how, so the next person doesn't have to learn it the hard way." },
    { key: "about_bio_2", value: "From binary exploitation to web app recon, every project here is documented with the same discipline: reproduce, isolate, exploit, fix, write it up." },
    { key: "about_bio_3", value: "I spend most nights in CTF rooms, reversing firmware, and hunting bugs in things other people assume are safe." },
    { key: "about_focus", value: "reverse eng." },
    { key: "about_status", value: "open to work" },
    { key: "about_timezone", value: "UTC+7 (WIB)" },
    { key: "contact_email", value: "kkarinzzz@protonmail.com" },
    { key: "available_for_hire", value: "false" },
    { key: "open_to_collaboration", value: "true" },
  ];

  for (const setting of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`Seeded ${settingsData.length} site settings`);

  console.log("Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });