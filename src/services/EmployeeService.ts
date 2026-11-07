import type {CreateEmployeeInput,Employee,EmployeeQuery,ImportResult,ImportRow,UpdateEmployeeInput} from '@/types';
import {api,currentOrganization} from './api';
import {adaptEmployee} from './adapters';
const org=()=>{const id=currentOrganization.get();if(!id)throw new Error('Select an organisation first.');return id;};
const payload=(input:Partial<CreateEmployeeInput>, creating=false)=>{const parts=(input.name||'').trim().split(/\s+/);return { ...(creating?{organization_id:org(),employee_code:input.employeeId||`EMP-${Date.now()}`}:{ }), first_name:parts[0]||undefined,last_name:parts.slice(1).join(' ')||'Member',email:input.email,designation:input.designation,organization_unit_id:input.organisationUnitId||null,manager_employee_id:input.managerId||null,employment_status:input.status?.toLowerCase()};};
export const EmployeeService={
 async list(query:EmployeeQuery={}):Promise<Employee[]>{const params=new URLSearchParams({organization_id:org(),page_size:'100'});if(query.search)params.set('search',query.search);if(query.unitId)params.set('organization_unit_id',query.unitId);if(query.status)params.set('employment_status',query.status.toLowerCase());const data=await api.get<{items:any[]}>(`/api/v1/employees?${params}`);return data.items.map(adaptEmployee);},
 async getById(id:string){return adaptEmployee(await api.get(`/api/v1/employees/${id}`));},
 async create(input:CreateEmployeeInput){return adaptEmployee(await api.post('/api/v1/employees',payload(input,true)));},
 async update(id:string,input:UpdateEmployeeInput){return adaptEmployee(await api.patch(`/api/v1/employees/${id}`,payload(input)));},
 async delete(id:string){await api.delete(`/api/v1/employees/${id}`);},
 async import(rows:ImportRow[]):Promise<ImportResult>{const employees:Employee[]=[],errors:string[]=[];for(const row of rows){if(!row.input||row.errors.length){errors.push(`Row ${row.row}: ${row.errors.join(', ')}`);continue;}try{employees.push(await this.create(row.input));}catch(error){errors.push(`Row ${row.row}: ${(error as Error).message}`);}}return {status:employees.length?(errors.length?'partial':'success'):'failed',imported:employees.length,skipped:errors.length,employees,errors};},
};
