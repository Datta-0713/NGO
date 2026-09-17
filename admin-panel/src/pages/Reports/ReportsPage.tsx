import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleOff } from 'lucide-react';
import { reportsApi, ReportRecord, ReportStatus } from '@/api/reportsApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { safeFormat } from '@/utils/date';

const STATUSES: Array<{label:string;value:''|ReportStatus}> = [
  {label:'Open',value:'open'},{label:'Reviewed',value:'reviewed'},{label:'Dismissed',value:'dismissed'},{label:'Actioned',value:'actioned'}
];

const ReportsPage: React.FC = () => {
  const [status,setStatus]=useState<''|ReportStatus>('open'); const [page,setPage]=useState(1); const [items,setItems]=useState<ReportRecord[]>([]); const [total,setTotal]=useState(0); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [selected,setSelected]=useState<ReportRecord|null>(null); const [resolution,setResolution]=useState(''); const [saving,setSaving]=useState(false); const limit=15;
  const load=async()=>{setLoading(true);setError('');try{const data=await reportsApi.getReports({page,limit,status:status||undefined});setItems(data.reports||[]);setTotal(data.total||0);}catch(e:any){setError(e?.response?.data?.message||'Failed to load reports');}finally{setLoading(false);}};
  useEffect(()=>{void load();},[page,status]);
  const resolve=async(next:Exclude<ReportStatus,'open'>)=>{if(!selected)return;setSaving(true);setError('');try{await reportsApi.resolveReport(selected._id,next,resolution.trim());setSelected(null);setResolution('');await load();}catch(e:any){setError(e?.response?.data?.message||'Failed to update report');}finally{setSaving(false);}};
  return <div className="flex flex-col gap-5">
    <div className="flex items-center justify-between gap-4 flex-wrap"><div><h2 className="text-xl font-bold text-gray-900">Content Reports</h2><p className="text-sm text-muted mt-1">Review community flags and record moderation outcomes.</p></div><div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1">{STATUSES.map(tab=><button key={tab.value} onClick={()=>{setStatus(tab.value);setPage(1);}} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status===tab.value?'bg-primary text-white':'text-muted hover:bg-gray-50'}`}>{tab.label}</button>)}</div></div>
    {error&&<div className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">{loading?<div className="py-20"><LoadingSpinner size="lg"/></div>:items.length===0?<EmptyState icon={<CheckCircle2 size={40}/>} title="No reports found" description="There are no reports in this state."/>:<><table className="w-full"><thead className="bg-gray-50 border-b border-gray-100"><tr>{['Story','Reporter','Reason','Status','Reported'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-50">{items.map(r=><tr key={r._id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>{setSelected(r);setResolution(r.resolution||'');}}><td className="px-4 py-4 max-w-sm"><p className="text-sm font-semibold text-gray-900 truncate">{r.news?.title||'Deleted / unavailable story'}</p><p className="text-xs text-muted mt-1">{r.news?.status||'unknown'}</p></td><td className="px-4 py-4"><p className="text-sm font-medium text-gray-900">{r.reportedBy?.name||'Unknown'}</p><p className="text-xs text-muted">{r.reportedBy?.email||''}</p></td><td className="px-4 py-4 text-sm text-gray-700 max-w-md truncate">{r.reason}</td><td className="px-4 py-4"><span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold capitalize">{r.status}</span></td><td className="px-4 py-4 text-sm text-muted whitespace-nowrap">{safeFormat(r.createdAt,'MMM d, yyyy HH:mm')}</td></tr>)}</tbody></table><div className="px-4 py-4 border-t border-gray-100"><Pagination page={page} totalPages={Math.ceil(total/limit)} onPageChange={setPage}/></div></>}</div>
    {selected&&<Modal isOpen={true} onClose={()=>setSelected(null)} title="Review Report" size="md" footer={<><Button variant="secondary" onClick={()=>setSelected(null)}>Close</Button><Button variant="danger" icon={<CircleOff size={16}/>} loading={saving} onClick={()=>resolve('dismissed')}>Dismiss</Button><Button icon={<CheckCircle2 size={16}/>} loading={saving} onClick={()=>resolve('actioned')}>Actioned</Button></>}><div className="flex flex-col gap-4"><div className="p-4 rounded-xl bg-gray-50"><p className="text-xs text-muted uppercase tracking-wide mb-1">Reported Story</p><p className="font-semibold text-gray-900">{selected.news?.title||'Unavailable'}</p></div><div className="p-4 rounded-xl bg-amber-50 border border-amber-100"><div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2"><AlertTriangle size={16}/> Community report</div><p className="text-sm text-gray-700 leading-relaxed">{selected.reason}</p></div><Input label="Resolution / moderator note" placeholder="Explain the action taken or why the report was dismissed" value={resolution} onChange={e=>setResolution(e.target.value)}/></div></Modal>}
  </div>;
};
export default ReportsPage;
