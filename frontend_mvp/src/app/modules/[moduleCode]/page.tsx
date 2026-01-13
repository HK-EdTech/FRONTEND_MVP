'use client';

import { useParams } from 'next/navigation';
import { AssignHomework } from '@/components/modules/AssignHomework';
import { ScanHomework } from '@/components/modules/ScanHomework/ScanHomework';
import { CalendarModule } from '@/components/modules/Calendar';

const MODULE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'assign-homework': AssignHomework,
  'scan-homework': ScanHomework,
  'calendar': CalendarModule,
};

export default function ModulePage() {
  const params = useParams();
  const moduleCode = params.moduleCode as string;
  const ModuleComponent = MODULE_COMPONENTS[moduleCode];

  if (!ModuleComponent) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">Module Not Found</h1>
        <p className="text-gray-600 mt-2">
          The module "{moduleCode}" does not exist or is not yet implemented.
        </p>
      </div>
    );
  }

  return <ModuleComponent />;
}
