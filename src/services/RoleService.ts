import type {Role} from '@/types';
import {api,currentOrganization} from './api';
import {adaptRole} from './adapters';
const org=()=>{const id=currentOrganization.get();if(!id)throw new Error('Select an organisation first.');return id;};
export const RoleService={
 async list(query:{search?:string}={}){const data=await api.get<{items:any[]}>(`/api/v1/roles?organization_id=${org()}`);return data.items.map(adaptRole).filter(x=>!query.search||x.name.toLowerCase().includes(query.search.toLowerCase()));},
 async getById(id:string){return adaptRole(await api.get(`/api/v1/roles/${id}`));},
 async save(input:Omit<Role,'id'|'isSystem'>,id?:string){const p={name:input.name,description:input.description};return adaptRole(id?await api.patch(`/api/v1/roles/${id}`,p):await api.post(`/api/v1/roles?organization_id=${org()}`,p));},
 async delete(id:string){await api.delete(`/api/v1/roles/${id}`);},
 async assign(roleId:string,userId:string){await api.post(`/api/v1/users/${userId}/roles`,{role_id:roleId});},
 async revoke(roleId:string,userId:string){await api.delete(`/api/v1/users/${userId}/roles/${roleId}`);},
};
