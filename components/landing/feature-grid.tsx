import { Lock, Users, ShieldCheck } from 'lucide-react';

export function FeatureGrid() {
  return (
    <section className="py-20 bg-forest/5 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
          <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-forest" />
          </div>
          <h3 className="text-xl font-bold text-forest">AES-256 Encryption</h3>
          <p className="text-muted-foreground">Each key is encrypted with unique Initialization Vectors (IV) before hitting our database.</p>
        </div>
        <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
          <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-forest" />
          </div>
          <h3 className="text-xl font-bold text-forest">Team Collaboration</h3>
          <p className="text-muted-foreground">Invite members using unique team codes. Manage access at a granular team level.</p>
        </div>
        <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
          <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-forest" />
          </div>
          <h3 className="text-xl font-bold text-forest">Audit Log</h3>
          <p className="text-muted-foreground">Keep track of who created and accessed keys. Complete visibility into your security posture.</p>
        </div>
      </div>
    </section>
  );
}
