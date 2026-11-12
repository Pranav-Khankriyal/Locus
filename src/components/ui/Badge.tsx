import type {ReactNode} from 'react';
export function Badge({children}:{children:ReactNode}){
  const text=String(children);
  const tone=/^(Verified|Active|Success|Available|success|Present|Approved|Paid|Credited|Resolved|WFH|Paid Leave)$/.test(text)
    ?'success'
    :/Pending|Maintenance|warning|partial|Late|Half Day|In Review|Processed|On Leave|Sick Leave|Casual Leave|Privilege Leave|Comp Off/.test(text)
    ?'warning'
    :/Failed|Revoked|Inactive|failed|error|Absent|Rejected|Cancelled|Unpaid Leave/.test(text)
    ?'error'
    :'neutral';
  return <span className={'badge badge-'+tone}><span className="badge-dot"/>{children}</span>;
}
