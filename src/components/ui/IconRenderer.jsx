import React from 'react';
import { AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// REACT ICONS REGISTRY
// Includes currently used icons (SiMicrosoftazure) and common Cloud/DevOps icons
// ─────────────────────────────────────────────────────────────────────────────
import { 
  SiMicrosoftazure, SiAzuredevops, SiAmazonaws, SiGooglecloud,
  SiDocker, SiKubernetes, SiTerraform, SiJenkins, SiGitlab,
  SiLinux, SiUbuntu, SiPython, SiGnu, SiAnsible, SiPrometheus, SiGrafana,
  SiGithub, SiReact, SiVuedotjs, SiAngular, SiNodedotjs, SiGo, SiRust
} from 'react-icons/si';

import { 
  FaGithub, FaGitAlt, FaTerminal, FaCode, FaServer, FaDatabase,
  FaCloud, FaNetworkWired, FaTools, FaLaptopCode, FaLock
} from 'react-icons/fa';

import { MdCloud, MdCloudQueue, MdSecurity, MdSpeed } from 'react-icons/md';

export const reactIconRegistry = {
  // Simple Icons (Si)
  SiMicrosoftazure, SiAzuredevops, SiAmazonaws, SiGooglecloud,
  SiDocker, SiKubernetes, SiTerraform, SiJenkins, SiGitlab,
  SiLinux, SiUbuntu, SiPython, SiGnu, SiAnsible, SiPrometheus, SiGrafana,
  SiGithub, SiReact, SiVuedotjs, SiAngular, SiNodedotjs, SiGo, SiRust,
  // FontAwesome (Fa) - React Icons versions
  FaGithub, FaGitAlt, FaTerminal, FaCode, FaServer, FaDatabase,
  FaCloud, FaNetworkWired, FaTools, FaLaptopCode, FaLock,
  // Material Design (Md)
  MdCloud, MdCloudQueue, MdSecurity, MdSpeed
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVER LOGIC
// ─────────────────────────────────────────────────────────────────────────────
export const resolveIcon = (iconStr) => {
  if (!iconStr || typeof iconStr !== 'string' || iconStr.trim() === '') {
    return { type: 'empty' };
  }
  
  const raw = iconStr.trim();
  const lower = raw.toLowerCase();

  // 1. Check React Icons Registry (case-insensitive lookup)
  const registryKey = Object.keys(reactIconRegistry).find(k => k.toLowerCase() === lower);
  if (registryKey) {
    return { type: 'react-icon', component: reactIconRegistry[registryKey], name: registryKey };
  }

  // 2. Validate Font Awesome (CSS Classes)
  // Valid styles in FontAwesome 6 Free: fas (solid), far (regular), fab (brands), fa-solid, fa-regular, fa-brands
  const faStyles = ['fas ', 'far ', 'fab ', 'fa-solid ', 'fa-regular ', 'fa-brands '];
  
  let normalizedFa = raw;
  // If starts with 'fa-' but lacks a style prefix, prepend 'fas ' (e.g. 'fa-gears' -> 'fas fa-gears')
  if (lower.startsWith('fa-') && !faStyles.some(style => lower.startsWith(style))) {
    normalizedFa = `fas ${raw}`;
  }

  // Final check if it matches a valid FA format
  if (faStyles.some(style => normalizedFa.toLowerCase().startsWith(style))) {
    return { type: 'font-awesome', class: normalizedFa };
  }

  // 3. Unrecognized
  return { type: 'invalid', raw };
};

// ─────────────────────────────────────────────────────────────────────────────
// ICON RENDERER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const IconRenderer = ({ 
  icon, 
  className = '', 
  fallbackIcon = 'fas fa-certificate',
  showErrorState = false 
}) => {
  const resolved = resolveIcon(icon);

  if (resolved.type === 'empty') {
    return <i className={`${fallbackIcon} ${className}`} title="Empty Icon (Fallback)"></i>;
  }

  if (resolved.type === 'react-icon') {
    const Component = resolved.component;
    return <Component className={className} />;
  }

  if (resolved.type === 'font-awesome') {
    return <i className={`${resolved.class} ${className}`}></i>;
  }

  // Invalid Icon State
  if (showErrorState) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-md text-xs font-mono max-w-full overflow-hidden shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Icon not found</span>
      </div>
    );
  }

  // Public Fallback for invalid icon
  return <i className={`${fallbackIcon} ${className}`} title={`Invalid icon: ${resolved.raw}`}></i>;
};
