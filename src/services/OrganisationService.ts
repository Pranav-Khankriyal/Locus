import type {UnitInput} from '@/types';
import {api,currentOrganization} from './api';
import {adaptUnit} from './adapters';
const org=()=>{const id=currentOrganization.get();if(!id)throw new Error('Select an organisation first.');return id;};
const payload=(input:Partial<UnitInput>)=>({organization_id:org(),name:input.name,unit_type:input.type,parent_unit_id:input.parentId||null});
export const OrganisationService={
 async list(query:{search?:string}={}){const data=await api.get<any[]>(`/api/v1/organization-units?organization_id=${org()}`);return data.map(adaptUnit).filter(x=>!query.search||x.name.toLowerCase().includes(query.search.toLowerCase()));},
 async getById(id:string){return adaptUnit(await api.get(`/api/v1/organization-units/${id}`));},
 async create(input:UnitInput){return adaptUnit(await api.post('/api/v1/organization-units',payload(input)));},
 async update(id:string,input:UnitInput){return adaptUnit(await api.patch(`/api/v1/organization-units/${id}`,payload(input)));},
 async delete(id:string){await api.delete(`/api/v1/organization-units/${id}`);},
 async getTree(){return (await api.get<any[]>(`/api/v1/organization-units/tree?organization_id=${org()}`)).map(adaptUnit);},
};
