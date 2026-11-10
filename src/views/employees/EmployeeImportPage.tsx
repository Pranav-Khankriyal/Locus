import {Link} from 'react-router-dom';
import {PageHeading} from '@/components/ui/Page';
import {EmployeeImport} from '@/components/employees/EmployeeImport';
export default function EmployeeImportPage(){return <><PageHeading title="Import employees" actions={<Link to="/employees" className="btn btn-outline">Back to employees</Link>}/><EmployeeImport/></>;}

