import type {AuditEvent,AuditQuery} from '@/types';
import {api,currentOrganization} from './api';
import {adaptAudit} from './adapters';
const org=()=>{const id=currentOrganization.get();if(!id)throw new Error('Select an organisation first.');return id;};
export const AuditService={async list(query:AuditQuery={}):Promise<AuditEvent[]>{const p=new URLSearchParams({organization_id:org(),page_size:'100'});if(query.action)p.set('action',query.action);if(query.entity)p.set('entity_type',query.entity);if(query.entityId)p.set('entity_id',query.entityId);const data=await api.get<{items:any[]}>(`/api/v1/audit-logs?${p}`);return data.items.map(adaptAudit);},async personal(employeeId:string){return this.list({entityId:employeeId});}};
