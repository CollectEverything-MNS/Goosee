'use client';

import { AVAILABLE_TEMPLATES } from './data/drive-template';
import { TemplateCard } from './components/template-card';

export function Templates() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {AVAILABLE_TEMPLATES.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
