'use client';

import { useParams } from 'next/navigation';
import { AssignHomework } from '@/components/modules/AssignHomework';
import { ScanAndMarkWrapper } from '@/components/modules/Scan_and_mark/ScanAndMarkWrapper';
import { CalendarModule } from '@/components/modules/Calendar';
import { HomeworkList } from '@/components/modules/HomeworkList';

const MODULE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'assign-homework': AssignHomework,
  'scan-homework': ScanAndMarkWrapper,
  'calendar': CalendarModule,
  'homework-list': HomeworkList,
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
