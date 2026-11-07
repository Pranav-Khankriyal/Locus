import type { ImportRow, CreateEmployeeInput } from '@/types';
import { delay } from '@/utils/helpers';

export function parseCsv(text:string):string[][]{
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell!=='')throw new Error('Unexpected quote in CSV field.');else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('CSV has an unclosed quoted field.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}

export const EmployeeImportService={
 async parse(file:File):Promise<ImportRow[]>{
   await delay();
   if(file.size>5*1024*1024)throw new Error('Choose a file smaller than 5 MB.');
   const extension=file.name.split('.').pop()?.toLowerCase();let rows:string[][];
   if(extension==='csv')rows=parseCsv((await file.text()).replace(/^\uFEFF/,''));
   else if(extension==='xlsx'){
     const {default:readXlsxFile}=await import('read-excel-file/browser');
     const sheets=await readXlsxFile(file);
     rows=sheets[0].data.map(row=>row.map(v=>String(v??'')));
   }
   else throw new Error('Choose a .csv or .xlsx file.');
   return this.validate(rows);
 },
 async validate(rows:string[][]):Promise<ImportRow[]>{
   await delay();
   if(rows.length<2)throw new Error('The file needs a header and at least one employee row.');
   if(rows.length>1001)throw new Error('Import up to 1,000 employees at a time.');
   const headers=rows[0].map(v=>v.trim());
   const required=['name','email','designation','organisationUnitId'];
   for(const key of required)if(!headers.includes(key))throw new Error('Missing column: '+key+'.');
   if(new Set(headers).size!==headers.length)throw new Error('The file contains duplicate column headers.');
   
   return rows.slice(1).filter(r=>r.some(v=>v.trim())).map((r,index)=>{
     const values=Object.fromEntries(headers.map((h,i)=>[h,r[i]??'']));
     const errors:string[]=[],warnings:string[]=[];
     required.forEach(k=>{if(!values[k]?.trim())errors.push(k+': required');});
     if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email||''))errors.push('email: invalid address');
     
     const role=values.role||'employee',status=values.status||'Active',identityStatus=values.identityStatus||'Pending';
     if(!['Active','Inactive'].includes(status))errors.push('status: use Active or Inactive');
     if(!['Verified','Pending','Revoked'].includes(identityStatus))errors.push('identityStatus: invalid status');
     
     if(!values.role)warnings.push('Role defaults to Employee.');
     if(!values.managerId)warnings.push('No reporting manager specified.');
     if(!values.identityStatus)warnings.push('Identity status defaults to Pending.');
     
     const input={
       name:values.name,
       email:values.email,
       designation:values.designation,
       organisationUnitId:values.organisationUnitId,
       managerId:values.managerId||null,
       role,
       status,
       identityStatus,
       ...(values.employeeId?{employeeId:values.employeeId}:{})
     } as CreateEmployeeInput;
     
     return {row:index+2,values,input,errors,warnings};
   });
 },
};
