import {EmployeeService} from './EmployeeService';
import {AssetService} from './AssetService';
import {OrganisationService} from './OrganisationService';
import {RoleService} from './RoleService';
export const ReferenceService={async list(){const [employees,units,roles,categories]=await Promise.all([EmployeeService.list(),OrganisationService.list(),RoleService.list(),AssetService.categories()]);return {employees,units,roles:roles.map(r=>({id:r.id,name:r.name})),categories};}};
