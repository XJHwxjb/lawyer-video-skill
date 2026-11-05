export const C={bg:'#070E19',panel:'#101E30',panel2:'#14263B',white:'#F3F5F2',muted:'#92A5B6',faint:'#4A627B',blue:'#79C4F2',red:'#FF6B64',line:'#2A4057',green:'#81D5BE'};
export const F={sans:'EvidenceSans, sans-serif',serif:'EvidenceSerif, serif',mono:'Bahnschrift, Consolas, monospace'};
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const ease=(p:number)=>1-Math.pow(1-clamp(p),3);
export const anim=(f:number,start=0,duration=24)=>ease((f-start)/duration);
