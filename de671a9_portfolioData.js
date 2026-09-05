/**
 * Portfolio content — edit this file to customize your site.
 * Changes hot-reload automatically in the Vite dev server.
 */

export const personalInfo = {
  firstName: 'Abdelrahman ',
  lastName: 'El-bahnsy',
  fullName: 'Abdelrahman El-bahnsy',
  firstNameAr: 'عبدالرحمن',
  lastNameAr: 'البهنسي',
  fullNameAr: 'عبدالرحمن البهنسي',
  title: 'Cloud & DevOps Engineer',
  titleAr: 'مهندس Cloud وDevOps',
  badge: 'Cloud & DevOps Engineer',
  badgeAr: 'مهندس Cloud وDevOps',
  roles: ['Cloud Engineer', 'DevOps Engineer', 'Azure & Kubernetes', 'CI/CD Automation'],
  rolesAr: ['مهندس Cloud', 'مهندس DevOps', 'Azure و Kubernetes', 'أتمتة CI/CD'],
  description:
    'Specializing in designing and scaling high-availability cloud infrastructure. I bridge the gap between legacy networking and modern DevOps through Azure, Kubernetes, and IaC. Passionate about building resilient, automated systems that turn complex technical challenges into seamless business innovation.',
  descriptionAr: 'متخصص في تصميم وتوسيع البنية التحتية السحابية عالية التوافر، مع خبرة في ربط الشبكات التقليدية بممارسات DevOps الحديثة باستخدام Azure وKubernetes وIaC. أسعى إلى بناء أنظمة مؤتمتة وقابلة للتوسع وتحويل التحديات التقنية المعقدة إلى حلول عملية وموثوقة.',
  portrait: '/assets/abdelrahman.jpeg',
  cvUrl: 'https://drive.google.com/file/d/1fYl9kYJHw_CnOjCuDAvXe2yXXa4mCWGD/view?usp=drive_link',
  footerTagline: 'Automating Infrastructure & Building Scalable Cloud Solutions with Passion.',
  footerTaglineAr: 'أعمل على أتمتة البنية التحتية وبناء حلول سحابية قابلة للتوسع بشغف.',
  availabilityStatus: 'Available for Opportunities',
  availabilityStatusAr: 'متاح للفرص الجديدة',
  copyrightYear: 2026,
  terminalTitle: '~/Abdelrahman El-bahnsy — devops-bash',
};

export const heroTechSlider = [
  { icon: 'SiMicrosoftazure', label: 'Azure (Cloud)' },
  { icon: 'fab fa-docker', label: 'Kubernetes' },
  { icon: 'fas fa-rocket', label: 'CI/CD' },
  { icon: 'fas fa-code', label: 'Terraform' },
  { icon: 'fab fa-linux', label: 'Linux Admin' },
  { icon: 'fas fa-network-wired', label: 'Networking' },
];

export const about = {
  subtitle: 'Discovery',
  subtitleAr: 'استكشاف',
  title: 'Beyond the Console',
  titleAr: 'أبعد من مجرد شاشة أوامر',
  lead: 'From Enterprise Networking to Cloud Engineering.',
  leadAr: 'من شبكات المؤسسات إلى هندسة الحوسبة السحابية.',
  paragraphs: [
    {
      text: "I'm ",
      highlight: "Abdelrahman El-bahnsy",
      suffix: ", a Computer Science graduate from the Faculty of Computers and Information, Mansoura University, specializing in Cloud & DevOps Engineering."
    },
    {
      text: "My professional journey began with ",
      highlight: "Enterprise Networking",
      suffix: ", building a strong foundation in network architecture, infrastructure, and troubleshooting. I then expanded into Linux & Windows System Administration, gaining hands-on experience in enterprise systems, server management, virtualization, and infrastructure."
    },
    {
      text: "Currently, I leverage ",
      highlight: "Microsoft Azure, Docker, Kubernetes, Terraform, and Ansible",
      suffix: " to implement robust CI/CD pipelines and Infrastructure as Code (IaC). I monitor and optimize these environments using Prometheus and Grafana, while delivering secure, scalable, and reliable cloud-native solutions."
    }
  ],
  paragraphsAr: [
    {
      text: "أنا ",
      highlight: "عبدالرحمن البهنسي",
      suffix: "، خريج كلية الحاسبات والمعلومات بجامعة المنصورة، متخصص في هندسة Cloud و DevOps."
    },
    {
      text: "بدأت رحلتي المهنية في مجال ",
      highlight: "شبكات المؤسسات",
      suffix: "، حيث قمت ببناء أساس قوي في هندسة الشبكات والبنية التحتية وحل المشكلات. توسعت بعد ذلك في إدارة أنظمة Linux و Windows Server، مكتسباً خبرة عملية في أنظمة المؤسسات، إدارة الخوادم، البيئات الافتراضية، والبنية التحتية."
    },
    {
      text: "أعتمد حاليًا على ",
      highlight: "Microsoft Azure وDocker وKubernetes وTerraform وAnsible",
      suffix: " لبناء مسارات CI/CD قوية والبنية التحتية ككود (IaC)، مع استخدام Prometheus وGrafana للمراقبة وتحسين أداء البيئات السحابية."
    }
  ],
  badges: [
    { icon: 'fas fa-shield-alt', label: 'Networking Mindset' },
    { icon: 'fas fa-bolt', label: 'Problem Solver' },
    { icon: 'fas fa-microchip', label: 'Cloud Infrastructure' },
  ],
  terminalItems: [
    { key: 'role', value: 'DevOps & Cloud Engineer' },
    { key: 'cloud', value: 'Azure Administration,Aws ' },
    { key: 'containers', value: 'Docker, Kubernetes (EKS/AKS)' },
    { key: 'iac', value: 'Terraform, Ansible' },
    { key: 'cicd', value: 'Jenkins, GitHub Actions' },
    { key: 'monitoring', value: 'Prometheus, Grafana' },
    { key: 'os', value: 'Linux (Admin), Windows Server' },
    { key: 'networking', value: 'CCNA, Routing, Switching' },
    { key: 'status', value: 'Available for New Challenges' },
  ],
};

export const skills = {
  subtitle: 'Expertise',
  subtitleAr: 'خبرات',
  title: 'Skills & Technologies',
  titleAr: 'المهارات والتقنيات',
  description: 'A comprehensive toolkit for building and managing modern cloud infrastructure.',
  descriptionAr: 'مجموعة أدوات شاملة لبناء وإدارة البنية التحتية السحابية الحديثة.',
  circularSkills: [
    { icon: 'SiMicrosoftazure', percent: 90, label: 'Cloud', sub: 'Azure Expert' },
    { icon: 'fab fa-docker', percent: 88, label: 'Containers', sub: 'Docker + K8s' },
    { icon: 'fas fa-infinity', percent: 92, label: 'CI/CD', sub: 'Pipelines' },
    { icon: 'fas fa-code-branch', percent: 85, label: 'IaC', sub: 'Terraform' },
    { icon: 'fas fa-network-wired', percent: 80, label: 'Networking', sub: 'CCNA ' },
  ],
  categories: [
    {
      title: 'Cloud Platform',
      titleAr: 'منصة Cloud',
      icon: 'SiMicrosoftazure',
      skills: [
        { name: 'VM & VNet', nameAr: 'VM وVNet', percent: 90 },
        { name: 'Microsoft Entra ID & Security', nameAr: 'Microsoft Entra ID والأمان', percent: 85 },
        { name: 'Storage Account', nameAr: 'Storage Account', percent: 88 },
        { name: 'Load Balancer', nameAr: 'Load Balancer', percent: 82 },
      ],
    },
    {
      title: 'DevOps & CI/CD',
      titleAr: 'DevOps وCI/CD',
      icon: 'fas fa-infinity',
      skills: [
        { name: 'Jenkins', nameAr: 'Jenkins', percent: 88 },
        { name: 'GitHub Actions', nameAr: 'GitHub Actions', percent: 85 },
        { name: 'CI/CD Pipelines', nameAr: 'مسارات CI/CD', percent: 90 },
        { name: 'Automation', nameAr: 'الأتمتة', percent: 87 },
      ],
    },
    {
      title: 'Containers & Orchestration',
      titleAr: 'إدارة وتنسيق الحاويات',
      icon: 'fab fa-docker',
      skills: [
        { name: 'Docker', nameAr: 'Docker', percent: 92 },
        { name: 'Docker Compose', nameAr: 'Docker Compose', percent: 88 },
        { name: 'Kubernetes', nameAr: 'Kubernetes', percent: 85 },
        { name: 'Container Security', nameAr: 'أمان الحاويات', percent: 80 },
      ],
    },
    {
      title: 'Infrastructure as Code',
      titleAr: 'Infrastructure as Code (IaC)',
      icon: 'fas fa-code-branch',
      skills: [
        { name: 'Terraform', nameAr: 'Terraform', percent: 87 },
        { name: 'Infrastructure Automation', nameAr: 'أتمتة البنية التحتية', percent: 85 },
        { name: 'Provisioning', nameAr: 'التجهيز التلقائي', percent: 83 },
      ],
    },
    {
      title: 'Networking',
      titleAr: 'الشبكات',
      icon: 'fas fa-network-wired',
      skills: [
        { name: 'Routing & Switching', nameAr: 'التوجيه والتبديل', percent: 92 },
        { name: 'TCP/IP', nameAr: 'TCP/IP', percent: 90 },
        { name: 'Network Security', nameAr: 'أمان الشبكات', percent: 85 },
        { name: 'Load Balancing', nameAr: 'توزيع الأحمال', percent: 84 },
      ],
    },
    {
      title: 'Programming & Scripting',
      titleAr: 'البرمجة والسكربتات',
      icon: 'fas fa-terminal',
      skills: [
        { name: 'Python', nameAr: 'Python', percent: 85 },
        { name: 'Bash', nameAr: 'Bash', percent: 82 },
        { name: 'Shell Scripting', nameAr: 'Shell Scripting', percent: 80 },
      ],
    },
    {
      title: 'Operating Systems',
      titleAr: 'أنظمة التشغيل',
      icon: 'fab fa-linux',
      skills: [
        { name: 'Linux Administration', nameAr: 'إدارة Linux', percent: 92 },
        { name: 'Windows Server', nameAr: 'Windows Server', percent: 85 },
        { name: 'System Hardening', nameAr: 'تأمين الأنظمة', percent: 83 },
        { name: 'Process Management', nameAr: 'إدارة العمليات', percent: 86 },
      ],
    },
    {
      title: 'Monitoring & Observability',
      titleAr: 'المراقبة والرصد',
      icon: 'fas fa-chart-line',
      skills: [
        { name: 'Prometheus', nameAr: 'Prometheus', percent: 88 },
        { name: 'Grafana', nameAr: 'Grafana', percent: 87 },
        { name: 'Logging (ELK / Loki)', nameAr: 'التسجيل (ELK / Loki)', percent: 85 },
        { name: 'Metrics & Alerting', nameAr: 'المقاييس والتنبيهات', percent: 86 },
      ],
    },
  ],
};

export const projects = [
  
  {
    id: 1,
    title: 'DEPI-Smart-inventory-main',
    desc: 'Designed and deployed a production-style cloud-native Smart Inventory Platform featuring a modern frontend, backend, and PostgreSQL database. Engineered for high availability on Microsoft Azure using Terraform (IaC) and Ansible for automated infrastructure provisioning and configuration management. Containerized with Docker, orchestrated by Kubernetes (K8s), and secured with Nginx for efficient traffic routing. Implemented a fully automated CI/CD pipeline with comprehensive monitoring and observability powered by Prometheus and Grafana, ensuring scalable, resilient, and reliable application delivery..',
    titleAr: 'DEPI-Smart-inventory-main',
    descAr: 'تصميم ونشر منصة إدارة مخزون ذكية سحابية بمستوى الإنتاج تحتوي على واجهة أمامية، وخلفية، وقاعدة بيانات PostgreSQL. صُممت لتحقيق التوافر العالي على Microsoft Azure باستخدام Terraform (IaC) و Ansible لأتمتة البنية التحتية. تم استخدام Docker و Kubernetes (K8s) لإدارة الحاويات وتنسيقها، وتم تأمينها باستخدام Nginx. تم تنفيذ مسار CI/CD آلي بالكامل مع مراقبة شاملة باستخدام Prometheus و Grafana لضمان تسليم تطبيق قابل للتطوير ومرن وموثوق.',
    image: '/assets/projects/smart_inventory_devops.png',
    tags: ['Docker', 'Jenkins', 'Azure','k8s','terraform','Ansible','Nginx','Prometheus','Grafana'],
    repo: 'https://github.com/AbdelrahmanElbahnsy/DEPI-Smart-inventory-main',
  },
  {
    id: 2,
    title: 'Machine Learning Prediction Suite',
    desc: 'Designed and developed a comprehensive Machine Learning platform integrating four real-world predictive models across both classification and regression tasks. The project covers data preprocessing, feature engineering, model training, evaluation, and deployment through an interactive Gradio web interface. It demonstrates practical applications of Decision Trees, K-Nearest Neighbors (KNN), Naive Bayes, and Polynomial Regression for solving diverse business and healthcare prediction problems.',
    titleAr: 'مجموعة توقعات التعلم الآلي',
    descAr: 'تصميم وتطوير منصة شاملة للتعلم الآلي تدمج أربعة نماذج توقع حقيقية لمهام التصنيف والانحدار. يغطي المشروع معالجة البيانات، هندسة الميزات، تدريب النماذج، تقييمها ونشرها من خلال واجهة ويب Gradio التفاعلية. يوضح التطبيقات العملية لـ Decision Trees، و KNN، و Naive Bayes، و Polynomial Regression لحل مشاكل التوقع المتنوعة في الأعمال والرعاية الصحية.',
    image: '/assets/projects/intelligent-traffic-dashboard.png',
    tags: ['Python', 'Scikit-learn', 'Decision Tree','KNN','Naive Bayes','Polynomial Regression'],
    repo: 'https://github.com/AbdelrahmanElbahnsy/Machine-Learning-MultiTask',
  },
  {
    id: 3,
    title: 'My First Portfolio Website',
    desc: 'My first personal portfolio website, built to showcase my skills, certifications, and projects through a clean, responsive, and modern interface. This project marked the beginning of my frontend development journey and laid the foundation for my current portfolio, with a strong focus on responsive design, user experience, and professional presentation..',
    titleAr: 'أول موقع سيرة ذاتية لي',
    descAr: 'أول موقع سيرة ذاتية شخصي لي، تم بناؤه لعرض مهاراتي وشهاداتي ومشروعاتي من خلال واجهة نظيفة، متجاوبة، وحديثة. هذا المشروع كان بداية رحلتي في تطوير الواجهات الأمامية (Frontend) ووضع الأساس لموقعي الحالي، مع التركيز الشديد على التصميم المتجاوب وتجربة المستخدم.',
    image: '/assets/projects/cicd_pipeline.png',
    tags: ['HTML5', 'CSS3', 'JavaScript (ES6)','Vercel','Git','GitHub'],
    repo: 'https://github.com/AbdelrahmanElbahnsy/portfolio-Abdelrahman',
  },
  {
    id: 4,
    title: 'Smart-Inventory',
    desc: 'An End-to-End DevOps project featuring a smart inventory management system; bridging microservices development and database management with automated cloud infrastructure provisioning via Terraform and Ansible, finalized through a complete CI/CD deployment pipeline..',
    titleAr: 'المخزون الذكي',
    descAr: 'مشروع DevOps متكامل يتميز بنظام إدارة مخزون ذكي؛ يربط تطوير الخدمات المصغرة (Microservices) وإدارة قواعد البيانات مع التوفير التلقائي للبنية التحتية السحابية عبر Terraform و Ansible، مختتماً بمسار النشر CI/CD متكامل.',
    image: '/assets/projects/serverless_api.png',
    tags: ['Azure', 'Terraform', 'Ansible','Docker','Jenkins','Kubernetes','Nginx','FastAPI','PostgreSQL'],
    repo: 'https://github.com/AbdelrahmanElbahnsy/Smart-Inventory',
  },
];

export const journey = {
  subtitle: 'Roadmap',
  subtitleAr: 'خريطة الطريق',
  title: 'DevOps Engineering Journey',
  titleAr: 'رحلتي في هندسة DevOps',
  description: 'Tracing the evolution from network packets to automated cloud ecosystems.',
  descriptionAr: 'تتبع التطور من حزم الشبكات إلى بيئات السحابة المؤتمتة.',
  phases: [
    {
      phase: '01',
      title: 'Networking foundations',
      titleAr: 'أساسيات الشبكات',
      description:
        'Routing, Switching, TCP/IP, and network design foundations built through CCNA-level networking.',
      descriptionAr: 'أساسيات التوجيه (Routing)، التبديل (Switching)، بروتوكول TCP/IP، وتصميم الشبكات تم بناؤها من خلال دراسة مستوى CCNA.',
      tags: ['Routing', 'Switching', 'TCP/IP', 'Network Design', 'CCNA'],
    },
    {
      phase: '02',
      title: 'System Administration',
      titleAr: 'إدارة الأنظمة',
      description:
        'Managing Linux and Windows Server environments, Active Directory, and core system services.',
      descriptionAr: 'إدارة بيئات Linux و Windows Server، و Active Directory، وخدمات النظام الأساسية.',
      tags: ['Linux', 'Windows Server', 'Active Directory', 'System Admin'],
    },
    {
      phase: '03',
      title: 'Cloud Engineering',
      titleAr: 'هندسة Cloud',
      description:
        'Designing and deploying cloud infrastructure on Azure using VM, Storage Account, Microsoft Entra ID, and Microsoft Entra ID.',
      descriptionAr: 'تصميم ونشر البنية التحتية السحابية على Azure باستخدام الأجهزة الافتراضية (VM)، مساحات التخزين، و Microsoft Entra ID.',
      tags: ['Azure', 'VM' ,'Storage Account','Microsoft Entra ID', 'VNet'],
    },
    {
      phase: '04',
      title: 'DevOps Foundations',
      titleAr: 'أساسيات DevOps',
      description:
        'Building CI/CD pipelines, containerizing applications with Docker, and automating delivery.',
      descriptionAr: 'بناء مسارات CI/CD، تعبئة التطبيقات (Containerizing) باستخدام Docker، وأتمتة التسليم.',
      tags: ['Docker', 'Containers', 'CI/CD', 'Jenkins', 'GitHub Actions'],
    },
    {
      phase: '05',
      title: 'Infrastructure as Code (IaC)',
      titleAr: 'البنية التحتية باستخدام الكود (IaC)',
      description:
        'Automating infrastructure provisioning with Terraform to build scalable, repeatable environments.',
      descriptionAr: 'أتمتة تجهيز البنية التحتية باستخدام Terraform لبناء بيئات قابلة للتوسع والتكرار.',
      tags: ['Terraform', 'IaC', 'Automation', 'Scalability'],
    },
    {
      phase: '06',
      title: 'Kubernetes & Observability',
      titleAr: 'Kubernetes وObservability',
      description:
        'Running workloads on Kubernetes with full observability using Prometheus, Grafana, and logging.',
      descriptionAr: 'تشغيل الأحمال على Kubernetes مع قابلية الرصد الكاملة باستخدام Prometheus، و Grafana، والتسجيل (Logging).',
      tags: ['Kubernetes', 'Prometheus', 'Grafana', 'Logging', 'Monitoring'],
    },
  ],
};

export const certifications = [
  {
    title: 'CCNA (Routing & Switching)',
    issuer: 'Instructor: Walid Saad El Din',
    icon: 'fas fa-network-wired',
    link: 'https://driveiew?usp=sharing',
  },
  {
    title: 'Aws Cloud Architect',
    issuer: 'NTI & ITIDA',
    icon: 'fas fa-cloud',
    link: 'https://drive.google.com/file/d/1vk71z2Nl3mlMJbEX4HjT87eb3NzbBNCC/view?usp=drive_link',
  },
  {
    title: 'Red Hat System Administration',
    issuer: 'ITI & Mahara-Tech',
    icon: 'fab fa-redhat',
    link: 'https://drive.google.com/file/d/1-SEl_MdCC-phWbBFFmqt8Bvq3xlzgGmA/view?usp=sharing',
  },
  {
    title: 'Azure Fundamentals & Azure Administrator',
    issuer: 'Instructor: Mohamed Zehdy',
    icon: 'SiMicrosoftazure',
    link: 'https://drive.google.com/drive/folders/1cwOM-hoj2byAjnwwoek2GDtFCKjSIZHl?usp=drive_link',
  },
  {
    title: 'MCSA',
    issuer: 'Instructor: Mohamed Zehdy',
    icon: 'fas fa-laptop-code',
    link: 'https://drive.google.com/file/d/1O4JOybjdNythl5QQkdeyazQORHFq98xX/view?usp=drive_link',
  },
];

export const toolchain = {
  row1: [
    { name: 'Azure', icon: 'fab fa-Azure' },
    { name: 'Docker', icon: 'fab fa-docker' },
    { name: 'Kubernetes', icon: 'fas fa-dharmachakra' },
    { name: 'Terraform', icon: 'fas fa-code-branch' },
    { name: 'Jenkins', icon: 'fab fa-jenkins' },
    { name: 'GitHub Actions', icon: 'fab fa-github' },
    { name: 'Linux', icon: 'fab fa-linux' },
    { name: 'Python', icon: 'fab fa-python' },
  ],
  row2: [
    { name: 'Bash', icon: 'fas fa-terminal' },
    { name: 'Prometheus', icon: 'fas fa-chart-line' },
    { name: 'Grafana', icon: 'fas fa-chart-pie' },
    { name: 'Git', icon: 'fab fa-git-alt' },
    { name: 'Nginx', icon: 'fas fa-server' },
    { name: 'YAML', icon: 'fas fa-file-code' },
    { name: 'VS Code', icon: 'fas fa-code' },
    { name: 'SSH', icon: 'fas fa-terminal' },
  ],
};

export const contact = {
  subtitle: 'Get In Touch',
  title: 'Deployment Request',
  channels: [
    {
      icon: 'fas fa-envelope',
      label: 'Email',
      value: 'abdelrahmanelbahnsy3@gmail.com',
      link: 'abdelrahmanelbahnsy3@gmail.com',
    },
    {
      icon: 'fas fa-phone',
      label: 'Phone',
      value: '01028977915',
      link: 'tel:01028977915',
    },
    {
      icon: 'fab fa-github',
      label: 'GitHub',
      value: 'https://github.com/AbdelrahmanElbahnsy',
      link: 'https://github.com/AbdelrahmanElbahnsy',
    },
    {
      icon: 'fab fa-linkedin',
      label: 'LinkedIn',
      value: 'LinkedIn Profile',
      link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfPxex%2FALS7qj1yrt9OK5kw%3D%3D',
    },
    {
      icon: 'fas fa-map-marker-alt',
      label: 'Location',
      value: 'Mansoura, Egypt',
      link: null,
    },
  ],
  formSubjects: ['Job Opportunity', 'Internship', 'Freelance Project', 'Collaboration', 'Technical Question', 'Other (Specify)'],
  opportunities: [
    { icon: 'fas fa-graduation-cap', title: 'Internships', desc: 'Cloud & DevOps programs' },
    { icon: 'fas fa-user-gear', title: 'Junior DevOps Roles', desc: 'Entry-level engineering' },
    { icon: 'SiMicrosoftazure', title: 'Cloud Engineering', desc: 'AWS infrastructure roles' },
  ],
  emailjs: {
    SERVICE_ID: 'service_1usyuli',
    TEMPLATE_ID: 'template_wsel53o',
    PUBLIC_KEY: 'YIdyZMhc7wuVseZat',
  },
};

export const socialLinks = {
  floating: [
    { icon: 'fab fa-linkedin-in', link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfPxex%2FALS7qj1yrt9OK5kw%3D%3D', label: 'LinkedIn' },
    { icon: 'fab fa-github', link: 'https://github.com/AbdelrahmanElbahnsy', label: 'GitHub' },
    { icon: 'fab fa-whatsapp', link: 'https://wa.me/201028977915?text=Hi%20Abdelrahman,%20I%20visited%20your%20portfolio%20and%20I%27d%20like%20to%20discuss%20an%20opportunity.', label: 'WhatsApp' },
    { icon: 'fab fa-telegram', link: 'https://t.me/abdelrahmanelbahnsy', label: 'Telegram' },  ],
  airplane: [
    {
      href: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfPxex%2FALS7qj1yrt9OK5kw%3D%3D',
      icon: 'fab fa-linkedin-in',
      label: 'LinkedIn',
      color: '#0077b5',
    },
    {
      href: 'https://github.com/AbdelrahmanElbahnsy',
      icon: 'fab fa-github',
      label: 'GitHub',
      color: '#171515',
    },
    { href: 'https://wa.me/201028977915?text=Hi%20Abdelrahman,%20I%20visited%20your%20portfolio%20and%20I%27d%20like%20to%20discuss%20an%20opportunity.', icon: 'fab fa-whatsapp', label: 'WhatsApp', color: '#25D366' },
    { href: 'https://t.me/abdelrahmanelbahnsy', icon: 'fab fa-telegram', label: 'Telegram', color: '#229ED9' },
    { href: 'mailto:abdelrahmanelbahnsy3@gmail.com', icon: 'fas fa-envelope', label: 'Email', color: '#EA4335' },
  ],
  footer: [
    {
      link: 'https://www.facebook.com/share/1EceFwbfxz/',
      icon: 'fab fa-facebook',
      title: 'Facebook',
    },
    {
      link: 'https://www.instagram.com/abdelrahnanelbahnsy?igsh=MWRrZnR2eWtqazdsYw==',
      icon: 'fab fa-instagram',
      title: 'Instagram',
    },
    { link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BWRQOiB%2BJR6e7qIn0hMAXUA%3D%3D', icon: 'fab fa-linkedin', title: 'LinkedIn' },
    { link: 'https://github.com/AbdelrahmanElbahnsy', icon: 'fab fa-github', title: 'GitHub' },
    { link: 'https://wa.me/201028977915?text=Hi%20Abdelrahman,%20I%20visited%20your%20portfolio%20and%20I%27d%20like%20to%20discuss%20an%20opportunity.', icon: 'fab fa-whatsapp', title: 'WhatsApp' },
    { link: 'https://t.me/abdelrahmanelbahnsy', icon: 'fab fa-telegram', title: 'Telegram' },  ],
  navbarMobile: [
    { link: 'https://github.com/AbdelrahmanElbahnsy', icon: 'fab fa-github' },
    { link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BWRQOiB%2BJR6e7qIn0hMAXUA%3D%3D', icon: 'fab fa-linkedin' },
    { link: 'https://t.me/abdelrahmanelbahnsy', icon: 'fab fa-telegram' },
  ],
};
