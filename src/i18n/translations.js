/**
 * Translation layer — English is the source of truth.
 * Arabic is a professional localization layer.
 * Missing Arabic → gracefully falls back to English (the input key).
 */

export const translations = {
  en: {},
  ar: {
    // ─── Navbar ────────────────────────────────────────────────
    'Home': 'الرئيسية',
    'About': 'نبذة عني',
    'Skills': 'المهارات',
    'Projects': 'المشاريع',
    'Certifications': 'الشهادات',
    'Journey': 'المسيرة المهنية',
    'Contact': 'تواصل معي',
    // ─── Global / UI ────────────────────────────────────────────
    'Download CV': 'تحميل السيرة الذاتية',
    'View Details': 'عرض التفاصيل',
    'Repository': 'الكود المصدري',
    'View Credentials': 'عرض الشهادة',
    "Let's Connect": 'لنتواصل معاً',
    'Loading...': 'جاري التحميل...',
    'Loading projects...': 'جاري تحميل المشاريع...',
    'Failed to load projects': 'فشل تحميل المشاريع',
    'No projects found.': 'لم يتم العثور على مشاريع.',
    'Loading skills...': 'جاري تحميل المهارات...',
    'Failed to load skills': 'فشل تحميل المهارات',
    'No skills found.': 'لم يتم العثور على مهارات.',
    'Loading certifications...': 'جاري تحميل الشهادات...',
    'Failed to load certifications': 'فشل تحميل الشهادات',
    'No certifications found.': 'لم يتم العثور على شهادات.',
    'Untitled Project': 'مشروع بدون عنوان',
    'No description available.': 'لا يوجد وصف متاح.',
    'DevOps Toolchain': 'أدوات DevOps',
    'Core Tools': 'الأدوات الأساسية',

    // ─── Hero ───────────────────────────────────────────────────
    'Cloud & DevOps Engineer': 'مهندس Cloud وDevOps',
    'Welcome to my space': 'مرحباً بك في مساحتي',

    // ─── About ─────────────────────────────────────────────────
    'Discovery': 'استكشاف',
    'Beyond the Console': 'أبعد من مجرد شاشة أوامر',
    'From Enterprise Networking to Cloud Engineering.': 'من شبكات المؤسسات إلى هندسة الحوسبة السحابية.',
    'Networking Mindset': 'عقلية الشبكات',
    'Problem Solver': 'محلل مشكلات',
    'Cloud Infrastructure': 'بنية تحتية سحابية',
    'Available for New Challenges': 'متاح لتحديات جديدة',
    // Terminal keys — left mostly English since it's a code terminal
    'role': 'role',
    'cloud': 'cloud',
    'containers': 'containers',
    'iac': 'iac',
    'cicd': 'cicd',
    'monitoring': 'monitoring',
    'os': 'os',
    'networking': 'networking',
    'status': 'status',

    // ─── Skills ─────────────────────────────────────────────────
    'Expertise': 'خبرات',
    'Skills & Technologies': 'المهارات والتقنيات',
    'A comprehensive toolkit for building and managing modern cloud infrastructure.': 'مجموعة أدوات شاملة لبناء وإدارة البنية التحتية السحابية الحديثة.',
    'Cloud Platform': 'منصة Cloud',
    'DevOps & CI/CD': 'DevOps وCI/CD',
    'Containers & Orchestration': 'إدارة وتنسيق الحاويات',
    'Infrastructure as Code': 'Infrastructure as Code (IaC)',
    'Networking': 'الشبكات',
    'Programming & Scripting': 'البرمجة والسكربتات',
    'Operating Systems': 'أنظمة التشغيل',
    'Monitoring & Observability': 'المراقبة والرصد',

    // ─── Projects ───────────────────────────────────────────────
    'Featured Systems': 'أبرز المشاريع والأنظمة',
    'Projects Architecture': 'هيكلة المشاريع',
    'Production-grade cloud environments and automation pipelines.': 'بيئات سحابية بمستوى الإنتاج ومسارات أتمتة متكاملة.',

    // ─── Certifications ─────────────────────────────────────────
    'Validation': 'اعتمادات',
    'Professional Certifications': 'الشهادات المهنية',
    'Industry-recognized credentials in Cloud & DevOps engineering.': 'شهادات معتمدة في هندسة Cloud وDevOps.',
    'Recognized industry credentials that validate my expertise in cloud architecture, system administration, and networking.': 'شهادات معتمدة تثبت خبرتي في هندسة السحابة وإدارة الأنظمة والشبكات.',
    'Verified': 'موثق',

    // ─── Journey ────────────────────────────────────────────────
    'Roadmap': 'خريطة الطريق',
    'DevOps Engineering Journey': 'رحلتي في هندسة DevOps',
    'Tracing the evolution from network packets to automated cloud ecosystems.': 'تتبع التطور من حزم الشبكات إلى بيئات السحابة المؤتمتة.',
    'PHASE': 'المرحلة',

    // ─── Contact ────────────────────────────────────────────────
    'Get In Touch': 'ابق على تواصل',
    'Deployment Request': 'تواصل معي',
    'Contact Channels': 'قنوات الاتصال',
    'Email': 'البريد الإلكتروني',
    'Phone': 'رقم الهاتف',
    'Location': 'الموقع',
    'Mansoura, Egypt': 'المنصورة، مصر',
    'Send Message': 'إرسال الرسالة',
    'Sending...': 'جاري الإرسال...',
    'Message sent successfully!': 'تم إرسال الرسالة بنجاح!',
    'Message Delivered': 'تم استلام الرسالة',
    "Thank you! I'll get back to you soon.": 'شكراً لك! سأعود إليك قريباً.',
    'Send another?': 'إرسال رسالة أخرى؟',
    'Failed to send message. Please try again.': 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    'Name': 'الاسم',
    'Your name': 'اسمك',
    'Your full name': 'الاسم الكامل',
    'Subject': 'الموضوع',
    'Select a subject': 'اختر الموضوع',
    'Select an option': 'اختر من القائمة',
    'Specify your subject': 'حدد موضوعك',
    'Please describe your request...': 'يرجى وصف طلبك...',
    'Message': 'الرسالة',
    'Your message': 'اكتب رسالتك هنا',
    'Tell me about the opportunity...': 'أخبرني عن الفرصة...',
    'STATUS': 'الحالة',
    'READY': 'مستعد',
    'DEPLOYED': 'تم الإرسال',
    'FAILED': 'فشل',
    'your@email.com': 'your@email.com',
    'Available For': 'متاح لـ',
    'Internships': 'فرص التدريب',
    'Cloud & DevOps programs': 'برامج Cloud وDevOps',
    'Junior DevOps Roles': 'وظائف DevOps للمبتدئين',
    'Entry-level engineering': 'وظائف هندسية للمبتدئين',
    'AWS infrastructure roles': 'وظائف البنية التحتية في AWS',
    'Cloud Engineering': 'هندسة Cloud',
    'Job Opportunity': 'فرصة عمل',
    'Internship': 'فرصة تدريب',
    'Freelance Project': 'مشروع حر',
    'Collaboration': 'تعاون',
    'Technical Question': 'سؤال تقني',
    'Other (Specify)': 'أخرى (حدد)',

    // ─── Footer ─────────────────────────────────────────────────
    'Automating Infrastructure & Building Scalable Cloud Solutions with Passion.': 'أعمل على أتمتة البنية التحتية وبناء حلول سحابية قابلة للتوسع بشغف.',
    'Available for Opportunities': 'متاح للفرص الجديدة',
    'Built with': 'تم الإنشاء بـ',
    'Designed & Built by': 'تصميم وبرمجة',
    'and': 'و',
  }
};

/**
 * Terms that must NEVER be translated — they are technical identifiers,
 * proper names, or terms that sound natural in English to Arab engineers.
 */
export const noTranslate = new Set([
  // Personal name — handled separately, never via t()
  'Abdelrahman',
  'El-bahnsy',
  'Abdelrahman El-bahnsy',
  'عبدالرحمن البهنسي',

  // Cloud / DevOps technologies
  'Azure', 'Microsoft Azure',
  'AWS', 'Amazon Web Services',
  'Cloud', 'DevOps',
  'Docker', 'Docker Compose',
  'Kubernetes', 'K8s', 'EKS', 'AKS',
  'Terraform', 'Ansible',
  'Jenkins', 'GitHub Actions',
  'CI/CD', 'IaC',
  'Prometheus', 'Grafana',
  'Linux', 'Windows', 'Windows Server',
  'CCNA', 'MCSA',
  'Routing', 'Switching', 'TCP/IP',
  'Nginx', 'PostgreSQL',
  'Vercel', 'Firebase', 'Firestore',
  'React', 'Node.js', 'Python', 'Bash',
  'Git', 'GitHub',
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'Cloud Engineer', 'DevOps Engineer',
  'VM', 'VNet', 'Active Directory',
  'Red Hat', 'SSH', 'YAML',
]);

/**
 * Translate a key into the active language.
 * - Proper nouns and technical terms are returned unchanged.
 * - Arabic dict hit → return Arabic.
 * - No dict hit → return original key (graceful English fallback).
 * - Null/undefined → return ''.
 */
export const getTranslation = (key, lang) => {
  if (key === null || key === undefined) return '';
  if (typeof key !== 'string') return String(key);
  const trimmed = key.trim();
  if (!trimmed) return key;
  if (noTranslate.has(trimmed)) return key;
  if (lang === 'ar') {
    return translations.ar[trimmed] !== undefined ? translations.ar[trimmed] : key;
  }
  return key; // English — always return as-is
};
