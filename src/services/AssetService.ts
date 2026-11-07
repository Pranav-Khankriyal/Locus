import type {Asset,AssetQuery,CreateAssetInput} from '@/types';
import {api,currentOrganization} from './api';
import {adaptAsset,adaptCategory,adaptTransaction} from './adapters';
const org=()=>{const id=currentOrganization.get();if(!id)throw new Error('Select an organisation first.');return id;};
const payload=(input:Partial<CreateAssetInput>)=>({asset_category_id:input.category,asset_code:(input as any).assetId||`AST-${Date.now()}`,name:input.name,description:input.subCategory||undefined,serial_number:input.serialNumber||undefined,location:input.locationId||undefined,metadata:{condition:input.condition,expires_at:input.expiresAt}});
export const AssetService={
 async list(query:AssetQuery={}):Promise<Asset[]>{const p=new URLSearchParams({organization_id:org(),page_size:'100'});if(query.search)p.set('search',query.search);if(query.status)p.set('status',query.status.toUpperCase().replace(/ /g,'_'));if(query.category)p.set('category_id',query.category);const data=await api.get<{items:any[]}>(`/api/v1/assets?${p}`);return data.items.map(adaptAsset);},
 async getById(id:string){return adaptAsset(await api.get(`/api/v1/assets/${id}`));},
 async categories(_query:{type?:string}={}){const data=await api.get<{items:any[]}>(`/api/v1/asset-categories?organization_id=${org()}`);return data.items.map(adaptCategory);},
 async create(input:CreateAssetInput){return adaptAsset(await api.post(`/api/v1/assets?organization_id=${org()}`,payload(input)));},
 async update(id:string,input:Partial<CreateAssetInput>){return adaptAsset(await api.patch(`/api/v1/assets/${id}`,payload(input)));},
 async assign(id:string,employeeId:string,reason:string,_expected:string|null=null){return adaptTransaction(await api.post(`/api/v1/assets/${id}/assign`,{employee_id:employeeId,notes:reason}));},
 async return(id:string,_expected:string){const transaction=await api.post<any>(`/api/v1/assets/${id}/return`,{});return String(transaction.id);},
 async history(id:string){const data=await api.get<{items:any[]}>(`/api/v1/assets/${id}/transactions?page_size=100`);return data.items.map(adaptTransaction);},
 async verify(id:string){const result=await api.get<any>(`/api/v1/blockchain/assets/${id}/verify`);const asset=await this.getById(id);asset.blockchainStatus=result.blockchain_verified?'Verified':'Pending';return asset;},
};
